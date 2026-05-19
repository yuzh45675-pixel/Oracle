# 登录、计费与支付宝

## 环境变量（`.env`）

```env
# 已有
DEEPSEEK_API_KEY=你的密钥
PORT=3002
JWT_SECRET=请使用至少32位随机字符串

# 计费
READING_PRICE=0.20
PAYMENT_DEV_MODE=true

# 支付宝（正式环境填开放平台参数；开发可先只开 PAYMENT_DEV_MODE）
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY_PATH=./keys/alipay-private.pem
ALIPAY_PUBLIC_KEY_PATH=./keys/alipay-public.pem
ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=https://你的公网域名/api/payment/notify
ALIPAY_RETURN_URL=http://localhost:3001/payment/return
```

## 安装与启动

```powershell
cd C:\Users\LEGION\Documents\tarot-oracle
npm install
npm run server
# 新终端
npm run dev
```

- 前端：http://localhost:3001  
- 后端：http://localhost:3002  

## 计费规则

- 登录用户 **每天 1 次免费** AI 解读（含追问每次调用）
- 用完后 **0.2 元/次**，支付宝购买 1 次额度
- `PAYMENT_DEV_MODE=true` 时可用模拟支付（无需支付宝密钥）

## 测试步骤

### 1. 注册 / 登录

1. 打开网站，右上角点 **登录**  
2. 输入用户名（≥3）、密码（≥6），点 **注册**  
3. 或注册后点 **登录**  
4. Token 保存在 `localStorage` 的 `oracle_auth_token`

也可用接口：

```powershell
Invoke-RestMethod -Uri http://localhost:3002/api/register -Method POST -ContentType "application/json" -Body '{"username":"test1","password":"123456"}'
```

### 2. 免费解读

1. 登录后完成占卜到 **结果页**  
2. 点 **生成解读**（今日第一次应成功）  
3. 顶部显示「今日免费解读：可用 1 次」

### 3. 模拟支付（开发）

1. 再点一次解读 → 提示需支付  
2. 点 **支付宝支付**（开发模式会走模拟）  
3. 或手动：

```powershell
# 先创建订单（需带登录 token）
# POST /api/payment/create
# POST /api/payment/dev-complete  Body: {"orderId":"ord_xxx"}
```

4. 余额 +1 后可继续解读

### 4. 真实支付宝

1. 在 [支付宝开放平台](https://open.alipay.com/) 创建应用，配置密钥  
2. 关闭 `PAYMENT_DEV_MODE` 或设为 `false`  
3. `ALIPAY_NOTIFY_URL` 必须是公网 HTTPS（可用内网穿透）  
4. 支付后跳转 `ALIPAY_RETURN_URL` 确认结果  

## API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/register` | 注册 |
| POST | `/api/login` | 登录，返回 token |
| GET | `/api/me` | 需 `Authorization: Bearer <token>` |
| GET | `/api/quota` | 额度信息 |
| POST | `/api/payment/create` | 创建 0.2 元订单 |
| POST | `/api/payment/dev-complete` | 开发模拟到账 |
| POST | `/api/chat` | AI 解读（需登录+额度） |
