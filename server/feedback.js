/**
 * 内测反馈：通过 persistence 写入（PostgreSQL 或 feedback.json）
 */
const path = require("path");
const persistence = require("./persistence");

const ACCURACY_OPTIONS = ["很准", "还行", "不准"];
const PRICE_OPTIONS = ["不愿意", "接受一次0.2元的付费制度"];

const FEEDBACK_FILE = path.join(__dirname, "..", "feedback.json");

function ensureFeedbackFile() {
  persistence.ensureReady();
}

function readAll() {
  ensureFeedbackFile();
  const data = persistence.get("feedback");
  return Array.isArray(data.feedback) ? data : { feedback: [] };
}

function validatePayload(body) {
  const accuracy = String(body?.accuracy ?? "").trim();
  const dislike = String(body?.dislike ?? "").trim();
  const price = String(body?.price ?? "").trim();

  if (!ACCURACY_OPTIONS.includes(accuracy)) {
    return { ok: false, msg: "请选择解读准确度" };
  }
  if (!PRICE_OPTIONS.includes(price)) {
    return { ok: false, msg: "请选择付费意愿" };
  }
  if (dislike && (dislike.length < 20 || dislike.length > 200)) {
    return {
      ok: false,
      msg: "不满意之处须留空，或填写 20～200 字",
    };
  }

  return { ok: true, accuracy, dislike, price };
}

function appendFeedback({
  accuracy,
  dislike,
  price,
  userId,
  username,
  deck,
  spreadTitle,
  question,
  source,
}) {
  const data = readAll();
  if (!Array.isArray(data.feedback)) data.feedback = [];

  const entry = {
    accuracy,
    dislike: dislike || "",
    price,
    userId: userId ?? null,
    username: username ?? null,
    deck: deck ?? null,
    spreadTitle: spreadTitle ?? null,
    question: question ? String(question).slice(0, 200) : null,
    source: source ?? "web",
    timestamp: new Date().toISOString(),
  };

  data.feedback.push(entry);
  persistence.set("feedback", data);
  return entry;
}

module.exports = {
  FEEDBACK_FILE,
  ACCURACY_OPTIONS,
  PRICE_OPTIONS,
  validatePayload,
  appendFeedback,
  readAll,
};
