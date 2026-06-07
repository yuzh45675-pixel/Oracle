const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");
const MAX_READINGS = 800;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ACTIVITY_FILE)) {
    fs.writeFileSync(
      ACTIVITY_FILE,
      JSON.stringify({ readings: [] }, null, 2),
      "utf8",
    );
  }
}

function readAll() {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(ACTIVITY_FILE, "utf8"));
    return Array.isArray(data.readings) ? data.readings : [];
  } catch {
    return [];
  }
}

function writeAll(readings) {
  ensureFile();
  fs.writeFileSync(
    ACTIVITY_FILE,
    JSON.stringify({ readings }, null, 2),
    "utf8",
  );
}

function logReading({
  userId,
  username,
  deck,
  spreadTitle,
  question,
  cardNames,
  kind = "initial",
  billing = "unknown",
  source = "web",
}) {
  const readings = readAll();
  const entry = {
    id: `rd_${crypto.randomUUID()}`,
    userId: userId ?? null,
    username: username ?? "匿名",
    deck: deck ?? null,
    spreadTitle: spreadTitle ?? null,
    question: String(question ?? "").slice(0, 200) || null,
    cardNames: Array.isArray(cardNames) ? cardNames.slice(0, 24) : [],
    kind,
    billing,
    source,
    createdAt: new Date().toISOString(),
  };
  readings.unshift(entry);
  if (readings.length > MAX_READINGS) readings.length = MAX_READINGS;
  writeAll(readings);
  return entry;
}

function listReadings(limit = 100) {
  return readAll().slice(0, Math.min(limit, MAX_READINGS));
}

function stats() {
  const readings = readAll();
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = readings.filter((r) =>
    r.createdAt?.startsWith(today),
  ).length;
  return {
    totalReadings: readings.length,
    todayReadings: todayCount,
  };
}

module.exports = {
  logReading,
  listReadings,
  stats,
};
