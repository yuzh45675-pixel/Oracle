const ORACLE_SYSTEM_PROMPT = require("../oracle-system-prompt");
const auth = require("./auth");
const billing = require("./billing");
const alipay = require("./alipay");
const wechat = require("./wechat");
const store = require("./store");
const feedback = require("./feedback");
const activity = require("./activity");
const events = require("./events");
const admin = require("./admin");
const restore = require("./restore");
const persistence = require("./persistence");

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE =
  process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

function registerRoutes(app) {
  store.ensureDataDir();

  if (process.env.RESTORE_SEED === "true") {
    const restored = restore.restoreFromSeed({ force: true });
    if (restored.ok) {
      console.log("[server] Restored historical data from seed (RESTORE_SEED=true)");
    }
  }

  app.get("/api/health", async (_req, res) => {
    try {
      await persistence.ensureConnected();
    } catch (e) {
      console.error("[health] ensureConnected:", e);
    }
    res.json({
      ok: true,
      features: [
        "register",
        "login",
        "wechat-login",
        "chat",
        "payment",
        "wechat-pay",
        "feedback",
        "activity",
        "events",
      ],
      storage: persistence.getMode(),
      ...persistence.getStatus(),
      hasApiKey: Boolean(DEEPSEEK_API_KEY),
      model: DEEPSEEK_MODEL,
      auth: Boolean(process.env.JWT_SECRET),
      alipay: alipay.isAlipayConfigured(),
      wechatLogin: wechat.isWechatLoginConfigured(),
      wechatPay: wechat.isWechatPayConfigured(),
      paymentDev: alipay.isDevPayment(),
    });
  });

  app.use(async (req, res, next) => {
    if (!req.path.startsWith("/api/")) {
      next();
      return;
    }
    try {
      await persistence.ensureConnected();
    } catch (e) {
      console.error("[routes] ensureConnected:", e);
    }
    next();
  });

  admin.registerAdminRoutes(app);

  /** 抽牌完成：记入活动（登录可选，匿名显示为「访客」） */
  app.post("/api/activity/draw", auth.optionalAuthMiddleware, (req, res) => {
    try {
      const body = req.body ?? {};
      const sessionId = String(body.sessionId ?? "").trim();
      if (!sessionId) {
        res.status(400).json({ error: "缺少 sessionId" });
        return;
      }
      const entry = activity.logDrawSession({
        sessionId,
        userId: req.user?.id ?? null,
        username: req.user?.username ?? "访客",
        deck: body.deck ?? null,
        spreadTitle: body.spreadTitle ?? null,
        question: body.question ?? null,
        cardNames: Array.isArray(body.cardNames) ? body.cardNames : [],
        source: body.source ?? "web",
      });
      events.logEvent({
        kind: "draw",
        userId: req.user?.id,
        username: req.user?.username ?? "访客",
        summary: `抽牌 · ${body.spreadTitle ?? "牌阵"}`,
        detail: {
          sessionId,
          deck: body.deck,
          cardNames: body.cardNames,
          question: body.question,
        },
        source: body.source ?? "web",
      });
      res.json({ ok: true, entry });
    } catch (e) {
      console.error("[activity draw]", e);
      res.status(500).json({ error: "记录失败" });
    }
  });

  /** 保存解读长图：记入活动与操作日志 */
  app.post("/api/activity/export-image", auth.optionalAuthMiddleware, (req, res) => {
    try {
      const body = req.body ?? {};
      const cardNames = Array.isArray(body.cardNames) ? body.cardNames : [];
      const spreadTitle = body.spreadTitle ?? "牌阵";
      const filename = body.filename ?? null;
      const entry = activity.logExportImage({
        userId: req.user?.id ?? null,
        username: req.user?.username ?? "访客",
        deck: body.deck ?? null,
        spreadTitle,
        question: body.question ?? null,
        cardNames,
        filename,
        source: body.source ?? "web",
        sessionId: body.sessionId ?? null,
      });
      events.logEvent({
        kind: "export_image",
        userId: req.user?.id,
        username: req.user?.username ?? "访客",
        summary: `保存长图 · ${spreadTitle} · ${cardNames.join("、") || "无牌面"}`,
        detail: {
          sessionId: body.sessionId,
          deck: body.deck,
          spreadTitle,
          question: body.question,
          cardNames,
          filename,
        },
        source: body.source ?? "web",
      });
      res.json({ ok: true, entry });
    } catch (e) {
      console.error("[activity export-image]", e);
      res.status(500).json({ error: "记录失败" });
    }
  });

  /** 内测反馈：追加写入 feedback.json */
  app.post("/api/feedback", auth.optionalAuthMiddleware, (req, res) => {
    try {
      const validated = feedback.validatePayload(req.body);
      if (!validated.ok) {
        res.json({ code: 2, msg: validated.msg });
        return;
      }
      const meta = req.body?.meta ?? {};
      feedback.appendFeedback({
        ...validated,
        userId: req.user?.id ?? meta.userId ?? null,
        username: req.user?.username ?? meta.username ?? null,
        deck: meta.deck ?? null,
        spreadTitle: meta.spreadTitle ?? null,
        question: meta.question ?? null,
        source: meta.source ?? "web",
      });
      events.logEvent({
        kind: "feedback",
        userId: req.user?.id ?? meta.userId,
        username: req.user?.username ?? meta.username ?? "访客",
        summary: `反馈 · ${validated.accuracy}`,
        detail: { accuracy: validated.accuracy, price: validated.price },
        source: meta.source ?? "web",
      });
      res.json({ code: 0, msg: "反馈成功" });
    } catch (e) {
      console.error("[feedback]", e);
      res.status(500).json({ code: -1, msg: "服务器错误，请稍后重试" });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const result = await auth.register(
        req.body?.username,
        req.body?.password,
        req.body?.avatar,
      );
      if (result.code === 0 && result.user) {
        events.logEvent({
          kind: "register",
          userId: result.user.id,
          username: result.user.username,
          summary: `注册 · ${result.user.username}`,
          source: "web",
        });
      }
      res.json(result);
    } catch (e) {
      console.error("[register]", e);
      res.status(500).json({ code: -1, msg: "服务器错误，请稍后重试" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const result = await auth.login(req.body?.username, req.body?.password);
      events.logEvent({
        kind: "login",
        userId: result.user.id,
        username: result.user.username,
        summary: `登录 · ${result.user.username}`,
        source: "web",
      });
      res.json({ ok: true, ...result });
    } catch (e) {
      res.status(e.status ?? 500).json({ error: e.message });
    }
  });

  app.post("/api/wechat/login", async (req, res) => {
    try {
      const result = await wechat.loginWithCode(req.body?.code);
      res.json({ ok: true, ...result });
    } catch (e) {
      res.status(e.status ?? 500).json({ error: e.message });
    }
  });

  app.get("/api/me", auth.authMiddleware, (req, res) => {
    res.json({ ok: true, user: billing.publicUser(req.user) });
  });

  app.patch("/api/profile/avatar", auth.authMiddleware, async (req, res) => {
    try {
      const user = await auth.updateAvatar(req.user, req.body?.avatar);
      res.json({ ok: true, user });
    } catch (e) {
      res.status(e.status ?? 500).json({ error: e.message });
    }
  });

  app.get("/api/quota", auth.authMiddleware, (req, res) => {
    res.json({ ok: true, ...billing.getQuota(req.user) });
  });

  app.post("/api/payment/create", auth.authMiddleware, async (req, res) => {
    try {
      const payload = await alipay.createReadingPayment(req.user);
      res.json({ ok: true, ...payload });
    } catch (e) {
      res.status(e.status ?? 500).json({ error: e.message });
    }
  });

  app.get("/api/payment/status/:orderId", auth.authMiddleware, (req, res) => {
    const order = store.findOrderById(req.params.orderId);
    if (!order || order.userId !== req.user.id) {
      res.status(404).json({ error: "订单不存在" });
      return;
    }
    res.json({
      ok: true,
      orderId: order.id,
      status: order.status,
      user: billing.publicUser(req.user),
    });
  });

  app.post("/api/payment/beta-unlock", auth.authMiddleware, (req, res) => {
    try {
      billing.grantBetaReading(req.user.id);
      const user = store.findUserById(req.user.id);
      res.json({
        ok: true,
        betaMode: true,
        message: "内测阶段服务免费，已解锁 1 次解读",
        user: billing.publicUser(user),
      });
    } catch (e) {
      res.status(e.status ?? 500).json({ error: e.message });
    }
  });

  app.post("/api/payment/dev-complete", auth.authMiddleware, (req, res) => {
    if (process.env.PAYMENT_DEV_MODE !== "true") {
      res.status(403).json({ error: "未开启开发支付模式" });
      return;
    }
    const orderId = req.body?.orderId;
    const order = store.findOrderById(orderId);
    if (!order || order.userId !== req.user.id) {
      res.status(404).json({ error: "订单不存在" });
      return;
    }
    alipay.fulfillOrder(orderId, `dev_${Date.now()}`);
    const user = store.findUserById(req.user.id);
    res.json({ ok: true, user: billing.publicUser(user) });
  });

  app.post("/api/payment/wechat/create", auth.authMiddleware, async (req, res) => {
    try {
      const openid = req.user.wechatOpenId;
      if (!openid) {
        res.status(400).json({ error: "请使用微信小程序登录后再支付" });
        return;
      }
      const payload = await wechat.createJsapiPayment(req.user, openid);
      res.json({ ok: true, ...payload });
    } catch (e) {
      res.status(e.status ?? 500).json({ error: e.message, orderId: e.orderId });
    }
  });

  app.post(
    "/api/payment/wechat/dev-complete",
    auth.authMiddleware,
    (req, res) => {
      if (process.env.PAYMENT_DEV_MODE !== "true") {
        res.status(403).json({ error: "未开启开发支付模式" });
        return;
      }
      const orderId = req.body?.orderId;
      const order = store.findOrderById(orderId);
      if (!order || order.userId !== req.user.id) {
        res.status(404).json({ error: "订单不存在" });
        return;
      }
      wechat.fulfillOrder(orderId, `wx_dev_${Date.now()}`);
      const user = store.findUserById(req.user.id);
      res.json({ ok: true, user: billing.publicUser(user) });
    },
  );

  app.post("/api/chat", auth.authMiddleware, async (req, res) => {
    if (!DEEPSEEK_API_KEY) {
      res.status(500).json({
        error: "Missing DEEPSEEK_API_KEY. Add it to .env in project root.",
      });
      return;
    }

    const { message, messages } = req.body ?? {};

    let chatMessages;
    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages.filter((m) => m && m.role !== "system");
    } else if (typeof message === "string" && message.trim()) {
      chatMessages = [{ role: "user", content: message.trim() }];
    } else {
      res.status(400).json({
        error: 'Send JSON: { "message": "your text" } or { "messages": [...] }',
      });
      return;
    }

    chatMessages = [
      { role: "system", content: ORACLE_SYSTEM_PROMPT },
      ...chatMessages,
    ];

    if (!billing.canUseReading(req.user)) {
      const quota = billing.publicUser(req.user);
      res.status(402).json({
        error: billing.BETA_MODE
          ? "今日 3 次免费解读已用完，请在内测支付页继续（当前免费）"
          : `今日 ${quota.dailyFreeLimit} 次免费解读已用完，请购买 1 次解读`,
        code: "PAYMENT_REQUIRED",
        betaMode: billing.BETA_MODE,
        readingPrice: billing.READING_PRICE,
        user: quota,
      });
      return;
    }

    try {
      const upstream = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: chatMessages,
          stream: false,
        }),
      });

      const data = await upstream.json();

      if (!upstream.ok) {
        res.status(upstream.status).json({
          error: data?.error?.message ?? data?.message ?? "DeepSeek API error",
          details: data,
        });
        return;
      }

      const reply =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        "";

      const consumed = billing.consumeReading(req.user);
      const meta = req.body?.readingMeta ?? {};
      activity.logReading({
        userId: req.user.id,
        username: req.user.username,
        deck: meta.deck,
        spreadTitle: meta.spreadTitle,
        question: meta.question,
        cardNames: meta.cardNames,
        kind: meta.kind ?? "initial",
        billing: consumed.type,
        source: meta.source ?? "web",
        sessionId: meta.sessionId ?? null,
      });
      events.logEvent({
        kind: meta.kind === "followup" ? "ai_followup" : "ai_reading",
        userId: req.user.id,
        username: req.user.username,
        summary: `${meta.kind === "followup" ? "AI追问" : "AI解读"} · ${meta.spreadTitle ?? "牌阵"}`,
        detail: {
          deck: meta.deck,
          question: meta.question,
          cardNames: meta.cardNames,
          billing: consumed.type,
        },
        source: meta.source ?? "web",
      });

      res.json({
        reply,
        model: data?.model ?? DEEPSEEK_MODEL,
        usage: data?.usage ?? null,
        billing: { type: consumed.type },
        user: billing.publicUser(consumed.user),
      });
    } catch (err) {
      console.error("[deepseek]", err);
      res.status(502).json({
        error: err instanceof Error ? err.message : "Upstream request failed",
      });
    }
  });
}

module.exports = { registerRoutes };
