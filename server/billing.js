const store = require("./store");

const READING_PRICE = Number(process.env.READING_PRICE) || 0.2;
const DAILY_FREE_LIMIT = Number(process.env.DAILY_FREE_READINGS) || 3;
/** 内测：超出免费次数后走「支付页」展示，点击后免费解锁 1 次解读 */
const BETA_MODE = process.env.BETA_MODE !== "false";

function todayKey() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function normalizeFreeQuota(user) {
  const today = todayKey();
  if (user.freeQuotaDate === today && typeof user.freeUsedToday === "number") {
    return user;
  }
  let used = 0;
  if (user.freeQuotaDate === today) {
    used = user.freeUsedToday ?? 0;
  } else if (user.lastFreeDate === today) {
    used = 1;
  }
  return { ...user, freeQuotaDate: today, freeUsedToday: used };
}

function getFreeUsage(user) {
  const u = normalizeFreeQuota(user);
  const used = Math.min(u.freeUsedToday ?? 0, DAILY_FREE_LIMIT);
  const remaining = Math.max(0, DAILY_FREE_LIMIT - used);
  return { user: u, used, remaining, limit: DAILY_FREE_LIMIT };
}

function publicUser(user) {
  const { used, remaining, limit } = getFreeUsage(user);
  const today = todayKey();
  return {
    id: user.id,
    username: user.username,
    credits: user.credits ?? 0,
    freeAvailable: remaining > 0,
    freeRemaining: remaining,
    freeUsedToday: used,
    dailyFreeLimit: limit,
    betaMode: BETA_MODE,
    readingPrice: READING_PRICE,
    today,
  };
}

function getQuota(user) {
  return publicUser(user);
}

function canUseReading(user) {
  const { remaining } = getFreeUsage(user);
  if (remaining > 0) return true;
  return (user.credits ?? 0) > 0;
}

/** @returns {{ type: 'free' | 'credit', user: object }} */
function consumeReading(user) {
  const { user: u, remaining } = getFreeUsage(user);

  if (remaining > 0) {
    u.freeUsedToday = (u.freeUsedToday ?? 0) + 1;
    u.freeQuotaDate = todayKey();
    u.lastFreeDate = u.freeQuotaDate;
    store.updateUser(u);
    return { type: "free", user: u };
  }

  if ((u.credits ?? 0) > 0) {
    u.credits -= 1;
    store.updateUser(u);
    return { type: "credit", user: u };
  }

  const err = new Error("PAYMENT_REQUIRED");
  err.code = "PAYMENT_REQUIRED";
  throw err;
}

function addCredits(userId, count = 1) {
  const user = store.findUserById(userId);
  if (!user) return null;
  user.credits = (user.credits ?? 0) + count;
  return store.updateUser(user);
}

/** 内测：模拟支付成功，增加 1 次解读额度 */
function grantBetaReading(userId) {
  if (!BETA_MODE) {
    const err = new Error("内测免费已关闭");
    err.status = 403;
    throw err;
  }
  return addCredits(userId, 1);
}

module.exports = {
  READING_PRICE,
  DAILY_FREE_LIMIT,
  BETA_MODE,
  publicUser,
  getQuota,
  canUseReading,
  consumeReading,
  addCredits,
  grantBetaReading,
};
