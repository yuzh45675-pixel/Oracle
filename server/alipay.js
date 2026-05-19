const fs = require("fs");
const store = require("./store");
const billing = require("./billing");

const READING_PRICE = billing.READING_PRICE;

function isDevPayment() {
  return process.env.PAYMENT_DEV_MODE === "true";
}

function isAlipayConfigured() {
  return Boolean(
    process.env.ALIPAY_APP_ID &&
      (process.env.ALIPAY_PRIVATE_KEY ||
        process.env.ALIPAY_PRIVATE_KEY_PATH) &&
      (process.env.ALIPAY_PUBLIC_KEY || process.env.ALIPAY_PUBLIC_KEY_PATH),
  );
}

function readKey(envValue, pathValue) {
  if (pathValue && fs.existsSync(pathValue)) {
    return fs.readFileSync(pathValue, "utf8");
  }
  if (envValue) {
    return envValue.replace(/\\n/g, "\n");
  }
  return "";
}

function getAlipaySdk() {
  if (!isAlipayConfigured()) return null;
  const { AlipaySdk } = require("alipay-sdk");
  return new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: readKey(
      process.env.ALIPAY_PRIVATE_KEY,
      process.env.ALIPAY_PRIVATE_KEY_PATH,
    ),
    alipayPublicKey: readKey(
      process.env.ALIPAY_PUBLIC_KEY,
      process.env.ALIPAY_PUBLIC_KEY_PATH,
    ),
    gateway:
      process.env.ALIPAY_GATEWAY ??
      "https://openapi.alipaydev.com/gateway.do",
  });
}

async function createReadingPayment(user) {
  const order = store.createOrder({
    userId: user.id,
    amount: READING_PRICE,
    subject: "Oracle AI 解读 1 次",
  });

  if (isDevPayment() && !isAlipayConfigured()) {
    return {
      orderId: order.id,
      amount: READING_PRICE,
      devMode: true,
      message: "开发模式：请调用 POST /api/payment/dev-complete 完成模拟支付",
    };
  }

  const alipaySdk = getAlipaySdk();
  if (!alipaySdk) {
    const err = new Error("支付宝未配置，请联系管理员或开启 PAYMENT_DEV_MODE");
    err.status = 503;
    throw err;
  }

  const notifyUrl =
    process.env.ALIPAY_NOTIFY_URL ??
    `http://localhost:${process.env.PORT || 3002}/api/payment/notify`;
  const returnUrl =
    process.env.ALIPAY_RETURN_URL ?? "http://localhost:3001/payment/return";

  const payUrl = await alipaySdk.pageExecute(
    "alipay.trade.page.pay",
    "GET",
    {
      notifyUrl,
      returnUrl: `${returnUrl}?orderId=${order.id}`,
      bizContent: {
        out_trade_no: order.id,
        total_amount: READING_PRICE.toFixed(2),
        subject: "Oracle AI 解读",
        product_code: "FAST_INSTANT_TRADE_PAY",
      },
    },
  );

  return {
    orderId: order.id,
    amount: READING_PRICE,
    payUrl,
    devMode: false,
  };
}

function fulfillOrder(orderId, tradeNo) {
  const order = store.markOrderPaid(orderId, tradeNo);
  if (!order) return null;
  billing.addCredits(order.userId, 1);
  return order;
}

async function handleNotify(params) {
  const alipaySdk = getAlipaySdk();
  if (!alipaySdk) return false;

  const verified = alipaySdk.checkNotifySign(params);
  if (!verified) return false;

  const tradeStatus = params.trade_status;
  const outTradeNo = params.out_trade_no;
  const tradeNo = params.trade_no;

  if (
    tradeStatus === "TRADE_SUCCESS" ||
    tradeStatus === "TRADE_FINISHED"
  ) {
    fulfillOrder(outTradeNo, tradeNo);
    return true;
  }
  return false;
}

module.exports = {
  isDevPayment,
  isAlipayConfigured,
  createReadingPayment,
  fulfillOrder,
  handleNotify,
};
