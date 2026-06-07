const crypto = require("crypto");
const persistence = require("./persistence");

const MAX_EVENTS = 2000;

function readAll() {
  persistence.ensureReady();
  const data = persistence.get("events");
  return Array.isArray(data.events) ? data.events : [];
}

function writeAll(events) {
  persistence.set("events", { events });
}

function logEvent({
  kind,
  userId,
  username,
  summary,
  detail,
  source = "web",
}) {
  const events = readAll();
  const entry = {
    id: `ev_${crypto.randomUUID()}`,
    kind,
    userId: userId ?? null,
    username: username ?? "访客",
    summary: String(summary ?? kind).slice(0, 120),
    detail: detail ?? null,
    source,
    createdAt: new Date().toISOString(),
  };
  events.unshift(entry);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  writeAll(events);
  return entry;
}

function listEvents(limit = 100) {
  return readAll().slice(0, Math.min(limit, MAX_EVENTS));
}

function stats() {
  const events = readAll();
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalEvents: events.length,
    todayEvents: events.filter((e) => e.createdAt?.startsWith(today)).length,
  };
}

function importEvents(entries) {
  const events = readAll();
  const ids = new Set(events.map((e) => e.id));
  let added = 0;
  for (const entry of entries ?? []) {
    if (!entry?.id || ids.has(entry.id)) continue;
    events.push(entry);
    ids.add(entry.id);
    added += 1;
  }
  events.sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  writeAll(events);
  return { added, total: events.length };
}

module.exports = {
  logEvent,
  listEvents,
  stats,
  importEvents,
};
