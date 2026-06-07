const store = require("./store");
const billing = require("./billing");
const auth = require("./auth");

const READING_PRICE = billing.READING_PRICE;

function isDevPayment() {
  return process.env.PAYMENT_DEV_MODE === "true";
}

function isWechatLoginConfigured() {
  return Boolean(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);
}

function isWechatPayConfigured() {
  return Boolean(
    process.env.WECHAT_APP_ID &&
      process.env.WECHAT_MCH_ID &&
      process.env.WECHAT_API_V3_KEY &&
      (process.env.WECHAT_MCH_PRIVATE_KEY ||
        process.env.WECHAT_MCH_PRIVATE_KEY_PATH),
  );
}

async function codeToSession(code) {
  const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
  url.searchParams.set("appid", process.env.WECHAT_APP_ID);
  url.searchParams.set("secret", process.env.WECHAT_APP_SECRET);
  url.searchParams.set("js_code", code);
  url.searchParams.set("grant_type", "authorization_code");

  const res = await fetch(url);
  const data = await res.json();
  if (data.errcode) {
    const err = new Error(data.errmsg || "微信登录失败");
    err.status = 401;
    throw err;
  }
  return data;
}

async function loginWithCode(code) {
  if (!isWechatLoginConfigured()) {
    if (isDevPayment() && code === "dev_test") {
      let user = store.findUserByOpenId("dev_openid_test");
      if (!user) {
        user = store.createWechatUser({
          openid: "dev_openid_test",
          unionid: null,
          nickName: "内测微信用户",
        });
        return {
          token: auth.signToken(user),
          user: billing.publicUser(user),
          isNew: true,
        };
      }
      return {
        token: auth.signToken(user),
        user: billing.publicUser(user),
        isNew: false,
      };
    }
    const err = new Error(
      "微信登录未配置：请设置 WECHAT_APP_ID / WECHAT_APP_SECRET",
    );
    err.status = 503;
    throw err;
  }

  const session = await codeToSession(String(code ?? ""));
  const openid = session.openid;
  if (!openid) {
    const err = new Error("未获取到 openid");
    err.status = 401;
    throw err;
  }

  let user = store.findUserByOpenId(openid);
  let isNew = false;
  if (!user) {
    user = store.createWechatUser({
      openid,
      unionid: session.unionid ?? null,
      nickName: null,
    });
    isNew = true;
  }

  return {
    token: auth.signToken(user),
    user: billing.publicUser(user),
    isNew,
  };
}

async function createJsapiPayment(user, openid) {
  const order = store.createOrder({
    userId: user.id,
    amount: READING_PRICE,
    subject: "Olance 心灵解读 1 次",
    channel: "wechat",
  });

  if (isDevPayment() && !isWechatPayConfigured()) {
    return {
      devMode: true,
      orderId: order.id,
      payment: {
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: "dev",
        package: `prepay_id=dev_${order.id}`,
        signType: "RSA",
        paySign: "DEV_MODE",
      },
      message: "开发模式：请调用 POST /api/payment/wechat/dev-complete",
    };
  }

  if (!isWechatPayConfigured()) {
    const err = new Error("微信支付未配置，请联系管理员或开启 PAYMENT_DEV_MODE");
    err.status = 503;
    throw err;
  }

  const err = new Error("微信支付 V3 将在接入商户号后启用");
  err.status = 501;
  err.orderId = order.id;
  throw err;
}

function fulfillOrder(orderId, transactionId) {
  const order = store.markOrderPaid(orderId, transactionId, "wechat");
  if (!order) return null;
  billing.addCredits(order.userId, 1);
  return order;
}

module.exports = {
  isDevPayment,
  isWechatLoginConfigured,
  isWechatPayConfigured,
  loginWithCode,
  createJsapiPayment,
  fulfillOrder,
};
