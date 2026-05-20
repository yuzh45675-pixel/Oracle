# Zeabur 部署清单（内测版）

代码仓库：https://github.com/yuzh45675-pixel/Oracle  
需要部署 **两个服务**：前端（Next.js）+ 后端（Express）。

---

## 一、创建项目并部署前端（网站页面）

1. Zeabur 控制台 → **Deploy New Service** → **GitHub**
2. 选择仓库 **`Oracle`**（或 `yuzh45675-pixel/Oracle`）
3. 框架应自动识别为 **Next.js**，保持默认：
   - Build：`npm run build`
   - Start：`npm run start`
4. 先 **不要点 Deploy**，先打开 **Variables（环境变量）**，暂时留空，等后端地址出来再填
5. 点击 **Deploy**，等待构建完成（约 5～10 分钟）
6. 记下前端域名，例如：`https://oracle-xxxxx.zeabur.app`

---

## 二、同一项目里再部署后端（API）

1. 在同一 Zeabur **项目**里，再次 **Deploy New Service** → **GitHub**
2. **再次选择同一个仓库** `Oracle`
3. 若识别成 Next.js，请在设置里改为 **Node.js** / 或 **Customize**：
   - **Start Command（启动命令）**：`npm run server`
   - **Build Command**：可留空或 `npm install`
4. 打开 **Variables**，填入：

```env
DEEPSEEK_API_KEY=你的DeepSeek密钥
JWT_SECRET=请填至少32位随机字符串
BETA_MODE=true
DAILY_FREE_READINGS=3
PAYMENT_DEV_MODE=true
PORT=3002
CORS_ORIGIN=https://你的前端域名.zeabur.app
```

5. **Deploy**，记下后端域名，例如：`https://oracle-api-xxxxx.zeabur.app`

---

## 三、把前后端连起来

回到 **前端服务** → **Variables**，新增：

```env
API_ORIGIN=https://你的后端域名.zeabur.app
NEXT_PUBLIC_API_URL=https://你的后端域名.zeabur.app
```

（不要末尾斜杠 `/`）

保存后 Zeabur 会 **自动重新部署前端**。

再确认 **后端** 的 `CORS_ORIGIN` 已是 **前端完整地址**（`https://...zeabur.app`）。

---

## 四、验收

用手机流量打开 **前端链接**：

- [ ] 首页、占卜、牌图正常
- [ ] 注册 / 登录
- [ ] AI 解读（需 `DEEPSEEK_API_KEY` 有效）
- [ ] 显示「今日免费 3 次」
- [ ] 结果页底部问卷可提交

---

## 五、以后更新网站

本地改代码 → `git push` → Zeabur 两个服务都会自动重新构建。

---

## 常见问题

**登录 / 注册失败**  
检查 `NEXT_PUBLIC_API_URL` 是否指向后端；后端 `CORS_ORIGIN` 是否为前端地址。

**AI 不回复**  
检查后端 `DEEPSEEK_API_KEY`；Zeabur 后端服务日志里是否有报错。

**用户 / 反馈数据丢了**  
免费实例重启可能清空文件。内测可接受；正式运营需绑 Zeabur **Volume** 挂载 `data/` 目录，或改用数据库。
