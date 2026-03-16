const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'src', 'data', 'projects.json');
const data = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

const existingIds = new Set(data.map(p => p.id));

const newProjects = [
  {
    id: "paddlepaddle",
    name: "百度飞桨 PaddlePaddle",
    shortDesc: "GitHub 23.8K Stars, 国内首个自主研发开源深度学习框架, 工业级应用超千万",
    category: "infra_framework",
    layer: "infrastructure",
    founded: "2016",
    funding: "百度",
    fundingRound: "已上市",
    products: ["PaddlePaddle", "PaddleNLP", "PaddleOCR", "PaddleDetection"],
    githubStars: 23800,
    url: "https://www.paddlepaddle.org.cn",
    tags: ["开源", "深度学习框架", "百度"]
  },
  {
    id: "mindspore",
    name: "华为MindSpore",
    shortDesc: "GitHub 4.7K Stars, 华为自研AI计算框架, 深度适配昇腾芯片",
    category: "infra_framework",
    layer: "infrastructure",
    founded: "2020",
    funding: "华为",
    fundingRound: "已上市",
    products: ["MindSpore", "MindFormers", "MindNLP"],
    githubStars: 4700,
    url: "https://www.mindspore.cn",
    tags: ["开源", "AI框架", "华为"]
  },
  {
    id: "colossalai",
    name: "ColossalAI",
    shortDesc: "GitHub 41.4K Stars, 大模型并行训练框架, 降低AI训练成本和门槛",
    category: "infra_framework",
    layer: "infrastructure",
    founded: "2021",
    funding: "数千万美元",
    fundingRound: "A轮",
    products: ["ColossalAI", "ColossalChat", "Open-Sora"],
    githubStars: 41400,
    url: "https://colossalai.org",
    tags: ["开源", "并行训练", "大模型"]
  },
  {
    id: "volcengine",
    name: "火山引擎",
    shortDesc: "字节跳动企业级云服务平台, 提供豆包大模型API, 服务百万开发者",
    category: "infra_cloud",
    layer: "infrastructure",
    founded: "2020",
    funding: "字节跳动",
    fundingRound: "已上市",
    products: ["火山引擎", "豆包大模型API", "veImageX", "DataWind"],
    url: "https://www.volcengine.com",
    tags: ["云服务", "字节跳动", "AI平台"]
  },
  {
    id: "tencentcloud_ti",
    name: "腾讯云TI平台",
    shortDesc: "腾讯AI开发平台, 混元大模型API, 覆盖训练/部署/推理全流程",
    category: "infra_cloud",
    layer: "infrastructure",
    founded: "2018",
    funding: "腾讯",
    fundingRound: "已上市",
    products: ["TI平台", "混元大模型", "HunyuanVideo"],
    url: "https://cloud.tencent.com/product/ti",
    tags: ["云服务", "腾讯", "大模型"]
  },
  {
    id: "yi",
    name: "零一万物 Yi",
    shortDesc: "GitHub 7.8K Stars, 李开复创立, Yi系列开源模型, 2024年融资数亿美元",
    category: "model_open",
    layer: "model",
    founded: "2023",
    funding: "数亿美元",
    fundingRound: "A轮",
    products: ["Yi-34B", "Yi-VL", "Yi-Coder"],
    githubStars: 7800,
    url: "https://www.01.ai",
    tags: ["开源", "多模态", "李开复"]
  },
  {
    id: "internlm",
    name: "书生 InternLM",
    shortDesc: "GitHub 7.2K Stars, 上海AI实验室开源大模型系列, 多模态能力领先",
    category: "model_open",
    layer: "model",
    founded: "2023",
    funding: "政府+企业",
    fundingRound: "未融资",
    products: ["InternLM2.5", "InternVL", "Lagent", "XTuner"],
    githubStars: 7200,
    url: "https://internlm.intern-ai.org.cn",
    tags: ["开源", "研究", "上海AI实验室"]
  },
  {
    id: "minicpm",
    name: "面壁MiniCPM",
    shortDesc: "GitHub 8.7K Stars, 端侧小模型, 手机可运行的高性能模型, 性能对标大模型",
    category: "model_open",
    layer: "model",
    founded: "2022",
    funding: "数亿元",
    fundingRound: "A轮",
    products: ["MiniCPM", "MiniCPM-V", "CPM-Bee"],
    githubStars: 8700,
    url: "https://www.modelbest.cn",
    tags: ["开源", "端侧模型", "小模型"]
  },
  {
    id: "ubtech",
    name: "优必选",
    shortDesc: "2024年港股上市, Walker系列人形机器人, 累计融资超50亿元, 工业场景落地",
    category: "embodied_robot",
    layer: "embodied",
    founded: "2012",
    funding: "超50亿元",
    fundingRound: "已上市",
    products: ["Walker S", "Walker X", "Yanshee", "AIMOGA"],
    url: "https://www.ubtrobot.com",
    tags: ["人形机器人", "上市公司", "商业落地"]
  },
  {
    id: "fourier",
    name: "傅利叶智能",
    shortDesc: "通用人形机器人GR系列, 2024年发布GR-2, 具身智能代表企业, 融资超10亿元",
    category: "embodied_robot",
    layer: "embodied",
    founded: "2015",
    funding: "超10亿元",
    fundingRound: "D轮",
    products: ["GR-1", "GR-2", "ExoMotus"],
    url: "https://www.fftai.com",
    tags: ["人形机器人", "具身智能", "康复"]
  },
  {
    id: "agibot",
    name: "智元机器人",
    shortDesc: "前华为天才少年稚晖君创立, 远征A2人形机器人, 2024年A轮融资超6亿元",
    category: "embodied_robot",
    layer: "embodied",
    founded: "2023",
    funding: "超6亿元",
    fundingRound: "A轮",
    products: ["远征A1", "远征A2"],
    url: "https://www.agibot.com",
    tags: ["人形机器人", "稚晖君", "具身智能"]
  },
  {
    id: "momenta",
    name: "Momenta",
    shortDesc: "自动驾驶公司, 与上汽/丰田/奔驰合作量产, 累计融资超10亿美元",
    category: "embodied_auto",
    layer: "embodied",
    founded: "2016",
    funding: "超10亿美元",
    fundingRound: "C轮",
    products: ["Mpilot", "MSD"],
    url: "https://www.momenta.cn",
    tags: ["自动驾驶", "量产", "L2+"]
  },
  {
    id: "huawei_ads",
    name: "华为ADS智驾",
    shortDesc: "华为智能驾驶方案, 搭载问界/阿维塔/智界等车型, 城区NCA不依赖高精地图",
    category: "embodied_auto",
    layer: "embodied",
    founded: "2019",
    funding: "华为",
    fundingRound: "已上市",
    products: ["ADS 2.0", "ADS 3.0", "MDC智驾平台"],
    url: "https://www.huawei.com",
    tags: ["智能驾驶", "华为", "全场景"]
  },
  {
    id: "dify",
    name: "Dify",
    shortDesc: "GitHub 133K Stars, 开源AI应用开发平台, 可视化编排LLM工作流, 全球用户超百万",
    category: "app_agent",
    layer: "application",
    founded: "2023",
    funding: "数千万美元",
    fundingRound: "A轮",
    products: ["Dify Cloud", "Dify Enterprise"],
    githubStars: 133000,
    url: "https://dify.ai",
    tags: ["开源", "AI平台", "LLM编排"]
  },
  {
    id: "biren",
    name: "壁仞科技",
    shortDesc: "国产GPU芯片公司, BR100系列通用GPU, 2022年累计融资超50亿元",
    category: "infra_chip",
    layer: "infrastructure",
    founded: "2019",
    funding: "超50亿元",
    fundingRound: "B轮",
    products: ["BR100", "BR104", "BIRENSUPA"],
    url: "https://www.birentech.com",
    tags: ["GPU", "国产芯片", "算力"]
  },
  {
    id: "enflame",
    name: "燧原科技",
    shortDesc: "国产AI训练芯片, 云燧系列AI加速卡, 累计融资超50亿元",
    category: "infra_chip",
    layer: "infrastructure",
    founded: "2018",
    funding: "超50亿元",
    fundingRound: "C轮",
    products: ["云燧T20", "云燧T21", "驭算TopsRider"],
    url: "https://www.enflame-tech.com",
    tags: ["AI芯片", "训练芯片", "国产算力"]
  },
  {
    id: "hunyuan",
    name: "腾讯混元",
    shortDesc: "腾讯自研大模型, 混元MoE架构, 支持文生图/视频, 开源HunyuanVideo",
    category: "model_closed",
    layer: "model",
    founded: "2023",
    funding: "腾讯",
    fundingRound: "已上市",
    products: ["混元大模型", "HunyuanVideo", "混元API"],
    url: "https://hunyuan.tencent.com",
    tags: ["闭源", "MoE", "腾讯"]
  },
];

let added = 0;
newProjects.forEach(p => {
  if (existingIds.has(p.id)) {
    console.log('Skipped (exists):', p.name);
    return;
  }
  p.heatByQuarter = {
    "2023Q1": 0, "2023Q2": 0, "2023Q3": 0, "2023Q4": 0,
    "2024Q1": 0, "2024Q2": 0, "2024Q3": 0, "2024Q4": 0,
    "2025Q1": 0, "2025Q2": 0, "2025Q3": 0, "2025Q4": 0,
    "2026Q1": 0
  };
  p.dataSource = {
    githubStars: p.githubStars ? "GitHub API 2026-03-16" : null,
    funding: "公开新闻报道",
    heat: "方法论v1.0计算"
  };
  data.push(p);
  added++;
});

fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`\nAdded ${added} new projects. Total: ${data.length}`);

// Show category distribution
const cats = {};
data.forEach(p => cats[p.category] = (cats[p.category] || 0) + 1);
console.log('\nCategory distribution:');
Object.entries(cats).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));
