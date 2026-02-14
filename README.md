# PRISM.INTEL | 2025-2026 AI 行业全景战略研判

> 涵盖 2025-2026 年 AI 行业关键数据、模型竞赛、协议标准、安全法规、产业投资和战略趋势的全景式研究报告。

## 线上地址

| 环境 | URL |
|------|-----|
| Cloudflare Pages 默认 | `https://ai-industry-report.pages.dev` |
| 自定义域名 | `https://report.hyper-dusty.cloud` |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| Vite | 7.3.1 | 构建工具 |
| Tailwind CSS | v4 | 样式（通过 `@tailwindcss/vite` 插件） |
| Framer Motion | 12 | 动画 |
| lucide-react | — | 图标库 |
| Inter Variable | — | 正文字体 |
| Space Grotesk | — | 标题字体（科技感） |
| Noto Sans SC | — | 中文优化字体 |

## 部署配置

**平台**: Cloudflare Pages

**部署命令**:
```bash
wrangler pages deploy dist/ --project-name ai-industry-report
```

**Cloudflare 账号信息**:
- Account ID: `9fc645bbc231cd2966c748c09bb72933`
- Zone (hyper-dusty.cloud): `0b18e7c2a9b25ff696495332d58da542`

**SPA 路由**: `public/_redirects` 文件配置 `/ /app 200`，将根路径重写到 `app.html`。注意：不可使用 `/*` 通配符，因为 CF Pages 的 200 重写会覆盖静态资源（JS/CSS 会被重写为 HTML 导致白屏）。当前应用不使用客户端路由，无需通配符。

> **注意**: GitHub Pages 已废弃，相关工作流文件已删除。

## 构建系统

### 入口文件

**`app.html`** 是 React 应用的入口（不是 `index.html`）。在 `vite.config.js` 中配置：

```js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',                    // 相对路径，兼容子目录部署
  server: { open: '/app.html' },
  build: {
    rollupOptions: {
      input: 'app.html'         // 入口是 app.html
    }
  }
})
```

### 构建产物

```bash
npm run build    # 输出到 dist/
```

`report.json` 在构建时被 Vite 内联到 JS bundle 中（通过 `import reportData from './data/report.json'`），不作为独立文件部署。

## 项目架构

```
07.AI-Industry-Report/
├── app.html                    # React 应用入口 (Vite 入口)
├── vite.config.js              # Vite 构建配置
├── package.json                # 依赖与脚本
├── eslint.config.js            # ESLint 配置
├── public/
│   ├── _redirects              # Cloudflare Pages SPA 路由规则
│   └── favicon.svg             # 站点图标
├── src/
│   ├── main.jsx                # React 根渲染 (#root)
│   ├── App.jsx                 # 主应用组件 (~930 行)
│   │                             - Dashboard 总览 (Bento Grid)
│   │                             - 章节阅读器 (Reader View)
│   │                             - 全局搜索 (Cmd+K)
│   │                             - 侧边栏导航 + Section TOC
│   │                             - 精简/完整 详情模式切换
│   ├── ContentRenderers.jsx    # 内容渲染器 (~430 行)
│   │                             - TimelineTable (时间线)
│   │                             - WideTimelineTable (宽时间线)
│   │                             - CardTable (卡片表格)
│   │                             - StatsRenderer / TrendsRenderer
│   │                             - CardsRenderer / NoteRenderer
│   │                             - DiagramRenderer
│   │                             - ContentBlock (入口, 含 detail 过滤)
│   ├── GlossaryTooltip.jsx     # 术语提示 + 搜索高亮
│   ├── theme.js                # 颜色映射 (colorMap / colorBgMap)
│   ├── index.css               # Tailwind v4 主题 + 自定义样式
│   │                             - CSS 变量 (@theme)
│   │                             - glassmorphism (.glass / .glass-elevated)
│   │                             - 氛围光球 (.ambient-orb)
│   │                             - 闪光边框 (.shimmer-border)
│   │                             - 渐变文字 (.glow-text)
│   │                             - prefers-reduced-motion 支持
│   └── data/
│       └── report.json         # 报告数据 (~3700 行)
│                                 - chapters[]: 7 个章节
│                                 - glossary{}: 术语表 (17 个术语)
├── scripts/
│   ├── update-ch1-data.mjs     # 更新 Ch1 1.1-1.4 (OpenAI/Google/Anthropic/xAI)
│   └── update-ch1-data-part2.mjs # 更新 Ch1 1.5-1.21 (Meta 到其他中国大模型)
└── dist/                       # 构建输出 (部署目录, .gitignore 已排除)
    ├── app.html
    ├── favicon.svg
    ├── _redirects
    └── assets/
        ├── app-{hash}.js       # 含 report.json 内联数据
        └── app-{hash}.css
```

## 数据管道

### report.json 结构

```
{
  "chapters": [
    {
      "id": "ch1",
      "title": "大模型发布全景时间线",
      "sections": [
        {
          "title": "1.1 OpenAI",
          "group": "global",           // 可选: 分组标识
          "groupLabel": "中国大模型",   // 可选: 分组显示名
          "content": [
            {
              "type": "table",          // table | stats | trends | cards | note | diagram
              "headers": ["时间", "模型", "关键信息"],
              "subtitle": "...",        // 可选
              "rows": [
                ["2025.01.31", "o3-mini", "高效推理模型...", "core"]
                //                                          ↑ 第4元素: detail marker
              ]
            }
          ]
        }
      ]
    }
  ],
  "glossary": {
    "SWE-bench": "衡量 AI 解决真实 GitHub Issue 的基准",
    "MCP": "Model Context Protocol...",
    // ... 共 17 个术语
  }
}
```

### Detail 过滤系统

表格行的最后一个元素（位于 `headers.length` 索引处）是 detail marker：
- `"core"` — 精简模式和完整模式都显示
- `"deep"` — 仅完整模式显示

用户在阅读视图中通过"精简/完整"切换按钮控制。过滤逻辑在 `ContentRenderers.jsx` 的 `ContentBlock` 中：

```jsx
const headerLen = block.headers?.length || 3
if (detailMode !== 'full') {
  rows = rows.filter(row => row.length <= headerLen || row[headerLen] !== 'deep')
}
// 渲染前移除 metadata 列
rows = rows.map(row => row.length > headerLen ? row.slice(0, headerLen) : row)
```

> **注意**: detail marker 的位置由 `headerLen` 动态决定，而非固定在 `row[3]`。对于 4 列表头的表格，marker 在 `row[4]`。

### 术语标记

在数据文本中用 `⟦术语名⟧` 标记（全角方括号），`GlossaryTooltip` 组件会将其渲染为带 tooltip 的术语提示。

### 数据更新流程

1. 编辑 `scripts/update-ch1-data.mjs` 或 `update-ch1-data-part2.mjs`
2. 运行脚本写入 `report.json`:
   ```bash
   node scripts/update-ch1-data.mjs
   node scripts/update-ch1-data-part2.mjs
   ```
3. 构建:
   ```bash
   npm run build
   ```
4. 部署:
   ```bash
   wrangler pages deploy dist/ --project-name ai-industry-report
   ```

## UI 设计系统

### 暗色主题

- 背景: `#050508` (bg) → `#0a0a10` (surface) → `#0f0f16` (card)
- 主色: `#6366f1` (indigo/accent)
- 辅色: green `#22c55e` / blue `#3b82f6` / orange `#f97316` / pink `#ec4899`

### 视觉效果

- **Glassmorphism**: `.glass` / `.glass-elevated` 毛玻璃效果
- **氛围光球**: Dashboard Hero 区域的浮动渐变光球
- **闪光边框**: `.shimmer-border` 卡片 hover 时渐变流动边框
- **渐变文字**: `.glow-text` 标题渐变发光效果
- **无障碍**: `prefers-reduced-motion` 支持，禁用所有动画

### 表格渲染逻辑

| 条件 | 渲染器 | 效果 |
|------|--------|------|
| 首列是时间 + 列数 ≤ 3 | `TimelineTable` | 竖直时间线 |
| 首列是时间 + 列数 ≥ 4 | `WideTimelineTable` | 多轨道宽时间线 |
| 其他 | `CardTable` | 卡片列表 |

## 开发命令

```bash
npm install        # 安装依赖
npm run dev        # 本地开发 (http://localhost:5173/app.html)
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

## 章节目录

| ID | 章节 |
|----|------|
| ch1 | 大模型发布全景时间线 (21 小节, 160+ 数据行) |
| ch2 | 突破性架构与学术进展 |
| ch3 | 协议与标准生态 |
| ch4 | 安全、法规、伦理与合规 |
| ch5 | 现实世界应用与产业格局 |
| ch6 | 综合时间线 |
| ch7 | 核心趋势总结 |
