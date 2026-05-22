const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const store = require("./store");
const billing = require("./billing");
const { normalizeAvatar } = require("./avatar");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "7d";

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "请先登录" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    const user = store.findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ error: "用户不存在或已失效" });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "登录已过期，请重新登录" });
  }
}

/**
 * @returns {{ code: 0, msg: string, token: string, user: object } | { code: 1|2, msg: string }}
 */
async function register(username, password, avatarInput) {
  const name = String(username ?? "").trim();
  const pass = String(password ?? "");

  if (!name || pass.length < 6) {
    return { code: 2, msg: "用户名或密码格式不正确" };
  }

  if (store.findUserByUsername(name)) {
    return { code: 1, msg: "用户名已被注册" };
  }

  const parsed = normalizeAvatar(avatarInput);
  if (!parsed.ok) {
    return { code: 2, msg: parsed.msg };
  }

  const passwordHash = await bcrypt.hash(pass, 10);
  const user = store.createUser({
    username: name,
    passwordHash,
    ...parsed.avatar,
  });
  const token = signToken(user);

  return {
    code: 0,
    msg: "注册成功",
    token,
    user: billing.publicUser(user),
  };
}

async function login(username, password) {
  const name = String(username ?? "").trim();
  const pass = String(password ?? "");
  const user = store.findUserByUsername(name);

  if (!user) {
    const err = new Error("用户名或密码错误");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(pass, user.passwordHash);
  if (!ok) {
    const err = new Error("用户名或密码错误");
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  return { token, user: billing.publicUser(user) };
}

async function updateAvatar(user, avatarInput) {
  const parsed = normalizeAvatar(avatarInput);
  if (!parsed.ok) {
    const err = new Error(parsed.msg);
    err.status = 400;
    throw err;
  }

  const next = {
    ...user,
    ...parsed.avatar,
  };
  store.updateUser(next);
  return billing.publicUser(next);
}

module.exports = {
  authMiddleware,
  register,
  login,
  updateAvatar,
  signToken,
  JWT_SECRET,
};
