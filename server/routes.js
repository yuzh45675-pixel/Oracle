const ORACLE_SYSTEM_PROMPT = require("../oracle-system-prompt");
const auth = require("./auth");
const billing = require("./billing");
const alipay = require("./alipay");
const store = require("./store");
const feedback = require("./feedback");

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE =
  process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

function registerRoutes(app) {
  store.ensureDataDir();

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      features: ["register", "login", "chat", "payment", "feedback"],
    });
  });

  /** 内测反馈：追加写入 feedback.json */
  app.post("/api/feedback", (req, res) => {
    try {
      const validated = feedback.validatePayload(req.body);
      if (!validated.ok) {
        res.json({ code: 2, msg: validated.msg });
        return;
      }
      feedback.appendFeedback(validated);
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
      res.json(result);
    } catch (e) {
      console.error("[register]", e);
      res.status(500).json({ code: -1, msg: "服务器错误，请稍后重试" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const result = await auth.login(req.body?.username, req.body?.password);
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

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      hasApiKey: Boolean(DEEPSEEK_API_KEY),
      model: DEEPSEEK_MODEL,
      auth: Boolean(process.env.JWT_SECRET),
      alipay: alipay.isAlipayConfigured(),
      paymentDev: alipay.isDevPayment(),
    });
  });

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
