const crypto = require("crypto");
const persistence = require("./persistence");

function ensureDataDir() {
  persistence.ensureReady();
}

function getUsers() {
  return persistence.get("users").users ?? [];
}

function saveUsers(users) {
  persistence.set("users", { users });
}

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
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
  return persistence.get("orders").orders ?? [];
}

function saveOrders(orders) {
  persistence.set("orders", { orders });
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
