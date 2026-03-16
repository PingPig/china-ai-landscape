# 2026 中国 AI 生态全景图

一站式可视化仪表盘，实时呈现中国人工智能产业版图——覆盖 76 个项目、18 条赛道、4 大层级。

## 功能概览

| 模块 | 说明 |
|------|------|
| 生态气泡图 | 按赛道分区的全景气泡图，气泡大小 = 热度，点击查看详情 |
| 实时排行榜 | 76 个项目按热度排名，支持点击选中联动 |
| 时间轴推演 | 2023Q1 → 2026Q1 时间轴，支持自动播放和键盘切换 |
| 赛道分层 | 应用层 / 模型层 / 基础设施层 / 具身智能层分布统计 |
| 项目对比 | 任选两个项目对比热度趋势和基本信息 |
| AI 问答 | 基于项目数据的智能问答（需配置 API Key） |
| 生态监控 | GitHub Stars / 股价 / 异动 / 缺口分析 / 多维洞察 |
| LIVE 新闻条 | 26 条关键时间线事件滚动展示 |

### 生态监控面板

- **生态健康指数**：100 分制，基于缺口数、异动严重度、股价均值动态计算
- **异动追踪**：GitHub Stars 暴涨、股价大幅波动自动捕获
- **缺口分析**：对标全球生态，发现薄弱赛道
- **多维洞察**：市场情绪、开源动量、板块轮动、集中度风险等 6-8 条分析
- **项目联动**：选中项目后监控面板自动高亮相关数据

## 技术栈

- **框架**: Next.js 14 (App Router)
- **图表**: ECharts 5
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **AI**: OpenRouter API (可选)
- **语言**: TypeScript

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
git clone https://github.com/your-username/ai-ecosystem-map.git
cd ai-ecosystem-map
npm install
```

### 开发模式

```bash
npm run dev
# 打开 http://localhost:3000
```

### 生产构建

```bash
npm run build
npm start -- -p 4000
# 打开 http://localhost:4000
```

### 配置 AI 问答（可选）

```bash
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 OpenRouter API Key
```

## 数据采集

项目内置数据采集脚本，用于更新 GitHub 和股价监控数据：

```bash
# 采集 GitHub Stars/Forks/Issues（需网络访问 GitHub API）
node scripts/collect-github.js

# 采集股价数据（需网络访问 Yahoo Finance）
node scripts/collect-stocks.js

# 一键采集全部 + 生成洞察
node scripts/collect-all.js

# 仅重新生成 AI 洞察（基于已有数据）
node scripts/generate-insights.js
```

采集配置位于 `src/data/monitor-config.json`，可自行添加或修改监控目标。

## 项目结构

```
ai-ecosystem-map/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/analyze/      # AI 问答 API 路由
│   │   ├── page.tsx          # 首页
│   │   └── globals.css       # 全局样式 + CSS 变量
│   ├── components/
│   │   ├── dashboard.tsx     # 主仪表盘布局
│   │   └── dashboard/        # 子组件
│   │       ├── bubble-panel.tsx      # 气泡图
│   │       ├── ranking-panel.tsx     # 排行榜
│   │       ├── monitor-panel.tsx     # 生态监控
│   │       ├── timeline-bar.tsx      # 时间轴
│   │       ├── layer-breakdown.tsx   # 层级分布
│   │       ├── compact-compare.tsx   # 项目对比
│   │       ├── ai-chat.tsx           # AI 问答
│   │       └── ...
│   ├── data/                 # 静态数据文件
│   │   ├── projects.json     # 76 个项目数据
│   │   ├── timeline-events.json  # 26 条时间线
│   │   ├── monitor-*.json    # 监控数据
│   │   └── METHODOLOGY.md    # 数据方法论
│   └── lib/
│       └── types.ts          # TypeScript 类型定义
├── scripts/                  # 数据采集脚本
├── public/                   # 静态资源
└── package.json
```

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `←` `→` | 切换季度 |
| `Space` | 播放 / 暂停时间轴 |
| `Esc` | 取消选中项目 |

## 数据说明

### 数据来源

- **项目信息**：公开资料整理，包括公司官网、融资新闻、产品发布信息
- **GitHub 数据**：通过 GitHub REST API 采集，包括 Stars、Forks、Open Issues
- **股价数据**：通过公开金融数据接口采集，包括实时价格和涨跌幅
- **热度指数**：基于多维度综合评估的相对值（0-100），详见 `src/data/METHODOLOGY.md`

### 数据更新频率

- 项目基本信息：手动维护
- GitHub 数据：建议每周运行采集脚本
- 股价数据：建议每周运行采集脚本
- AI 洞察：每次采集后自动生成

## 隐私声明

本项目：

- **不收集任何用户个人数据**：纯前端静态应用，无用户注册、无 Cookie 追踪、无数据上报
- **不存储用户行为**：所有交互仅在浏览器本地完成
- **数据均来自公开渠道**：GitHub API（公开仓库数据）、公开金融数据接口（上市公司股价）
- **AI 问答功能**（可选）：如启用，用户输入的问题会发送至 OpenRouter API 处理，请参阅 [OpenRouter 隐私政策](https://openrouter.ai/privacy)
- **不包含任何商业机密或非公开信息**

## 免责声明

- 本项目仅供**学习和研究目的**，不构成任何投资建议
- 股价数据可能存在延迟，不应作为交易依据
- 热度指数为主观评估，仅反映编者观点
- 项目信息基于公开资料整理，可能存在遗漏或偏差
- 所有公司名称、产品名称和商标均属于其各自所有者

## 开源协议

本项目采用 [MIT License](./LICENSE) 开源。

你可以自由地：
- 使用、复制、修改本项目
- 将本项目用于商业或非商业目的
- 分发修改后的版本

唯一要求是保留版权声明和许可声明。

## 贡献

欢迎提交 Issue 和 Pull Request。

如果你想添加新的 AI 项目到生态图中，可以：
1. 编辑 `src/data/projects.json` 添加项目数据
2. 运行 `node scripts/recalc-heat-v2.js` 重新计算热度
3. 提交 PR

## 致谢

- [Next.js](https://nextjs.org/) — React 全栈框架
- [ECharts](https://echarts.apache.org/) — 数据可视化库
- [Tailwind CSS](https://tailwindcss.com/) — 实用优先 CSS 框架
- [OpenRouter](https://openrouter.ai/) — AI 模型聚合 API
