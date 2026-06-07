const fs = require("fs");
const path = require("path");
const store = require("./store");
const feedback = require("./feedback");
const activity = require("./activity");

const SEED_FILE = path.join(__dirname, "seed", "history-backup.json");

function loadSeed() {
  if (!fs.existsSync(SEED_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
  } catch (e) {
    console.error("[restore] failed to read seed:", e);
    return null;
  }
}

function feedbackKey(entry) {
  return [
    entry.timestamp ?? "",
    entry.accuracy ?? "",
    entry.dislike ?? "",
    entry.price ?? "",
  ].join("|");
}

function mergeUsers(seedUsers) {
  const existing = store.getUsers();
  const byId = new Map(existing.map((u) => [u.id, u]));
  let added = 0;
  let updated = 0;

  for (const user of seedUsers ?? []) {
    if (!user?.id) continue;
    if (byId.has(user.id)) {
      byId.set(user.id, { ...byId.get(user.id), ...user });
      updated += 1;
    } else {
      byId.set(user.id, user);
      added += 1;
    }
  }

  store.saveUsers([...byId.values()]);
  return { added, updated, total: byId.size };
}

function mergeFeedback(seedFeedback) {
  const data = feedback.readAll();
  const list = Array.isArray(data.feedback) ? data.feedback : [];
  const keys = new Set(list.map(feedbackKey));
  let added = 0;

  for (const entry of seedFeedback ?? []) {
    const key = feedbackKey(entry);
    if (keys.has(key)) continue;
    list.push(entry);
    keys.add(key);
    added += 1;
  }

  fs.writeFileSync(
    feedback.FEEDBACK_FILE,
    JSON.stringify({ feedback: list }, null, 2),
    "utf8",
  );
  return { added, total: list.length };
}

function mergeReadings(seedReadings) {
  return activity.importReadings(seedReadings ?? []);
}

function isDatabaseEmpty() {
  const users = store.getUsers();
  const fb = feedback.readAll().feedback ?? [];
  const readings = activity.listReadings(1);
  return users.length === 0 && fb.length === 0 && readings.length === 0;
}

function restoreFromSeed({ force = false } = {}) {
  const seed = loadSeed();
  if (!seed) {
    return { ok: false, error: "seed file missing" };
  }

  if (!force && !isDatabaseEmpty()) {
    return { ok: false, skipped: true, reason: "database not empty" };
  }

  const users = mergeUsers(seed.users);
  const fb = mergeFeedback(seed.feedback);
  const readings = mergeReadings(seed.readings);

  console.log(
    `[restore] imported users +${users.added}/~${users.total}, feedback +${fb.added}, readings +${readings.added}`,
  );

  return {
    ok: true,
    users,
    feedback: fb,
    readings,
    note: seed.note ?? null,
    exportedAt: seed.exportedAt ?? null,
  };
}

module.exports = {
  restoreFromSeed,
  isDatabaseEmpty,
  loadSeed,
};
