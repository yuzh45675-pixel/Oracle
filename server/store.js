const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders: [] }, null, 2), "utf8");
  }
}

function readJson(file, fallback) {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function getUsers() {
  return readJson(USERS_FILE, { users: [] }).users;
}

function saveUsers(users) {
  writeJson(USERS_FILE, { users });
}

function findUserByUsername(username) {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  );
}

function findUserById(id) {
  return getUsers().find((u) => u.id === id);
}

function findUserByOpenId(openid) {
  return getUsers().find((u) => u.wechatOpenId === openid);
}

function createUser({ username, passwordHash, avatarType, avatarTheme, avatarData }) {
  const users = getUsers();
  const user = {
    id: newId("usr"),
    username,
    passwordHash,
    avatarType: avatarType ?? "theme",
    avatarTheme: avatarTheme ?? "astral-void",
    avatarData: avatarData ?? null,
    credits: 0,
    lastFreeDate: null,
    freeQuotaDate: null,
    freeUsedToday: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

function createWechatUser({ openid, unionid, nickName }) {
  const users = getUsers();
  let base = `wx_${String(openid).slice(-8)}`;
  let username = base;
  let n = 0;
  while (findUserByUsername(username)) {
    n += 1;
    username = `${base}${n}`;
  }

  const user = {
    id: newId("usr"),
    username,
    passwordHash: "",
    authProvider: "wechat",
    wechatOpenId: openid,
    wechatUnionId: unionid ?? null,
    wechatNickName: nickName ?? null,
    avatarType: "theme",
    avatarTheme: "astral-void",
    avatarData: null,
    credits: 0,
    lastFreeDate: null,
    freeQuotaDate: null,
    freeUsedToday: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

function updateUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx === -1) return null;
  users[idx] = user;
  saveUsers(users);
  return user;
}

function getOrders() {
  return readJson(ORDERS_FILE, { orders: [] }).orders;
}

function saveOrders(orders) {
  writeJson(ORDERS_FILE, { orders });
}

function findOrderById(id) {
  return getOrders().find((o) => o.id === id);
}

function createOrder({ userId, amount, subject, channel = "alipay" }) {
  const orders = getOrders();
  const order = {
    id: newId("ord"),
    userId,
    amount,
    subject,
    channel,
    status: "pending",
    createdAt: new Date().toISOString(),
    paidAt: null,
    alipayTradeNo: null,
    wechatTransactionId: null,
  };
  orders.push(order);
  saveOrders(orders);
  return order;
}

function markOrderPaid(orderId, tradeNo, channel = "alipay") {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  if (order.status === "paid") return order;
  order.status = "paid";
  order.paidAt = new Date().toISOString();
  if (channel === "wechat") {
    order.wechatTransactionId = tradeNo ?? null;
  } else {
    order.alipayTradeNo = tradeNo ?? null;
  }
  saveOrders(orders);
  return order;
}

module.exports = {
  ensureDataDir,
  getUsers,
  saveUsers,
  findUserByUsername,
  findUserById,
  findUserByOpenId,
  createUser,
  createWechatUser,
  updateUser,
  getOrders,
  findOrderById,
  createOrder,
  markOrderPaid,
};
