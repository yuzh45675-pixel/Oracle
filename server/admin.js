const store = require("./store");
const feedback = require("./feedback");
const activity = require("./activity");
const billing = require("./billing");
const restore = require("./restore");

/** 内置管理密钥；Render 上设置 ADMIN_PASSWORD 可覆盖 */
const DEFAULT_ADMIN_PASSWORD = "Oracle-0defcbcb-6b4b3bf4";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
}

function adminMiddleware(req, res, next) {
  const configured = getAdminPassword();
  if (!configured) {
    res.status(503).json({
      error: "管理后台未启用：请在服务器环境变量设置 ADMIN_PASSWORD",
    });
    return;
  }
  const key =
    req.headers["x-admin-key"] ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : "");
  if (key !== configured) {
    res.status(401).json({ error: "管理密钥不正确" });
    return;
  }
  next();
}

function registerAdminRoutes(app) {
  app.post("/api/admin/verify", (req, res) => {
    const configured = getAdminPassword();
    if (!configured) {
      res.status(503).json({ ok: false, error: "未配置 ADMIN_PASSWORD" });
      return;
    }
    const key = String(req.body?.password ?? "").trim();
    if (key !== configured) {
      res.status(401).json({ ok: false, error: "密钥错误" });
      return;
    }
    res.json({ ok: true });
  });

  app.post("/api/admin/restore", adminMiddleware, (req, res) => {
    try {
      const result = restore.restoreFromSeed({
        force: Boolean(req.body?.force),
      });
      if (!result.ok && result.skipped) {
        res.json({
          ok: false,
          skipped: true,
          message: "数据库里已有数据。若要合并历史备份，请传 { \"force\": true }",
        });
        return;
      }
      res.json(result);
    } catch (e) {
      console.error("[admin restore]", e);
      res.status(500).json({ ok: false, error: "恢复失败" });
    }
  });

  app.get("/api/admin/overview", adminMiddleware, (_req, res) => {
    const users = store.getUsers();
    const orders = store.getOrders();
    const fb = feedback.readAll().feedback ?? [];
    const act = activity.stats();
    const paidOrders = orders.filter((o) => o.status === "paid").length;

    res.json({
      ok: true,
      stats: {
        users: users.length,
        wechatUsers: users.filter((u) => u.authProvider === "wechat").length,
        paidOrders,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        feedback: fb.length,
        ...act,
      },
      readings: activity.listReadings(80),
      feedback: fb.slice(-80).reverse(),
      users: users
        .slice()
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        .slice(0, 50)
        .map((u) => ({
          id: u.id,
          username: u.username,
          authProvider: u.authProvider ?? "password",
          credits: u.credits ?? 0,
          freeUsedToday: u.freeUsedToday ?? 0,
          createdAt: u.createdAt,
        })),
      orders: orders
        .slice()
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        .slice(0, 40)
        .map((o) => {
          const user = store.findUserById(o.userId);
          return {
            ...o,
            username: user?.username ?? "—",
          };
        }),
    });
  });

  app.get("/admin", (_req, res) => {
    const front =
      process.env.FRONTEND_URL?.replace(/\/$/, "") ||
      process.env.CORS_ORIGIN?.split(",")[0]?.trim() ||
      "";
    if (front) {
      res.redirect(302, `${front}/manage`);
      return;
    }
    res.type("text/html; charset=utf-8").send(
      "<!DOCTYPE html><html><body style='font-family:sans-serif;padding:2rem;background:#0a0a0f;color:#e8e4dc'>" +
        "<h1>Oracle 管理后台</h1><p>请在你的网站地址后加 <code>/manage</code> 打开，例如：<code>https://你的域名/manage</code></p>" +
        "<p>需在服务器设置环境变量 <code>ADMIN_PASSWORD</code>。</p></body></html>",
    );
  });
}

module.exports = {
  adminMiddleware,
  registerAdminRoutes,
  getAdminPassword,
};
