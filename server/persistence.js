/**
 * 统一数据持久化：有 DATABASE_URL 时用 PostgreSQL（重启不丢），否则用本地 JSON。
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE_MAP = {
  users: path.join(DATA_DIR, "users.json"),
  orders: path.join(DATA_DIR, "orders.json"),
  activity: path.join(DATA_DIR, "activity.json"),
  feedback: path.join(__dirname, "..", "feedback.json"),
  events: path.join(DATA_DIR, "events.json"),
};

const cache = new Map();
let pool = null;
let neonSql = null;
let driver = null;
let mode = "file";
let ready = false;
let lastDbError = null;

function getDatabaseUrl() {
  const raw =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    "";
  return normalizeDatabaseUrl(raw);
}

function isPostgres() {
  return Boolean(getDatabaseUrl());
}

function normalizeDatabaseUrl(raw) {
  let url = String(raw ?? "").trim();
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  if (!url) return "";
  if (url.startsWith("postgres://")) {
    url = `postgresql://${url.slice("postgres://".length)}`;
  }
  if (!url.includes("sslmode=")) {
    url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
  return url;
}

function defaultForKey(key) {
  if (key === "users") return { users: [] };
  if (key === "orders") return { orders: [] };
  if (key === "activity") return { readings: [] };
  if (key === "feedback") return { feedback: [] };
  if (key === "events") return { events: [] };
  return {};
}

function readFileKey(key) {
  const file = FILE_MAP[key];
  if (!file) return defaultForKey(key);
  try {
    if (!fs.existsSync(file)) return defaultForKey(key);
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return defaultForKey(key);
  }
}

function writeFileKey(key, value) {
  const file = FILE_MAP[key];
  if (!file) return;
  if (key !== "feedback" && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

function loadFileCache() {
  for (const key of Object.keys(FILE_MAP)) {
    cache.set(key, readFileKey(key));
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runNeonInit(connectionString) {
  const { neon } = require("@neondatabase/serverless");
  neonSql = neon(connectionString);
  await neonSql`CREATE TABLE IF NOT EXISTS app_data (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  for (const key of Object.keys(FILE_MAP)) {
    const rows = await neonSql`SELECT value FROM app_data WHERE key = ${key}`;
    if (rows[0]?.value) {
      cache.set(
        key,
        typeof rows[0].value === "string"
          ? JSON.parse(rows[0].value)
          : rows[0].value,
      );
      continue;
    }
    const local = readFileKey(key);
    cache.set(key, local);
    await neonSql`
      INSERT INTO app_data (key, value)
      VALUES (${key}, ${local})
      ON CONFLICT (key) DO NOTHING
    `;
  }
  driver = "neon";
}

async function runPgInit(connectionString) {
  const { Pool } = require("pg");
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 30_000,
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const key of Object.keys(FILE_MAP)) {
    const result = await pool.query(
      "SELECT value FROM app_data WHERE key = $1",
      [key],
    );
    if (result.rows[0]?.value) {
      cache.set(key, result.rows[0].value);
      continue;
    }
    const local = readFileKey(key);
    cache.set(key, local);
    await pool.query(
      `INSERT INTO app_data (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(local)],
    );
  }
  driver = "pg";
}

function poolerFallbackUrl(url) {
  if (!url.includes("neon.tech") || url.includes("-pooler.")) return null;
  return url.replace(/\.neon\.tech\b/, "-pooler.neon.tech");
}

async function tryConnect(connectionString, useNeon) {
  if (useNeon) {
    await runNeonInit(connectionString);
  } else {
    await runPgInit(connectionString);
  }
}

async function initPostgres() {
  const connectionString = getDatabaseUrl();
  const useNeon =
    connectionString.includes("neon.tech") ||
    process.env.USE_NEON_DRIVER === "true";

  const urls = [connectionString];
  const pooler = poolerFallbackUrl(connectionString);
  if (pooler) urls.push(pooler);

  let lastError = null;

  for (const url of urls) {
    for (let i = 1; i <= 2; i += 1) {
      try {
        console.log(
          `[persistence] connecting (${useNeon ? "neon" : "pg"}) attempt ${i}…`,
        );
        await tryConnect(url, useNeon);
        lastDbError = null;
        return;
      } catch (e) {
        lastError = e;
        lastDbError = e instanceof Error ? e.message : String(e);
        console.error(`[persistence] DB failed (${url.slice(0, 40)}…):`, lastDbError);
        pool = null;
        neonSql = null;
        driver = null;
        if (i < 2) await sleep(4000);
      }
    }
  }

  throw lastError ?? new Error("PostgreSQL connect failed");
}

async function reconnect() {
  ready = false;
  pool = null;
  neonSql = null;
  driver = null;
  return init();
}

async function saveToPostgres(key, value) {
  if (driver === "neon" && neonSql) {
    await neonSql`
      INSERT INTO app_data (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = ${value}, updated_at = NOW()
    `;
    return;
  }
  if (driver === "pg" && pool) {
    await pool.query(
      `INSERT INTO app_data (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()`,
      [key, JSON.stringify(value)],
    );
  }
}

async function init() {
  if (ready) return { mode };
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  loadFileCache();

  if (isPostgres()) {
    try {
      await Promise.race([
        initPostgres(),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("PostgreSQL connect timeout (25s)")),
            25_000,
          );
        }),
      ]);
      mode = "postgres";
      console.log(
        `[persistence] PostgreSQL enabled via ${driver} — data survives redeploy`,
      );
    } catch (e) {
      lastDbError = e instanceof Error ? e.message : String(e);
      console.error(
        "[persistence] PostgreSQL init failed, using files for now:",
        lastDbError,
      );
      mode = "file";
      void retryPostgresLater();
    }
  } else {
    mode = "file";
    lastDbError = "DATABASE_URL not configured on server";
    console.warn(
      "[persistence] DATABASE_URL not set — JSON files only (Render redeploy may wipe data)",
    );
  }

  ready = true;
  return { mode };
}

let retryTimer = null;

function retryPostgresLater() {
  if (!isPostgres() || mode === "postgres" || retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void (async () => {
      try {
        await initPostgres();
        mode = "postgres";
        lastDbError = null;
        console.log("[persistence] PostgreSQL connected on retry");
      } catch (e) {
        lastDbError = e instanceof Error ? e.message : String(e);
        console.error("[persistence] PostgreSQL retry failed:", lastDbError);
        retryPostgresLater();
      }
    })();
  }, 45_000);
}

function getMode() {
  return mode;
}

function getStatus() {
  return {
    mode,
    driver,
    hasDatabaseUrl: isPostgres(),
    lastDbError: mode === "postgres" ? null : (lastDbError ?? "connecting or not started"),
  };
}

function get(key) {
  if (!ready) return readFileKey(key);
  return cache.get(key) ?? defaultForKey(key);
}

function set(key, value) {
  cache.set(key, value);
  if (mode === "postgres" && (neonSql || pool)) {
    void saveToPostgres(key, value).catch((e) => {
      lastDbError = e.message;
      console.error(`[persistence] save ${key} failed:`, e.message);
    });
    return;
  }
  writeFileKey(key, value);
}

function ensureReady() {
  if (!ready) {
    for (const key of Object.keys(FILE_MAP)) {
      if (!cache.has(key)) cache.set(key, readFileKey(key));
    }
    ready = true;
  }
}

module.exports = {
  init,
  reconnect,
  get,
  set,
  getMode,
  getStatus,
  isPostgres,
  ensureReady,
  DATA_DIR,
};
