# 部署指南：上传到 GitHub + 国内可访问的线上网站

按顺序做即可。全程免费方案：**GitHub 存代码** + **Zeabur 发布网站**（国内一般能打开，比 vercel.app 更稳）。

预计耗时：注册 10 分钟 + 第一次上传代码 20～60 分钟（牌图较多，请耐心）+ 部署 5 分钟。

---

## 你需要注册的账号

| 网站 | 用途 | 链接 |
|------|------|------|
| GitHub | 存放项目代码 | https://github.com |
| Zeabur | 发布成公网网站 | https://zeabur.com |

两个都用 **邮箱注册** 即可。Zeabur 界面有中文。

---

## 第一步：在 GitHub 新建空仓库

1. 登录 GitHub，右上角 **+** → **New repository**
2. 填写：
   - **Repository name**：例如 `Oracle`（须与后面 `git remote` 地址一致）
   - 选 **Private** 或 **Public** 都行
3. **不要**勾选 “Add a README file”
4. 点 **Create repository**
5. 记下页面上的地址，形如：  
   `https://github.com/你的用户名/Oracle.git`（示例：[yuzh45675-pixel/Oracle](https://github.com/yuzh45675-pixel/Oracle.git)）

---

## 第二步：把电脑上的项目上传到 GitHub

任选 **A（推荐，图形界面）** 或 **B（命令行）**。

### 方式 A：GitHub Desktop（适合不熟悉命令行）

1. 下载安装：https://desktop.github.com
2. 打开 GitHub Desktop → **File → Add local repository**
3. 选择文件夹：`C:\Users\LEGION\Documents\tarot-oracle`
4. 若提示 “not a Git repository”，点 **create a repository**，Path 保持该文件夹
5. 左下角 Summary 填：`首次上传`
6. 点 **Commit to main**
7. 菜单 **Repository → Repository settings → Remote**，确认已关联你的 GitHub 仓库；若没有，点 **Publish repository** 选刚建的 `Oracle`
8. 点 **Push origin**（或 **Publish branch**）

第一次推送可能要 **20～60 分钟**（约 700MB 牌图），不要中断。

---

### 方式 B：PowerShell 命令行（可复制）

把下面命令**整段复制**到 PowerShell，只需改 **两处**：

- `你的用户名` → 你的 GitHub 用户名  
- 若仓库名不是 `Oracle`，把下面地址里的仓库名改成你的  

```powershell
cd "C:\Users\LEGION\Documents\tarot-oracle"

git init
git branch -M main
git add .
git commit -m "首次上传：Tarot Oracle 占卜网站"

git remote add origin https://github.com/你的用户名/Oracle.git
git push -u origin main
```

**第一次 push 会较慢**，属正常现象。

若提示要登录 GitHub：

- 用户名：你的 GitHub 用户名  
- 密码：不能用登录密码，要用 **Personal Access Token**  
  - GitHub → 头像 → **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token**  
  - 勾选 `repo`，生成后复制 token，粘贴到密码处（只显示一次，请保存）

若 `git push` 失败（文件过大 / 超时），可多试几次，或改用上面的 GitHub Desktop。

---

## 第三步：用 Zeabur 部署（国内访问）

1. 打开 https://zeabur.com ，用 GitHub 登录并授权
2. 控制台点 **创建项目** / **Deploy New Service**
3. 选择 **GitHub** → 选中仓库 `tarot-oracle`
4. Zeabur 会自动识别为 **Next.js**，保持默认：
   - Build Command：`npm run build` 或 `pnpm build`（若无 pnpm 用 npm）
   - Output：自动
5. 点 **Deploy**，等待构建（约 3～8 分钟）
6. 成功后会出现一个网址，形如：  
   `https://tarot-oracle-xxxxx.zeabur.app`

用手机流量或别人电脑打开这个链接即可访问。

### 绑定自己的域名（可选）

Zeabur 项目 → **域名** → 按提示添加 CNAME 记录。

---

## 以后改代码怎么更新网站？

1. 在本地改完并测试：`npm run dev`
2. 用 GitHub Desktop **Commit** + **Push**，或在项目目录执行：

```powershell
cd "C:\Users\LEGION\Documents\tarot-oracle"
git add .
git commit -m "更新说明"
git push
```

3. Zeabur 会自动重新构建，几分钟后线上即更新。

---

## 备选：Cloudflare Pages（GitHub 联动）

若 Zeabur 不满意，可用 Cloudflare（国内多数地区比 Vercel 好打开）：

1. https://dash.cloudflare.com 注册
2. **Workers & Pages → Create → Pages → Connect to Git**
3. 选 `tarot-oracle` 仓库，Framework：**Next.js**
4. Build command：`npm run build`，Deploy

---

## 常见问题

**Q：GitHub 打不开或 push 很慢？**  
换网络时段重试，或用 GitHub Desktop；代码托管也可先推成功一次，之后 Zeabur 从 GitHub 拉取。

**Q：网站打开没有牌图？**  
确认 `public/cards/` 里 PNG 已随 git 上传（仓库里能看到 `lenormand-01.png` 等文件）。

**Q：占卜记录会丢吗？**  
记录存在用户浏览器本地，换设备或清缓存会没有，与是否部署无关。

**Q：Vercel 可以吗？**  
可以，但 `*.vercel.app` 在国内经常慢或打不开，更推荐 Zeabur。

---

## 本地构建自检（可选）

上传前可在本机确认能打包成功：

```powershell
cd "C:\Users\LEGION\Documents\tarot-oracle"
npm install
npm run build
```

显示 `Compiled successfully` 即可。
