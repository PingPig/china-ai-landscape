/**
 * 整合研究agent返回的真实数据
 * 数据来源：公开新闻、港股/美股IPO信息、GitHub API
 */

const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'src', 'data', 'projects.json');
const data = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

// === 1. Update existing projects with REAL funding data ===
const fundingUpdates = {
  deepseek: {
    funding: "$7亿(PitchBook)/幻方自有资金",
    fundingRound: "A轮",
    shortDesc: "GitHub 398K Stars, R1推理模型2025年1月开源引发美股震动, V3训练成本仅557万美元, MAU约1.25亿",
  },
  moonshot: {
    funding: "累计超$25亿, 估值$180亿",
    fundingRound: "C轮",
    shortDesc: "Kimi Chat 2024年爆火, 2026年3月估值达$180亿, 中国最快独角兽(成立2年), K2.5上线20天收入超2025全年",
  },
  zhipu: {
    funding: "IPO融资$5.58亿, 累计超$15亿",
    fundingRound: "已上市",
    shortDesc: "2026年1月港股上市(Z.ai), 市值超520亿港元, 1.2万企业客户, 4500万+开发者, 2024年营收$4530万",
  },
  baichuan: {
    funding: "累计超$10.4亿",
    fundingRound: "A轮",
    shortDesc: "前搜狗CEO王小川创立, 2025年3月转型AI医疗, 发布Baichuan-M3医疗大模型",
  },
  minimax: {
    funding: "IPO融资$6.19亿, 累计超$14亿",
    fundingRound: "已上市",
    shortDesc: "2026年1月港股上市, 市值超$490亿(超越百度), 海螺AI 70%收入来自海外, TTM收入$7900万",
  },
  stepfun: {
    funding: "B+轮融资超50亿元($7.17亿)",
    fundingRound: "B轮",
    shortDesc: "前微软副总裁姜大昕创立, 2026年1月B+轮融资$7.17亿, OPPO合作2000万DAU, 目标年营收10亿元",
  },
  doubao: {
    funding: "字节跳动",
    fundingRound: "已上市",
    shortDesc: "2025年12月DAU突破1亿(中国首个), MAU 2.27亿, 火山引擎日处理63万亿tokens, 占中国公有云LLM市场49.2%",
  },
  kling: {
    funding: "快手",
    fundingRound: "已上市",
    shortDesc: "2025年全年收入约$1.4亿, 2025年12月ARR达$2.4亿, MAU 1200万, 累计生成6亿+视频, 40+国家下载榜首",
  },
  cambricon: {
    funding: "已上市(科创板688256)",
    fundingRound: "已上市",
    shortDesc: "2025年营收64.97亿元(+453%), 首次全年盈利20.59亿元, 市值超$660亿, 2026年计划芯片产量翻3倍",
  },
  unitree: {
    funding: "C轮约7亿元, 估值$17亿",
    fundingRound: "C轮",
    shortDesc: "2024年营收超10亿元, Go1累计出货5万+台, 全球消费级四足60%市场份额, 目标$70亿估值IPO",
  },
  pony: {
    funding: "累计VC $11.9亿+港股IPO $8亿",
    fundingRound: "已上市",
    shortDesc: "纳斯达克+港股双重上市, Q3 2025营收$2540万(+72% YoY), 深圳Robotaxi实现单位经济效益盈亏平衡",
  },
  horizon: {
    funding: "港股IPO $6.96亿+PIPE $8.21亿",
    fundingRound: "已上市",
    shortDesc: "2024年港股上市, 市值$114亿, ADAS市场份额45.8%, 2025年芯片出货目标1000万+片",
  },
  iflytek: {
    funding: "A股上市",
    fundingRound: "已上市",
    shortDesc: "2024年营收233.4亿元(+18.8%), 星火大模型收入+200% YoY, 87万开发者团队, 海外收入+212%",
  },
  biren: {
    funding: "2026年1月港股IPO约$3亿, C轮$2.09亿",
    fundingRound: "已上市",
    shortDesc: "2026年1月港股上市, 市值$107亿, BR100系列通用GPU, 2024年营收$4780万",
  },
  enflame: {
    funding: "累计$7.45-13.9亿, E轮",
    fundingRound: "E轮+",
    shortDesc: "国产AI训练芯片, 云燧系列加速卡, E轮融资后已提交科创板IPO申请, 860名员工",
  },
  yi: {
    funding: "累计约$3亿, 估值$10亿+",
    fundingRound: "B轮",
    shortDesc: "李开复创立, 8个月估值破$10亿, 2025年转型放弃自研模型改用DeepSeek开源, 专注AI应用",
  },
  agibot: {
    funding: "B轮, 估值超$20亿",
    fundingRound: "B轮",
    shortDesc: "前华为天才少年稚晖君创立, 2025年全球人形机器人出货量第一(5168台), 估值超$20亿",
  },
  fourier: {
    funding: "9轮融资累计近$2亿",
    fundingRound: "E轮+",
    shortDesc: "通用人形机器人GR系列已量产, 9轮融资近$2亿, 获软银/Aramco投资, GR-3最新一代",
  },
  ubtech: {
    funding: "港股上市, 累计配股超74亿港元",
    fundingRound: "已上市",
    shortDesc: "全球首家上市人形机器人公司(港股9880), Walker系列2025年订单累计达13亿元",
  },
  minicpm: {
    funding: "B轮, 投资方含茅台基金/中国电信",
    fundingRound: "B轮",
    shortDesc: "清华系端侧AI模型, MiniCPM系列累计下载超1000万次, GitHub 14K+ Stars, 部署于吉利/大众/华为终端",
    githubStars: 14000,
  },
  dify: {
    funding: "Pre-A轮$3000万",
    fundingRound: "A轮",
    shortDesc: "GitHub 133K Stars, 开源AI Agent工作流平台, 获阿里云战略投资, 支持企业级RAG和Agent开发",
  },
  momenta: {
    funding: "累计超$14.2亿, 估值$50-60亿",
    fundingRound: "D轮",
    shortDesc: "累计融资超$14亿, 与BMW/奔驰/Uber达成合作, 量产智驾方案市场占有率领先",
  },
};

// Apply updates
let updated = 0;
data.forEach(p => {
  if (fundingUpdates[p.id]) {
    const u = fundingUpdates[p.id];
    Object.assign(p, u);
    p.dataSource = {
      githubStars: p.githubStars ? "GitHub API 2026-03-16" : null,
      funding: "公开报道/IPO招股书/PitchBook 2025-2026",
      heat: "方法论v2.0计算",
    };
    updated++;
  }
});
console.log(`Updated ${updated} existing projects with real funding data`);

// === 2. Add important missing projects ===
const existingIds = new Set(data.map(p => p.id));
const newProjects = [
  {
    id: "moore_threads",
    name: "摩尔线程",
    shortDesc: "2025年12月科创板上市融资$11亿, 市值超3000亿元, 2024年营收4.38亿(+252%)",
    category: "infra_chip",
    layer: "infrastructure",
    founded: "2020",
    funding: "科创板IPO融资约80亿元",
    fundingRound: "已上市",
    products: ["MUSA S4000", "MUSA S80", "KUAE"],
    url: "https://www.mthreads.com",
    tags: ["GPU", "国产芯片", "上市公司"],
  },
  {
    id: "galbot",
    name: "银河通用 Galbot",
    shortDesc: "成立不到2年估值达$30亿, 获宁德时代/博世/丰田数千台订单, 登上2026春晚",
    category: "embodied_robot",
    layer: "embodied",
    founded: "2023",
    funding: "累计超$3亿, 估值$30亿",
    fundingRound: "B轮",
    products: ["Galbot G1"],
    url: "https://www.galbot.com",
    tags: ["人形机器人", "通用机器人", "春晚"],
  },
  {
    id: "weride",
    name: "文远知行 WeRide",
    shortDesc: "全球首个在5国持有自动驾驶牌照, 美股+港股双重上市, 与Uber达成合作",
    category: "embodied_auto",
    layer: "embodied",
    founded: "2017",
    funding: "IPO+定增约$4.6亿",
    fundingRound: "已上市",
    products: ["WeRide One", "Robotaxi", "无人清扫车"],
    url: "https://www.weride.ai",
    tags: ["自动驾驶", "L4", "双重上市"],
  },
  {
    id: "hesai",
    name: "禾赛科技",
    shortDesc: "全球车载激光雷达份额连续4年第一, 全球首家实现全年non-GAAP盈利的激光雷达上市公司",
    category: "embodied_auto",
    layer: "embodied",
    founded: "2014",
    funding: "纳斯达克+港股双重上市",
    fundingRound: "已上市",
    products: ["AT128", "AT512", "FT120", "ET25"],
    url: "https://www.hesaitech.com",
    tags: ["激光雷达", "自动驾驶", "双重上市"],
  },
  {
    id: "metagpt",
    name: "MetaGPT",
    shortDesc: "GitHub 50K Stars, 多Agent协作框架, 模拟软件公司角色分工自动完成开发任务",
    category: "app_agent",
    layer: "application",
    founded: "2023",
    funding: "数千万元",
    fundingRound: "种子轮",
    products: ["MetaGPT"],
    githubStars: 50000,
    url: "https://www.deepwisdom.ai",
    tags: ["AI Agent", "多Agent", "开源"],
  },
  {
    id: "baidu_cloud",
    name: "百度智能云",
    shortDesc: "千帆大模型平台, 2025上半年大模型中标数量与金额双双领先, 服务65%央企和80%系统重要性银行",
    category: "infra_cloud",
    layer: "infrastructure",
    founded: "2017",
    funding: "百度",
    fundingRound: "已上市",
    products: ["千帆大模型平台", "智能体平台", "百度智能云"],
    url: "https://cloud.baidu.com",
    tags: ["AI云", "百度", "大模型平台"],
  },
  {
    id: "huawei_modelarts",
    name: "华为云ModelArts",
    shortDesc: "华为云一站式AI开发平台, 支持万亿参数模型训练, 深度适配昇腾生态",
    category: "infra_cloud",
    layer: "infrastructure",
    founded: "2018",
    funding: "华为",
    fundingRound: "已上市",
    products: ["ModelArts Studio", "盘古大模型平台"],
    url: "https://www.huaweicloud.com/product/modelarts.html",
    tags: ["AI开发平台", "华为云", "昇腾"],
  },
];

let added = 0;
newProjects.forEach(p => {
  if (existingIds.has(p.id)) {
    console.log("Skip (exists):", p.name);
    return;
  }
  p.heatByQuarter = {};
  p.dataSource = {
    githubStars: p.githubStars ? "GitHub API 2026-03-16" : null,
    funding: "公开报道/IPO信息 2025-2026",
    heat: "方法论v2.0计算",
  };
  data.push(p);
  added++;
});
console.log(`Added ${added} new projects. Total: ${data.length}`);

// === 3. Update heat scores with new knowledge ===
// Now we need to update BASE_HEAT in recalc-heat-v2.js and re-run
// For now, save the updated funding data
fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

// Show category distribution
const cats = {};
data.forEach(p => cats[p.category] = (cats[p.category] || 0) + 1);
console.log('\nFinal category distribution:');
Object.entries(cats).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));
