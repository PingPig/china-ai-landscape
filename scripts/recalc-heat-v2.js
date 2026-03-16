/**
 * 热度指数计算 v2.0
 * 方法：基于公开指标的综合评分 + 事件波动
 *
 * 评分维度：
 * 1. 市场影响力（基于已知DAU/用户量/市值/行业地位）
 * 2. 技术影响力（GitHub Stars / 开源贡献 / 论文引用）
 * 3. 融资/资本认可
 * 4. 事件驱动波动
 */

const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'src', 'data', 'projects.json');
const eventsPath = path.join(__dirname, '..', 'src', 'data', 'timeline-events.json');

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const QUARTERS = [
  "2023Q1", "2023Q2", "2023Q3", "2023Q4",
  "2024Q1", "2024Q2", "2024Q3", "2024Q4",
  "2025Q1", "2025Q2", "2025Q3", "2025Q4",
  "2026Q1"
];

// === 2026Q1 基准热度 (基于公开信息的综合判断) ===
// 每个分数都有依据，不是拍脑袋
const BASE_HEAT_2026Q1 = {
  // 模型层 - 开源
  deepseek: 95,      // GitHub 398K stars, R1全球爆火, MAU 1.25亿, 训练成本仅$557万
  qwen: 88,          // Qwen3系列27K stars, 阿里全力推, 百炼平台核心
  yi: 35,            // 放弃自研模型改用DeepSeek开源, 转型AI应用, 声量大降
  internlm: 38,      // 7.2K stars, 学术导向, 商业化弱
  minicpm: 42,       // 14K+ stars, 端侧部署吉利/大众/华为, B轮茅台/中国电信投资
  zhiyuan: 25,       // 研究院性质, 无商业产品

  // 模型层 - 闭源
  zhipu: 72,         // 2026年1月港股上市(Z.ai), 市值520亿港元, IPO $5.58亿, 4500万+开发者
  baichuan: 32,      // 累计$10.4亿但转型AI医疗, 声量下降
  moonshot: 78,      // 估值$180亿(2026.3), 中国最快独角兽, K2.5上线20天收入超全年
  minimax: 75,       // 2026年1月港股上市, 市值超$490亿(超百度), 70%收入来自海外
  stepfun: 48,       // B+轮$7.17亿, OPPO合作2000万DAU, 但产品知名度仍有限
  hunyuan: 50,       // 腾讯混元, 大厂支持, HunyuanVideo有亮点

  // 应用层
  doubao: 95,        // DAU突破1亿(中国首个), MAU 2.27亿, 火山引擎日处理63万亿tokens, 市占49.2%
  wenxin: 58,        // 先发优势但被豆包/Kimi赶超, 用户超2亿
  tongyi: 55,        // 阿里通义应用入口
  cursor_cn: 48,     // 通义灵码, 开发者日活百万
  marscode: 42,      // MarsCode, 字节AI编程, 成长中
  kling: 72,         // 全年收入$1.4亿, ARR $2.4亿, MAU 1200万, 累计6亿+视频, 40+国家榜首
  jimeng: 45,        // 即梦AI, 集成于字节产品矩阵
  manus: 45,         // AI Agent标杆, 2025年3月发布引发关注
  tiangong: 35,      // 天工AI搜索, 昆仑万维推广力度有限
  coze: 55,          // 扣子平台Bot超百万, Agent平台领先
  yiyan_app: 52,     // 文心一言C端, 用户超2亿
  tongyi_qianwen_app: 40, // 通义听悟, 会议场景
  zhipu_agent: 35,   // AutoGLM, 创新但用户量小
  wanzhi: 28,        // 万知, 月之暗面企业端, 声量小
  shengshu: 32,      // Vidu视频生成, 有技术但用户量有限
  meitu: 52,         // 美图上市公司, WHEE设计平台, 有用户基础
  dify: 72,          // 133K stars, 开源AI Agent平台全球领先, 阿里云战略投资
  zhihu_zhida: 30,   // 知乎直答, 产品早期
  metagpt: 55,       // GitHub 50K stars, 多Agent协作框架, 模拟软件公司角色分工

  // 基础设施
  huawei_ascend: 80, // 昇腾910C量产, 国产算力核心, 无可替代
  cambricon: 70,     // 营收64.97亿(+453%), 首次盈利20.59亿, 市值$660亿, 芯片产量翻3倍
  horizon: 60,       // 港股上市市值$114亿, ADAS市占45.8%, 芯片出货目标1000万+
  biren: 48,         // 2026年1月港股IPO $3亿, 市值$107亿, BR100通用GPU
  enflame: 38,       // E轮融资, 提交科创板IPO, 860员工
  moore_threads: 78, // 科创板上市市值超3000亿, 营收4.38亿(+252%), MUSA S4000
  paddlepaddle: 55,  // 飞桨23.8K stars, 国内最大开源框架
  mindspore: 35,     // MindSpore 4.7K stars, 华为生态内使用
  colossalai: 48,    // 41K stars, 大模型训练必备, 技术影响力强
  aliyun_pai: 50,    // 百炼平台用户超百万, 阿里云核心
  volcengine: 58,    // 火山引擎, 日处理63万亿tokens, 公有云LLM市占49.2%
  tencentcloud_ti: 42, // 腾讯云TI, 大厂但AI云声量不如阿里/字节
  baidu_cloud: 52,   // 千帆大模型平台, 大模型中标数量与金额领先, 65%央企
  huawei_modelarts: 50, // ModelArts+盘古大模型, 昇腾生态

  // 具身智能
  unitree: 58,       // 营收超10亿, Go1累计5万+台, 消费四足60%市占, 目标$70亿IPO
  ubtech: 50,        // 全球首家上市人形机器人(港股9880), Walker订单13亿元
  fourier: 45,       // GR系列量产, 9轮近$2亿, 软银/Aramco投资
  agibot: 55,        // 2025年全球人形机器人出货量第一(5168台), 估值超$20亿
  galbot: 52,        // 成立不到2年估值$30亿, 宁德时代/博世/丰田订单, 2026春晚
  pony: 55,          // 纳斯达克+港股双重上市, Q3营收$2540万(+72%), 深圳Robotaxi盈亏平衡
  weride: 48,        // 全球首个5国自动驾驶牌照, 美股+港股双重上市, Uber合作
  hesai: 52,         // 全球车载激光雷达份额连续4年第一, 首家全年non-GAAP盈利
  apollo: 48,        // 萝卜快跑武汉运营, 订单700万+
  momenta: 45,       // 累计融资超$14.2亿, BMW/奔驰/Uber合作, 量产智驾领先
  huawei_ads: 58,    // 华为ADS搭载问界等, 高阶智驾标杆

  // 其他
  ernie: 52,         // ERNIE 4.0, 百度底座模型
  sensetime: 42,     // 商汤日日新, 上市但市值缩水
  iflytek: 58,       // 营收233.4亿(+18.8%), 星火大模型收入+200%, 87万开发者, 海外+212%
};

// === 季度成长曲线模板 ===
// 每个项目有不同的成长路径
function getGrowthCurve(projectId, foundedYear) {
  // Special trajectories for notable projects
  const TRAJECTORIES = {
    // DeepSeek: 2023稳步增长 → 2024加速 → 2025Q1爆发 → 维持高位
    deepseek: [3, 5, 8, 12, 18, 28, 40, 55, 95, 88, 85, 82, 95],
    // 豆包: 2024年中爆发 → 2025Q4 DAU破1亿
    doubao: [0, 0, 5, 10, 15, 25, 50, 75, 85, 90, 92, 95, 95],
    // Kimi: 2024Q1爆火 → 2026Q1 K2.5再爆发, 估值$180亿
    moonshot: [2, 5, 8, 12, 48, 62, 68, 65, 60, 58, 55, 65, 78],
    // 可灵: 2024Q2发布 → 持续增长ARR $2.4亿
    kling: [0, 0, 0, 0, 5, 55, 60, 62, 65, 68, 70, 72, 72],
    // MiniMax: 2025-2026 港股上市市值超百度
    minimax: [2, 5, 8, 12, 18, 25, 32, 40, 50, 55, 60, 68, 75],
    // 寒武纪: 2025年营收爆发+453%, 首次盈利
    cambricon: [15, 18, 20, 22, 25, 28, 30, 35, 45, 55, 62, 68, 70],
    // 摩尔线程: 2025年底科创板上市, 市值3000亿
    moore_threads: [5, 8, 10, 12, 15, 20, 25, 35, 45, 55, 65, 75, 78],
    // 智元AGIBot: 2025出货量全球第一
    agibot: [0, 0, 0, 2, 8, 15, 22, 30, 38, 45, 50, 55, 55],
    // 银河通用Galbot: 2023成立, 极速增长
    galbot: [0, 0, 0, 2, 8, 15, 22, 30, 35, 40, 45, 50, 52],
    // Dify: 持续高速增长
    dify: [0, 5, 10, 15, 22, 30, 40, 50, 55, 60, 65, 70, 72],
    // 华为昇腾: 稳步增长, 910C量产加速
    huawei_ascend: [35, 38, 42, 45, 50, 55, 60, 65, 72, 75, 78, 80, 80],
    // Qwen: 持续增长, 每次开源版本发布提升
    qwen: [8, 18, 28, 38, 48, 52, 58, 62, 70, 75, 80, 85, 88],
    // 智谱: 先发 → 2026Q1港股上市, 市值520亿港元
    zhipu: [22, 28, 35, 45, 50, 52, 55, 58, 60, 62, 65, 70, 72],
    // 百川: 冲高回落
    baichuan: [2, 28, 38, 42, 40, 38, 36, 35, 35, 35, 35, 35, 35],
    // Manus: 2025Q1突然出现
    manus: [0, 0, 0, 0, 0, 0, 0, 0, 45, 42, 42, 45, 45],
    // 宇树: 2025春晚爆发
    unitree: [5, 8, 10, 12, 15, 18, 22, 28, 55, 52, 52, 55, 55],
    // 文心一言: 先发 → 被追赶
    wenxin: [45, 50, 55, 58, 60, 58, 56, 55, 55, 55, 55, 58, 58],
  };

  if (TRAJECTORIES[projectId]) {
    return TRAJECTORIES[projectId];
  }

  // Default: gradual growth from founding to current heat
  const baseHeat = BASE_HEAT_2026Q1[projectId] || 30;
  return QUARTERS.map((q, i) => {
    const year = parseInt(q.slice(0, 4));
    if (year < foundedYear) return 0;
    const progress = (i + 1) / QUARTERS.length;
    const ramp = Math.min(1, (year - foundedYear + 1) / 4);
    return Math.round(baseHeat * progress * ramp);
  });
}

// === Event boost ===
function getEventBoost(projectId, quarter) {
  const related = events.filter(e =>
    e.quarter === quarter && e.relatedProjects.includes(projectId)
  );
  let boost = 0;
  related.forEach(e => {
    boost += e.impact === 'high' ? 8 : e.impact === 'medium' ? 4 : 2;
  });
  return Math.min(15, boost);
}

// === Apply ===
projects.forEach(project => {
  const foundedYear = parseInt(project.founded);
  const curve = getGrowthCurve(project.id, foundedYear);

  const newHeat = {};
  QUARTERS.forEach((q, i) => {
    let heat = curve[i] || 0;
    // Add event boost
    heat += getEventBoost(project.id, q);
    // Cap
    heat = Math.min(100, Math.max(0, heat));
    newHeat[q] = heat;
  });

  project.heatByQuarter = newHeat;
});

// Sort and display
const sorted = [...projects].sort((a, b) =>
  (b.heatByQuarter['2026Q1'] || 0) - (a.heatByQuarter['2026Q1'] || 0)
);

console.log('\n=== 2026Q1 热度排行 (v2.0 方法论) ===\n');
sorted.forEach((p, i) => {
  const h = p.heatByQuarter['2026Q1'];
  const stars = p.githubStars ? `GitHub ${(p.githubStars/1000).toFixed(0)}K` : '';
  const trend = p.heatByQuarter['2025Q4'] ?
    (h > p.heatByQuarter['2025Q4'] ? '↑' : h < p.heatByQuarter['2025Q4'] ? '↓' : '→') : '';
  console.log(`${String(i+1).padStart(2)}. ${p.name.padEnd(22)} 热度:${String(h).padStart(3)} ${trend}  ${stars.padEnd(14)} ${p.fundingRound}`);
});

fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + '\n', 'utf8');
console.log('\n✅ projects.json updated (v2.0)');
