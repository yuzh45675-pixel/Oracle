/**
 * Oracle API server ? DeepSeek / Auth / Alipay
 * Run: npm run server
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { registerRoutes } = require("./server/routes");
const alipay = require("./server/alipay");
const billing = require("./server/billing");

const app = express();
const PORT = Number(process.env.PORT) || 3002;

const corsOrigin =
  process.env.CORS_ORIGIN ?? "http://localhost:3001,http://localhost:3000";

app.use(
  cors({
    origin:
      corsOrigin === "*"
        ? true
        : corsOrigin.split(",").map((s) => s.trim()),
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1mb" }));

app.post(
  "/api/payment/notify",
  express.urlencoded({ extended: false }),
  async (req, res) => {
    try {
      const ok = await alipay.handleNotify(req.body);
      res.send(ok ? "success" : "fail");
    } catch (e) {
      console.error("[alipay notify]", e);
      res.send("fail");
    }
  },
);

registerRoutes(app);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
  console.log("[server] Auth: POST /api/register  POST /api/login  GET /api/me");
  if (!process.env.JWT_SECRET) {
    console.warn("[server] JWT_SECRET not set ? using default dev_secret_key");
  }
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn("[server] DEEPSEEK_API_KEY not set");
  }
  if (billing.BETA_MODE) {
    console.log(
      `[server] BETA_MODE: ${billing.DAILY_FREE_LIMIT} free readings/day, beta unlock free`,
    );
  }
  if (alipay.isDevPayment()) {
    console.log("[server] PAYMENT_DEV_MODE=true (mock payments)");
  }
});
