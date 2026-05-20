/**
 * 内测反馈：追加写入项目根目录 feedback.json（不覆盖历史记录）
 */
const fs = require("fs");
const path = require("path");

const FEEDBACK_FILE = path.join(__dirname, "..", "feedback.json");

const ACCURACY_OPTIONS = ["很准", "还行", "不准"];
const PRICE_OPTIONS = ["不愿意", "接受一次0.2元的付费制度"];

/** 若 feedback.json 不存在则创建空列表结构 */
function ensureFeedbackFile() {
  if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(
      FEEDBACK_FILE,
      JSON.stringify({ feedback: [] }, null, 2),
      "utf8",
    );
  }
}

/** 读取当前全部反馈（管理/调试用） */
function readAll() {
  ensureFeedbackFile();
  try {
    return JSON.parse(fs.readFileSync(FEEDBACK_FILE, "utf8"));
  } catch {
    return { feedback: [] };
  }
}

/**
 * 校验 POST body，返回 { ok, msg? } 或 { ok, accuracy, dislike, price }
 */
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
  // 选填：有内容时限制 20～200 字
  if (dislike && (dislike.length < 20 || dislike.length > 200)) {
    return {
      ok: false,
      msg: "不满意之处须留空，或填写 20～200 字",
    };
  }

  return { ok: true, accuracy, dislike, price };
}

/** 追加一条反馈并写回文件 */
function appendFeedback({ accuracy, dislike, price }) {
  ensureFeedbackFile();
  const data = readAll();
  if (!Array.isArray(data.feedback)) data.feedback = [];

  const entry = {
    accuracy,
    dislike: dislike || "",
    price,
    timestamp: new Date().toISOString(),
  };

  data.feedback.push(entry);
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2), "utf8");
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
