# oracletarot.top 上线清单

域名：**oracletarot.top**  
架构：阿里云 DNS → **Vercel（网站）** + **Render（API 后端）**

---

## 我能替你做好的（已在仓库里）

- [x] `render.yaml`：后端一键部署配置（含 CORS 域名）
- [x] 本说明与 Vercel 环境变量模板

## 你必须在网页上完成的 3 步（约 20 分钟）

### A. Render 部署后端

1. 打开 https://dashboard.render.com → 用 GitHub 登录  
2. **New +** → **Blueprint**（或 Web Service 手动建）  
3. 连接仓库 **`yuzh45675-pixel/Oracle`**，若识别 `render.yaml` 则按提示部署  
4. 在环境变量里 **手动添加**（Render 不会从本机读 `.env`）：

   | 变量名 | 值 |
   |--------|-----|
   | `DEEPSEEK_API_KEY` | 你的 DeepSeek 密钥 |
   | 其余 | `render.yaml` 里已写好，检查 `CORS_ORIGIN` 是否为下面两行 |

   ```
   https://oracletarot.top,https://www.oracletarot.top
   ```

5. 部署完成后记下 API 地址，例如：  
   `https://oracle-api-xxxx.onrender.com`  
6. 浏览器打开：`https://你的API地址/api/health` → 应看到 JSON

### B. Vercel 部署前端

1. 打开 https://vercel.com → **Add New Project** → 选 **Oracle** 仓库  
2. Framework：**Next.js**，直接 **Deploy**  
3. **Settings → Environment Variables**（Production + Preview 都加）：

   ```
   NEXT_PUBLIC_API_URL=https://你的Render地址.onrender.com
   API_ORIGIN=https://你的Render地址.onrender.com
   ```

   （不要末尾 `/`，换成 A 步的真实地址）

4. **Deployments → Redeploy** 最新一次部署

### C. 域名绑定（阿里云 + Vercel）

1. Vercel 项目 → **Settings → Domains**，添加：

   - `oracletarot.top`
   - `www.oracletarot.top`

2. 按 Vercel 页面显示的 DNS 记录，到阿里云：  
   https://dns.console.aliyun.com/ → **oracletarot.top** → **解析设置**

   常见配置（**以 Vercel 当前提示为准**）：

   | 主机记录 | 类型 | 记录值 |
   |----------|------|--------|
   | `www` | CNAME | `cname.vercel-dns.com`（或 Vercel 给出的值） |
   | `@` | A | `76.76.21.21`（若 Vercel 要求根域名用 A） |

3. 等待 Vercel 显示 **Valid**（几分钟～几小时）

4. 若只用 `www`：在 Vercel 把 `oracletarot.top` 重定向到 `www.oracletarot.top`（Domains 里可设）

---

## Render 显示 Failed？

**与阿里云实名、买域名无关。** Render 在国外，不检查阿里云。

最常见原因：**环境变量里写了 `PORT=3002`**

- Render 会自动注入 `PORT`（如 10000），程序必须监听这个端口。
- 若你手动设 `PORT=3002`，健康检查会失败，显示 **Deploy failed**。
- **处理**：Render → **oracle-api** → **Environment** → **删除 `PORT` 这一条** → **Manual Deploy** 重新部署。

其他：打开 **Logs** 标签看红色报错；确认有 `DEEPSEEK_API_KEY`。

**Start Command 必须是** `npm run server`（不是 `npm start`，那会启动 Next 前端并立刻失败）。

**Settings 核对（逐项）：**

| 项 | 正确值 |
|----|--------|
| Root Directory | 留空（仓库根目录） |
| Build Command | `npm install --omit=dev` |
| Start Command | `npm run server` |
| Health Check Path | `/api/health` |
| Environment 里的 `PORT` | **不要有**（删掉） |

浏览器访问 `https://你的服务.onrender.com/api/health` 应返回 JSON；若 **90 秒无响应**，说明实例没起来，看 Logs 里是否有 `Killed`、`ENOMEM` 或 `Cannot find module`。

**本地有未 push 的提交时**，Render 不会用到最新 `render.yaml`，请先：

```powershell
cd "C:\Users\LEGION\Documents\tarot-oracle"
git push origin main
```

再在 Render 点 **Manual Deploy → Clear build cache & deploy**。

---

## 验收

- [ ] https://www.oracletarot.top 能打开  
- [ ] 注册 / 登录  
- [ ] AI 解读、每日 3 次  
- [ ] 问卷提交成功  

登录失败：检查 Render 的 `CORS_ORIGIN` 是否与浏览器地址栏 **完全一致**（含 `https://`、有无 `www`）。

---

## 更新网站

```powershell
git push origin main
```

Vercel 与 Render 会自动重新构建。
