/**
 * 补充新赛道和新项目到 projects.json
 * 用法: node scripts/add-new-projects.js
 */

const fs = require("fs");
const path = require("path");

const PROJECTS_PATH = path.join(__dirname, "..", "src", "data", "projects.json");

const newProjects = [
  // ── 模型评测 model_eval ──
  {
    id: "flageval",
    name: "FlagEval 天秤",
    shortDesc: "智源研究院推出的大模型评测平台，覆盖语言、视觉、多模态能力评估",
    category: "model_eval",
    layer: "model",
    founded: "2023",
    funding: "智源研究院支持",
    fundingRound: "未融资",
    products: ["FlagEval评测平台"],
    url: "https://flageval.baai.ac.cn",
    tags: ["评测", "基准测试", "智源"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 5, "2023Q3": 10, "2023Q4": 15, "2024Q1": 20, "2024Q2": 22, "2024Q3": 25, "2024Q4": 28, "2025Q1": 30, "2025Q2": 32, "2025Q3": 33, "2025Q4": 35, "2026Q1": 36 },
  },
  {
    id: "superclue",
    name: "SuperCLUE",
    shortDesc: "中文大模型综合评测基准，涵盖推理、知识、安全等多维度",
    category: "model_eval",
    layer: "model",
    founded: "2023",
    funding: "独立运营",
    fundingRound: "未融资",
    products: ["SuperCLUE排行榜", "SuperCLUE-Safety"],
    url: "https://www.superclueai.com",
    tags: ["评测", "中文", "排行榜"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 8, "2023Q3": 15, "2023Q4": 20, "2024Q1": 25, "2024Q2": 28, "2024Q3": 30, "2024Q4": 28, "2025Q1": 26, "2025Q2": 25, "2025Q3": 24, "2025Q4": 23, "2026Q1": 22 },
  },
  {
    id: "opencompass",
    name: "OpenCompass 司南",
    shortDesc: "上海AI Lab推出的开源大模型评测框架，支持100+数据集",
    category: "model_eval",
    layer: "model",
    founded: "2023",
    funding: "上海AI Lab",
    fundingRound: "未融资",
    products: ["OpenCompass评测平台", "CompassRank"],
    githubStars: 5200,
    url: "https://opencompass.org.cn",
    tags: ["评测", "开源", "上海AI Lab"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 3, "2023Q3": 10, "2023Q4": 18, "2024Q1": 25, "2024Q2": 30, "2024Q3": 35, "2024Q4": 38, "2025Q1": 40, "2025Q2": 42, "2025Q3": 43, "2025Q4": 44, "2026Q1": 45 },
  },

  // ── 数据服务 infra_data ──
  {
    id: "scale_cn",
    name: "龙猫数据",
    shortDesc: "国内头部AI数据标注服务商，为主流大模型提供RLHF对齐标注",
    category: "infra_data",
    layer: "infrastructure",
    founded: "2017",
    funding: "数亿元",
    fundingRound: "C轮",
    products: ["数据标注平台", "RLHF标注", "多模态标注"],
    url: "https://www.longmaosoft.com",
    tags: ["数据标注", "RLHF", "训练数据"],
    heatByQuarter: { "2023Q1": 15, "2023Q2": 18, "2023Q3": 22, "2023Q4": 28, "2024Q1": 32, "2024Q2": 35, "2024Q3": 38, "2024Q4": 40, "2025Q1": 42, "2025Q2": 43, "2025Q3": 44, "2025Q4": 45, "2026Q1": 45 },
  },
  {
    id: "basicfinder",
    name: "倍赛BasicFinder",
    shortDesc: "AI数据训练服务平台，覆盖自动驾驶、大模型等场景的数据处理",
    category: "infra_data",
    layer: "infrastructure",
    founded: "2015",
    funding: "数亿元",
    fundingRound: "B轮",
    products: ["数据标注", "数据采集", "自动驾驶标注"],
    url: "https://www.basicfinder.com",
    tags: ["数据标注", "自动驾驶", "标注平台"],
    heatByQuarter: { "2023Q1": 12, "2023Q2": 14, "2023Q3": 18, "2023Q4": 22, "2024Q1": 25, "2024Q2": 28, "2024Q3": 30, "2024Q4": 32, "2025Q1": 33, "2025Q2": 34, "2025Q3": 35, "2025Q4": 35, "2026Q1": 34 },
  },
  {
    id: "modb",
    name: "海天瑞声",
    shortDesc: "A股上市的AI训练数据提供商(688787)，覆盖语音、NLP、CV多模态数据",
    category: "infra_data",
    layer: "infrastructure",
    founded: "2005",
    funding: "已上市",
    fundingRound: "已上市",
    products: ["语音数据集", "NLP数据集", "多模态数据"],
    url: "https://www.speechocean.com",
    tags: ["训练数据", "上市", "多模态"],
    heatByQuarter: { "2023Q1": 10, "2023Q2": 12, "2023Q3": 15, "2023Q4": 20, "2024Q1": 22, "2024Q2": 25, "2024Q3": 28, "2024Q4": 30, "2025Q1": 28, "2025Q2": 26, "2025Q3": 25, "2025Q4": 24, "2026Q1": 23 },
  },

  // ── AI安全 ai_safety ──
  {
    id: "ruleai",
    name: "瑞莱智慧",
    shortDesc: "清华系AI安全公司，聚焦大模型安全评估、内容合规、深度伪造检测",
    category: "ai_safety",
    layer: "infrastructure",
    founded: "2019",
    funding: "超10亿元",
    fundingRound: "C轮",
    products: ["AI安全评估", "深度伪造检测", "大模型合规"],
    url: "https://www.realai.ai",
    tags: ["AI安全", "对齐", "清华"],
    heatByQuarter: { "2023Q1": 10, "2023Q2": 12, "2023Q3": 18, "2023Q4": 22, "2024Q1": 28, "2024Q2": 32, "2024Q3": 38, "2024Q4": 42, "2025Q1": 45, "2025Q2": 48, "2025Q3": 50, "2025Q4": 52, "2026Q1": 55 },
  },
  {
    id: "antgroup_ai_safety",
    name: "蚂蚁安全实验室",
    shortDesc: "蚂蚁集团AI安全团队，研究大模型对抗攻击防御、幻觉检测、可信AI",
    category: "ai_safety",
    layer: "infrastructure",
    founded: "2020",
    funding: "蚂蚁集团内部",
    fundingRound: "已上市",
    products: ["蚁天鉴大模型安全", "AI内容检测"],
    url: "https://www.antgroup.com",
    tags: ["AI安全", "可信AI", "蚂蚁"],
    heatByQuarter: { "2023Q1": 5, "2023Q2": 8, "2023Q3": 12, "2023Q4": 18, "2024Q1": 22, "2024Q2": 28, "2024Q3": 32, "2024Q4": 35, "2025Q1": 38, "2025Q2": 40, "2025Q3": 42, "2025Q4": 44, "2026Q1": 46 },
  },

  // ── AI工具链 infra_tool ──
  {
    id: "zilliz",
    name: "Zilliz",
    shortDesc: "Milvus向量数据库的商业化公司，云原生向量搜索，RAG核心基础设施",
    category: "infra_tool",
    layer: "infrastructure",
    founded: "2017",
    funding: "超1.1亿美元",
    fundingRound: "B+轮",
    products: ["Milvus", "Zilliz Cloud"],
    githubStars: 32000,
    url: "https://zilliz.com",
    tags: ["向量数据库", "RAG", "开源"],
    heatByQuarter: { "2023Q1": 20, "2023Q2": 25, "2023Q3": 30, "2023Q4": 38, "2024Q1": 45, "2024Q2": 50, "2024Q3": 55, "2024Q4": 58, "2025Q1": 60, "2025Q2": 62, "2025Q3": 63, "2025Q4": 64, "2026Q1": 65 },
  },
  {
    id: "jina",
    name: "Jina AI",
    shortDesc: "中国团队创建的开源AI搜索基础设施，Embedding和Reranker模型全球领先",
    category: "infra_tool",
    layer: "infrastructure",
    founded: "2020",
    funding: "3750万美元",
    fundingRound: "A轮",
    products: ["Jina Embeddings", "Jina Reranker", "Jina Reader"],
    githubStars: 23000,
    url: "https://jina.ai",
    tags: ["Embedding", "搜索", "开源"],
    heatByQuarter: { "2023Q1": 12, "2023Q2": 15, "2023Q3": 20, "2023Q4": 28, "2024Q1": 35, "2024Q2": 40, "2024Q3": 45, "2024Q4": 48, "2025Q1": 50, "2025Q2": 52, "2025Q3": 53, "2025Q4": 54, "2026Q1": 55 },
  },
  {
    id: "xinference",
    name: "Xorbits Xinference",
    shortDesc: "开源模型推理引擎，一键部署LLM/Embedding/Reranker，支持vLLM后端",
    category: "infra_tool",
    layer: "infrastructure",
    founded: "2023",
    funding: "数千万元",
    fundingRound: "天使轮",
    products: ["Xinference"],
    githubStars: 6800,
    url: "https://github.com/xorbitsai/inference",
    tags: ["推理部署", "开源", "LLM部署"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 3, "2023Q3": 8, "2023Q4": 15, "2024Q1": 22, "2024Q2": 28, "2024Q3": 32, "2024Q4": 35, "2025Q1": 38, "2025Q2": 40, "2025Q3": 41, "2025Q4": 42, "2026Q1": 43 },
  },

  // ── AI音频 app_audio ──
  {
    id: "fish_audio",
    name: "Fish Audio",
    shortDesc: "开源语音合成平台，Fish Speech模型支持中英日韩多语言零样本克隆",
    category: "app_audio",
    layer: "application",
    founded: "2023",
    funding: "数千万元",
    fundingRound: "种子轮",
    products: ["Fish Speech", "Fish Audio平台"],
    githubStars: 18000,
    url: "https://fish.audio",
    tags: ["语音合成", "TTS", "开源"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 0, "2023Q3": 5, "2023Q4": 10, "2024Q1": 18, "2024Q2": 25, "2024Q3": 35, "2024Q4": 42, "2025Q1": 50, "2025Q2": 55, "2025Q3": 58, "2025Q4": 60, "2026Q1": 62 },
  },
  {
    id: "chattts",
    name: "ChatTTS",
    shortDesc: "专为对话场景设计的语音合成模型，支持韵律控制和笑声等副语言特征",
    category: "app_audio",
    layer: "application",
    founded: "2024",
    funding: "未融资",
    fundingRound: "未融资",
    products: ["ChatTTS"],
    githubStars: 33000,
    url: "https://github.com/2noise/ChatTTS",
    tags: ["TTS", "对话语音", "开源"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 0, "2023Q3": 0, "2023Q4": 0, "2024Q1": 0, "2024Q2": 50, "2024Q3": 60, "2024Q4": 55, "2025Q1": 48, "2025Q2": 42, "2025Q3": 38, "2025Q4": 35, "2026Q1": 33 },
  },
  {
    id: "funasr",
    name: "FunASR",
    shortDesc: "阿里达摩院开源语音识别框架，支持Paraformer等高精度中文ASR模型",
    category: "app_audio",
    layer: "application",
    founded: "2023",
    funding: "阿里巴巴",
    fundingRound: "已上市",
    products: ["FunASR", "Paraformer", "SenseVoice"],
    githubStars: 8500,
    url: "https://github.com/modelscope/FunASR",
    tags: ["语音识别", "ASR", "阿里"],
    heatByQuarter: { "2023Q1": 5, "2023Q2": 10, "2023Q3": 15, "2023Q4": 22, "2024Q1": 28, "2024Q2": 32, "2024Q3": 36, "2024Q4": 40, "2025Q1": 42, "2025Q2": 44, "2025Q3": 45, "2025Q4": 46, "2026Q1": 47 },
  },

  // ── 补充薄弱赛道 ──

  // app_coding +2
  {
    id: "devin_cn",
    name: "DevIn (蚂蚁)",
    shortDesc: "蚂蚁集团推出的AI编程助手，支持代码生成、审查、重构全流程",
    category: "app_coding",
    layer: "application",
    founded: "2024",
    funding: "蚂蚁集团内部",
    fundingRound: "已上市",
    products: ["DevIn编程助手"],
    url: "https://devinsuite.com",
    tags: ["AI编程", "代码生成", "蚂蚁"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 0, "2023Q3": 0, "2023Q4": 0, "2024Q1": 0, "2024Q2": 5, "2024Q3": 12, "2024Q4": 20, "2025Q1": 30, "2025Q2": 38, "2025Q3": 42, "2025Q4": 45, "2026Q1": 48 },
  },
  {
    id: "codegeeex",
    name: "CodeGeeX",
    shortDesc: "智谱AI推出的AI编程助手，基于GLM模型，VSCode/JetBrains全平台支持",
    category: "app_coding",
    layer: "application",
    founded: "2022",
    funding: "智谱AI",
    fundingRound: "E轮+",
    products: ["CodeGeeX"],
    githubStars: 12000,
    url: "https://codegeex.cn",
    tags: ["AI编程", "代码补全", "智谱"],
    heatByQuarter: { "2023Q1": 10, "2023Q2": 15, "2023Q3": 18, "2023Q4": 22, "2024Q1": 28, "2024Q2": 32, "2024Q3": 35, "2024Q4": 38, "2025Q1": 40, "2025Q2": 42, "2025Q3": 43, "2025Q4": 44, "2026Q1": 45 },
  },

  // app_video +1
  {
    id: "hailuo",
    name: "海螺AI视频",
    shortDesc: "MiniMax推出的AI视频生成工具，文本/图片生成高质量短视频",
    category: "app_video",
    layer: "application",
    founded: "2024",
    funding: "MiniMax",
    fundingRound: "已上市",
    products: ["海螺AI视频"],
    url: "https://hailuoai.video",
    tags: ["视频生成", "文生视频", "MiniMax"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 0, "2023Q3": 0, "2023Q4": 0, "2024Q1": 0, "2024Q2": 0, "2024Q3": 15, "2024Q4": 30, "2025Q1": 42, "2025Q2": 48, "2025Q3": 52, "2025Q4": 55, "2026Q1": 58 },
  },

  // app_search +1
  {
    id: "metaso",
    name: "秘塔AI搜索",
    shortDesc: "秘塔科技推出的AI搜索引擎，无广告，结构化深度搜索，月活超千万",
    category: "app_search",
    layer: "application",
    founded: "2023",
    funding: "数亿元",
    fundingRound: "A轮",
    products: ["秘塔AI搜索"],
    url: "https://metaso.cn",
    tags: ["AI搜索", "深度搜索", "无广告"],
    heatByQuarter: { "2023Q1": 0, "2023Q2": 0, "2023Q3": 0, "2023Q4": 5, "2024Q1": 12, "2024Q2": 22, "2024Q3": 35, "2024Q4": 45, "2025Q1": 55, "2025Q2": 60, "2025Q3": 62, "2025Q4": 64, "2026Q1": 65 },
  },
];

// ── Main ──
const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf-8"));
const existingIds = new Set(projects.map((p) => p.id));

let added = 0;
for (const p of newProjects) {
  if (existingIds.has(p.id)) {
    console.log(`  跳过 ${p.name} (${p.id}) — 已存在`);
    continue;
  }
  projects.push(p);
  added++;
  console.log(`  ✅ 添加 ${p.name} (${p.category})`);
}

fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2), "utf-8");

// Count by category
const counts = {};
for (const p of projects) {
  counts[p.category] = (counts[p.category] || 0) + 1;
}

console.log(`\n📊 更新后数据分布 (共${projects.length}个项目):`);
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [cat, count] of sorted) {
  const bar = "█".repeat(count);
  console.log(`  ${cat.padEnd(18)} ${String(count).padStart(2)} ${bar}`);
}
console.log(`\n✅ 新增 ${added} 个项目`);
