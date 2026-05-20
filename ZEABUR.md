# Zeabur 部署（对照中文界面）

> **重要（2026 年起）**  
> Zeabur **已取消「免费共享集群」**。新建项目时若只看到 **购买服务器 / Buy Server**，这是正常的，不是你没找对按钮。  
> 必须先：**购买 Zeabur 服务器**，或 **绑定你自己的 VPS（SSH）**，项目里才会出现 **部署新服务**。  
> 若不想先买服务器，请看文末 **「不用 Zeabur 的替代方案」**。

仓库：https://github.com/yuzh45675-pixel/Oracle  

你的网站 = **2 个服务**（同一个 GitHub 仓库部署两次）  
- **网站页面**：Next.js（自动识别）  
- **API 后端**：Node，启动 `npm run server`  

---

## 零、创建项目时只有「购买」？

Zeabur 官方说明：[共享集群逐步下线](https://zeabur.com/changelogs/phasing-out-shared-cluster)  

**你现在要做的（二选一）：**

| 选项 | 说明 |
|------|------|
| **购买服务器** | 在创建项目时选 Buy New Server（按 Zeabur 标价计费，常见约几美元/月起） |
| **绑定外部服务器** | 若已有阿里云/腾讯云/Hetzner 等 Linux VPS，选 **Bind External Server**，用 SSH 连接，由 Zeabur 帮你部署 |

完成其中一种后，进入项目才能看到 **部署新服务**。

---

## 先认清 Zeabur 界面（中英对照）

| 你可能看到的（中文） | 以前文档写的（英文） |
|---------------------|---------------------|
| **创建项目** | Create Project |
| **部署新服务** 或按 `Ctrl+K` | Deploy New Service |
| **GitHub** | GitHub |
| **变量** | Variables |
| **设置** / **指令** | Settings / Commands |
| **域名** / **网络** | Domains / Networking |
| **日志** | Logs |
| **重新部署** | Redeploy |

若你**还没创建「项目」**，只会看到引导页，不会有「部署新服务」。  
请先：**创建项目** → 进入项目内部 → 再点 **部署新服务**。

---

## 第一步：部署网站（Next.js）

1. 登录 https://zeabur.com  
2. **创建项目**（名字随意，如 `oracle-beta`）  
3. 进入该项目后，点 **部署新服务**（或 `Ctrl+K` → 部署新服务）  
4. 选 **GitHub** → 授权 → 选中仓库 **`Oracle`**  
5. Zeabur 会分析代码，一般显示 **Next.js** → 直接点 **部署**  
6. 等状态变成 **运行中**（约 5～15 分钟，牌图多会久一点）  
7. 点该服务 → **域名** → 复制公网地址，例如：  
   `https://oracle-xxxxx.zeabur.app`  
   **记下为【前端地址】**

> 此时还不要填环境变量也可以，第二步做完再回来填。

---

## 第二步：部署 API 后端（同一项目、第二个服务）

1. **不要新建项目**，回到**同一个项目**里  
2. 再次点 **部署新服务** → **GitHub** → **还是选 `Oracle` 仓库**  
3. **重要：把服务名称改成 `api`**  
   - 在创建流程或 **设置** 里找 **服务名称 / Service Name**  
   - 必须叫 **`api`**（小写），这样才会读仓库里的 `zbpack.api.json`  
4. 若界面仍显示 Next.js、/build 很慢，用 **变量** 强制改成 Node 启动（推荐，不用找「指令」菜单）：

在 **第二个服务** 的 **变量** 里添加：

```env
ZBPACK_START_COMMAND=npm run server
ZBPACK_BUILD_COMMAND=npm install
DEEPSEEK_API_KEY=你的DeepSeek密钥
JWT_SECRET=请填32位以上随机字符串
BETA_MODE=true
DAILY_FREE_READINGS=3
PAYMENT_DEV_MODE=true
PORT=3002
CORS_ORIGIN=https://你的前端地址.zeabur.app
```

（`CORS_ORIGIN` 里的地址换成第一步的【前端地址】，**不要**末尾 `/`）

5. 点 **部署** / 等待 **运行中**  
6. 点该服务 → **域名** → 复制地址，例如：  
   `https://api-xxxxx.zeabur.app`  
   **记下为【后端地址】**

打开浏览器访问：`https://你的后端地址/api/health`  
若看到 `"features"` 里有 `"feedback"`，说明后端 OK。

---

## 第三步：把前端连到后端

1. 点 **第一个服务**（Next.js 网站，不是 `api`）  
2. 打开 **变量**，新增：

```env
API_ORIGIN=https://你的后端地址.zeabur.app
NEXT_PUBLIC_API_URL=https://你的后端地址.zeabur.app
```

3. 保存后会自动 **重新部署**，等完成后再用手机打开【前端地址】测试。

---

## 验收清单

- [ ] 首页、占卜、牌图正常  
- [ ] 注册 / 登录  
- [ ] AI 解读  
- [ ] 显示「今日免费 3 次」  
- [ ] 结果页问卷能提交  

---

## 界面还是对不上？请对照下面选一种

**A. 我只看到一个服务，没有「再部署一个」**  
→ 必须在**项目内部**点 **部署新服务**，不是去首页重新「创建项目」。

**B. 没有 GitHub，只有「模板 / 数据库 / 本地项目」**  
→ 先点 **GitHub** 那一项并完成授权；或顶部 **设置** 里连接 GitHub 账号。

**C. 第二个服务也在 build Next.js，很久或失败**  
→ 确认服务名是 **`api`**，并加上变量 `ZBPACK_START_COMMAND=npm run server`。

**D. 找不到「变量」**  
→ 点进**某个服务**（不是项目总览），左侧或顶部一般有 **变量 / Variables**。

**E. 想用「本地项目」上传**  
→ 可以：选 **本地项目**，选文件夹 `tarot-oracle`（需先在本机 `npm run build` 测过）。  
但更新不如 GitHub 方便，内测仍推荐 GitHub。

---

## 你发我这两样，我可以按你的界面逐步写

1. Zeabur 当前页面**顶部标题**是什么？（例如：项目名、服务名）  
2. 点 **部署新服务** 后，屏幕上**有哪几个大按钮**？（例如：模板 / GitHub / 数据库…）

---

## 更新网站

本地改代码 → `git push` → Zeabur 会自动重新构建两个服务。

---

## 不用 Zeabur 的替代方案（内测、尽量简单）

若暂时不想买服务器，可用 **Render**（有免费档，国外访问；国内可能偏慢）：

1. 注册 https://render.com ，连接 GitHub 仓库 `Oracle`
2. 新建 **Web Service** → 启动命令 `npm run server`，名称如 `oracle-api`
3. 再新建 **Web Service** → 环境 `Node`，Build `npm install && npm run build`，Start `npm run start`
4. 前端环境变量：`NEXT_PUBLIC_API_URL=https://oracle-api.onrender.com`  
5. 后端环境变量：`CORS_ORIGIN=https://你的前端.onrender.com`、`DEEPSEEK_API_KEY` 等

国内访问更稳：买 **腾讯云/阿里云轻量应用服务器**（约几十元/月），用 SSH 自己跑 `npm run server` + `npm run build && npm start`，或绑定到 Zeabur 外部服务器。
