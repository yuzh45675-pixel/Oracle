# 内测运维备忘（关机前保存）

> 最后整理：内测已上线。本地文件路径：`C:\Users\LEGION\Documents\tarot-oracle\BETA_OPS.md`  
> 详细部署步骤见 `DEPLOY_ORACLETAROT.md`，Zeabur 见 `ZEABUR.md`。

---

## 一、当前架构与地址

| 角色 | 平台 | 地址 |
|------|------|------|
| 网站（前端） | Vercel | https://oracle-tarot-xi.vercel.app |
| API（后端） | Render | https://oracle-api-ug81.onrender.com |
| 正式域名（待绑完 DNS） | 阿里云 + Vercel | https://oracletarot.top / https://www.oracletarot.top |
| 代码仓库 | GitHub | https://github.com/yuzh45675-pixel/Oracle |

**健康检查（后端是否在线）：**

```text
https://oracle-api-ug81.onrender.com/api/health
```

应返回 JSON：`{"ok":true,"features":["register","login","chat","payment","feedback"]}`

---

## 二、环境变量 Key / Value（对照表）

### Render（后端 oracle-api）

在 **Environment** 或 **Environment Group** 里，每条变量分 **Key（名称）** 和 **Value（值）**，不要弄反。

| Key | Value |
|-----|--------|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek 密钥（`sk-...`） |
| `JWT_SECRET` | 32 位以上随机字符串（内测可自定，改了已登录用户需重登） |
| `BETA_MODE` | `true` |
| `DAILY_FREE_READINGS` | `3` |
| `PAYMENT_DEV_MODE` | `true` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | 见下方一整行 |

**`CORS_ORIGIN` 的 Value（复制这一行）：**

```text
https://oracle-tarot-xi.vercel.app,https://oracletarot.top,https://www.oracletarot.top
```

**不要有：** `PORT`（Render 自动注入，写 `PORT=3002` 会部署失败）

**Build / Start：**

- Build Command：`npm install --omit=dev`
- Start Command：`npm run server`
- Health Check Path：`/api/health`

---

### Vercel（前端 Oracle 项目）

| Key | Value |
|-----|--------|
| `API_ORIGIN` | `https://oracle-api-ug81.onrender.com` |

- **不必**再设 `NEXT_PUBLIC_API_URL`（浏览器已改走 `/api-server` 代理，避免手机跨域、直连 Render 失败）
- 改环境变量后：**Deployments → Redeploy**

---

## 三、手机「无法连接后端」已做修复

- 浏览器统一请求：`https://oracle-tarot-xi.vercel.app/api-server/...` → Vercel 转发到 Render
- 代码：`src/lib/api-base.ts`（提交 `9bdb24f` 及之后）
- Render 的 `CORS_ORIGIN` 须包含你实际打开的前端地址（见上表）

---

## 四、UptimeRobot 免费监控（保活 + 告警）

1. https://uptimerobot.com → **Add New Monitor**
2. **Monitor Type**：HTTP(s)
3. **URL**：

   ```text
   https://oracle-api-ug81.onrender.com/api/health
   ```

4. **Monitoring Interval**：优先 **14 分钟**；免费版若无 14，选 **5 分钟**
5. 可选 **Keyword**：`"ok":true`
6. 状态 **Up** 即正常

说明：定时访问可减轻 Render 免费版休眠；仅监控后端。前端可另加一条监控 Vercel 或正式域名。

---

## 五、怎么看后端（内测数据）

| 方式 | 操作 |
|------|------|
| 是否在线 | 浏览器打开 `/api/health` |
| 实时日志 | Render → **oracle-api** → **Logs** |
| 用户 / 订单 / 问卷 | Render → **Shell**（若有）执行：`cat data/users.json`、`cat data/orders.json`、`cat feedback.json` |

数据文件在 Render 磁盘上，**重新部署可能清空**（免费版）。长期要接数据库。

**Vercel 只有网页，看不到用户库。**

---

## 六、控制台链接

- Render 后台：https://dashboard.render.com
- Vercel 后台：https://vercel.com/dashboard
- 阿里云 DNS：https://dns.console.aliyun.com/

---

## 七、关机后下次开机可做的事

### 已完成的

- [x] Render 后端 Live
- [x] Vercel 部署 + `API_ORIGIN`
- [x] 手机注册测试通过（走 `/api-server`）
- [x] `CORS_ORIGIN` 已按三域名配置
- [ ] 绑定 `oracletarot.top`（Vercel Domains + 阿里云 DNS）
- [ ] UptimeRobot 监控（按第四节）

### 绑域名（第三步）

1. Vercel → **Settings → Domains** → 添加 `www.oracletarot.top`、`oracletarot.top`
2. 阿里云 DNS 按 Vercel 提示添加记录
3. 等 **Valid** 后用 https://www.oracletarot.top 再测注册 / AI

### 更新网站

```powershell
cd C:\Users\LEGION\Documents\tarot-oracle
git push origin main
```

Vercel / Render 会自动重新构建。

### 本地开发（两个终端）

```powershell
# 终端 1 前端
npm run dev

# 终端 2 后端
npm run server
```

本地 `.env` 含 `DEEPSEEK_API_KEY`；前端默认 http://localhost:3001，API 端口 3002。

---

## 八、国内用户不开梯子（以后）

当前 **Vercel + Render** 无法保证国内稳定免梯子。若要改善：

- **香港轻量服务器** 一台跑 `npm run build && npm start` + `npm run server`，域名 A 记录指过去
- 或 **Zeabur 绑定外部 VPS**（见 `ZEABUR.md`）

---

## 九、常见问题速查

| 现象 | 处理 |
|------|------|
| Render Deploy failed | 删环境变量 `PORT`；Start 用 `npm run server` |
| 手机无法连接后端 | 确认 Vercel 已 Redeploy；`CORS_ORIGIN` 含当前访问的 https 地址 |
| 注册 404 | 旧 node 占端口或 Render 未 Live |
| 健康检查 502 / 超时 | 看 Render Logs；UptimeRobot 可减轻休眠 |
| 环境变量填错 | Key=`CORS_ORIGIN`，Value=三个 https 网址，不要反了 |

---

## 十、Secrets 提醒

- `DEEPSEEK_API_KEY`、`JWT_SECRET` 只放在 Render / 本机 `.env`，不要提交 Git
- `.env` 已在 `.gitignore`
