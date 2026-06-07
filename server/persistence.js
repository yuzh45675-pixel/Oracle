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
let mode = "file";
let ready = false;

function isPostgres() {
  return Boolean(process.env.DATABASE_URL?.trim());
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

function normalizeDatabaseUrl(raw) {
  let url = String(raw ?? "").trim();
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  return url;
}

async function initPostgres() {
  const { Pool } = require("pg");
  const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 8_000,
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
}

function loadFileCache() {
  for (const key of Object.keys(FILE_MAP)) {
    cache.set(key, readFileKey(key));
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
          setTimeout(() => reject(new Error("PostgreSQL connect timeout (8s)")), 8_500);
        }),
      ]);
      mode = "postgres";
      console.log("[persistence] PostgreSQL enabled — data survives redeploy");
    } catch (e) {
      console.error("[persistence] PostgreSQL init failed, using files for now:", e.message);
      mode = "file";
      void retryPostgresLater();
    }
  } else {
    mode = "file";
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
        console.log("[persistence] PostgreSQL connected on retry");
      } catch (e) {
        console.error("[persistence] PostgreSQL retry failed:", e.message);
        retryPostgresLater();
      }
    })();
  }, 60_000);
}

function getMode() {
  return mode;
}

function get(key) {
  if (!ready) return readFileKey(key);
  return cache.get(key) ?? defaultForKey(key);
}

function set(key, value) {
  cache.set(key, value);
  if (mode === "postgres" && pool) {
    void pool
      .query(
        `INSERT INTO app_data (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()`,
        [key, JSON.stringify(value)],
      )
      .catch((e) => console.error(`[persistence] save ${key} failed:`, e.message));
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
  get,
  set,
  getMode,
  isPostgres,
  ensureReady,
  DATA_DIR,
};
