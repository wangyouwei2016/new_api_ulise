# 维格智创Token站 · 文档站（VitePress）

基于 **VitePress v1.6.4** 搭建的独立静态文档站点，面向 **维格智创Token站**（`https://api.weigeai.com`）提供用户指南、客户端接入教程、多协议 API 文档、故障排查与服务政策。

## 特性概览

- **轻量零依赖**：纯静态站点生成（SSG），无需后端服务即可部署到 Cloudflare Pages、Vercel、GitHub Pages 或任意 Nginx 服务器。
- **开箱即用本地搜索**：内置 VitePress Local Search（MiniSearch），构建时自动生成中文全文索引，支持 `Cmd + K` / `Ctrl + K` 快捷搜索。
- **自定义主题与交互**：
  - 浅色 / 深色双套品牌配色与自动适配 Logo；
  - 顶部导航栏与左侧边栏锚点（`#hash`）联动高亮，正文顶部自动展示分组面包屑；
  - 侧边栏支持阅读时长（`5 分钟`）与推荐标签（`推荐`）；
  - 移动端点击侧边栏锚点自动收起抽屉。
- **集中品牌配置**：站点名称、域名、控制台链接、Logo 与页脚联系方式统一维护在 `docs/.vitepress/brand.ts`。

## 目录结构

```text
docs-site/
├── package.json                                 # 依赖与 dev/build/preview 脚本
├── README.md                                    # 本说明文档
└── docs/
    ├── .vitepress/
    │   ├── brand.ts                             # 品牌、域名、控制台与页脚集中配置
    │   ├── config.mts                           # 导航栏、侧边栏、本地搜索与 Sitemap 配置
    │   └── theme/
    │       ├── index.ts                         # 主题入口（继承 DefaultTheme）
    │       ├── Layout.vue                       # 4 个定制插槽与路由/锚点高亮逻辑
    │       └── custom.css                       # 浅/深色变量、导航、侧边栏、卡片与 Callout 样式
    ├── public/
    │   ├── brand-logo-mark.svg                  # 站点 Logo（深色模式下自动反色）
    │   └── robots.txt                           # 搜索引擎爬虫与 Sitemap 声明
    ├── index.md                                 # 首页（Hero + 3 张 Feature 卡片）
    ├── about.md                                 # 关于我们
    ├── user-guide/
    │   ├── getting-started.md                   # 快速上手（含 .doc-cards 客户端卡片）
    │   ├── help-center.md                       # 帮助中心（计费、客户端接入、API 示例与 FAQ）
    │   └── video-generation.md                  # 视频生成异步任务指南
    └── terms-and-conditions/
        ├── terms.md                             # 服务条款
        ├── service-specific-terms.md            # 服务特定条款
        ├── privacy.md                           # 隐私政策
        └── usage-policy.md                      # 使用政策
```

## 本地开发与构建

环境要求：Node.js `>= 18`（支持 `npm`、`pnpm` 或 `bun`）。

```bash
cd docs-site

# 1. 安装依赖
npm install

# 2. 启动本地开发服务器（热更新，默认 http://localhost:5173/）
npm run dev

# 3. 生产构建（产物输出至 docs/.vitepress/dist）
npm run build

# 4. 本地预览生产构建产物（默认 http://localhost:4173/）
npm run preview
```

## 维护与自定义指南

### 1. 修改品牌、域名与联系方式

- **全局配置**：编辑 [docs/.vitepress/brand.ts](docs/.vitepress/brand.ts)，修改 `shortName`、`fullName`、`docsOrigin`、`consoleUrl`、`supportText`、`copyrightOwner`。
- **更新 QQ 群号**：拿到正式群号后，在 `docs-site/docs/` 目录下全局替换 `QQ群XXXXX`。
- **替换 Logo**：直接替换 [docs/public/brand-logo-mark.svg](docs/public/brand-logo-mark.svg)（或修改 `brand.ts` 中的 `logo.src`；若使用彩色 Logo，可在 `custom.css` 中移除 `html.dark .VPNavBarTitle .logo { filter: invert(1); }`）。
- **调整品牌主色**：修改 [docs/.vitepress/theme/custom.css](docs/.vitepress/theme/custom.css) 顶部的 `--vp-c-brand-1`、`--vp-c-brand-2`、`--vp-c-brand-3` 与 `--vp-c-brand-soft` 变量。

### 2. 新增文档页面或章节锚点

- **在帮助中心新增章节**：在 [docs/user-guide/help-center.md](docs/user-guide/help-center.md) 中使用显式锚点语法（如 `## 新客户端配置 {#new-client-config}`），并在以下两处同步注册：
  1. [docs/.vitepress/config.mts](docs/.vitepress/config.mts) 的 `themeConfig.sidebar`；
  2. [docs/.vitepress/theme/Layout.vue](docs/.vitepress/theme/Layout.vue) 中对应的 `CLIENT_ANCHORS` / `API_ANCHORS` / `GUIDE_ANCHORS` 集合，以保持顶部导航栏和面包屑联动高亮。
- **新增独立页面**：在 `docs/` 下创建 `.md` 文件，并在 `config.mts` 的 `sidebar` 中添加对应无后缀路径（已开启 `cleanUrls: true`）。

### 3. 插入文档截图

将截图（推荐 `.webp` 格式）放入 `docs/public/images/`，在 Markdown 中通过绝对路径引用：

```markdown
![示例截图](/images/example.webp)
```

## 部署指南

### Cloudflare Pages（推荐）

连接仓库后按如下参数配置即可自动构建发布：

| 配置项 | 填写值 |
| --- | --- |
| Root directory | `docs-site` |
| Build command | `npm run build` |
| Build output directory | `docs/.vitepress/dist` |

### Vercel

- **Root Directory**：`docs-site`
- **Build Command**：`npm run build`
- **Output Directory**：`docs/.vitepress/dist`

### Nginx 静态托管

将构建产物 `docs/.vitepress/dist/` 上传到服务器目录（例如 `/var/www/docs-site`），由于站点启用了 `cleanUrls: true`，建议按如下方式配置 `try_files`：

```nginx
server {
    listen 80;
    server_name docs.weigeai.com;
    root /var/www/docs-site;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ /404.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```
