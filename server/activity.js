const crypto = require("crypto");
const persistence = require("./persistence");

const MAX_READINGS = 800;

function readAll() {
  persistence.ensureReady();
  const data = persistence.get("activity");
  return Array.isArray(data.readings) ? data.readings : [];
}

function writeAll(readings) {
  persistence.set("activity", { readings });
}

function appendEntry(entry) {
  const readings = readAll();
  readings.unshift(entry);
  if (readings.length > MAX_READINGS) readings.length = MAX_READINGS;
  writeAll(readings);
  return entry;
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
  sessionId,
}) {
  const readings = readAll();
  if (sessionId && kind !== "followup") {
    const dup = readings.find(
      (r) => r.sessionId === sessionId && r.kind === kind,
    );
    if (dup) return dup;
  }
  return appendEntry({
    id: `rd_${crypto.randomUUID()}`,
    sessionId: sessionId ?? null,
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
  });
}

function logDrawSession({
  sessionId,
  userId,
  username,
  deck,
  spreadTitle,
  question,
  cardNames,
  source = "web",
}) {
  return logReading({
    sessionId,
    userId,
    username,
    deck,
    spreadTitle,
    question,
    cardNames,
    kind: "draw",
    billing: "none",
    source,
  });
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

function importReadings(entries) {
  const readings = readAll();
  const ids = new Set(readings.map((r) => r.id));
  let added = 0;

  for (const entry of entries) {
    if (!entry?.id || ids.has(entry.id)) continue;
    readings.push({
      cardNames: [],
      deck: null,
      spreadTitle: null,
      question: null,
      kind: "initial",
      billing: "unknown",
      source: "web",
      username: "匿名",
      ...entry,
    });
    ids.add(entry.id);
    added += 1;
  }

  readings.sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
  if (readings.length > MAX_READINGS) readings.length = MAX_READINGS;
  writeAll(readings);
  return { added, total: readings.length };
}

module.exports = {
  logReading,
  logDrawSession,
  listReadings,
  stats,
  importReadings,
};
