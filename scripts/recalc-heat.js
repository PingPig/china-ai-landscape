/**
 * 热度指数重新计算脚本
 * 基于 METHODOLOGY.md 方法论，用真实数据替代拍脑袋数据
 * 运行: node scripts/recalc-heat.js
 */

const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'src', 'data', 'projects.json');
const eventsPath = path.join(__dirname, '..', 'src', 'data', 'timeline-events.json');

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// === REAL GitHub Stars (collected 2026-03-16 via GitHub API) ===
const REAL_GITHUB_STARS = {
  deepseek: 398000,   // org total: V3(102K)+R1(92K)+Coder(23K)+others
  qwen: 88000,        // Qwen3(27K)+Qwen(21K)+Code(21K)+VL(19K)
  zhipu: 4800,        // THUDM/slime(4.8K)+GLM(3.5K) - ChatGLM repos removed
  baichuan: 4100,     // Baichuan2
  minimax: 0,         // closed source
  zhiyuan: 0,         // research institute, no major repo
  // Frameworks/tools found
  // dify: 133000, colossalai: 41300, paddle: 23800 (for new projects)
};

// === Funding scale scoring ===
const FUNDING_SCORE = {
  '已上市': 70,        // public company
  'E轮+': 85,
  'D轮': 70,
  'C轮': 55,
  'B轮': 45,
  'A轮': 35,
  '天使轮': 20,
  '种子轮': 20,
  '未融资': 10,
};

// Special cases: listed companies with known high valuation
const HIGH_VALUE_LISTED = new Set([
  'doubao', 'wenxin', 'tongyi', 'huawei_ascend', // parent company mega-cap
  'pony', 'sensetime', 'cambricon', 'iflytek', 'horizon', 'meitu'
]);

// === Quarter timeline ===
const QUARTERS = [
  "2023Q1", "2023Q2", "2023Q3", "2023Q4",
  "2024Q1", "2024Q2", "2024Q3", "2024Q4",
  "2025Q1", "2025Q2", "2025Q3", "2025Q4",
  "2026Q1"
];

function normalize(value, min, max) {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

function getGithubScore(stars) {
  if (!stars || stars <= 0) return 0;
  // log scale: 1K=20, 10K=45, 50K=65, 100K=78, 400K=100
  const logVal = Math.log10(stars);
  return Math.min(100, Math.round(normalize(logVal, 2.8, 5.6) * 100));
}

function getFundingScore(project) {
  let base = FUNDING_SCORE[project.fundingRound] || 30;
  if (HIGH_VALUE_LISTED.has(project.id)) base = 90;
  return base;
}

function getProductScore(products) {
  return Math.min(100, products.length * 20);
}

function getEventScore(projectId, quarter) {
  const related = events.filter(e =>
    e.quarter === quarter && e.relatedProjects.includes(projectId)
  );
  let score = 0;
  related.forEach(e => {
    score += e.impact === 'high' ? 40 : e.impact === 'medium' ? 20 : 10;
  });
  return Math.min(100, score);
}

// === Main calculation ===
projects.forEach(project => {
  // Update GitHub stars with real data
  if (REAL_GITHUB_STARS[project.id] !== undefined) {
    project.githubStars = REAL_GITHUB_STARS[project.id] || undefined;
  }

  const stars = project.githubStars || 0;
  const hasGithub = stars > 0;

  // Base scores
  const githubScore = getGithubScore(stars);
  const fundingScore = getFundingScore(project);
  const productScore = getProductScore(project.products);

  // Calculate base heat (without events)
  let baseHeat;
  if (hasGithub) {
    // Open source formula: GitHub is king
    baseHeat = githubScore * 0.50 + fundingScore * 0.20 + productScore * 0.15;
  } else {
    // Closed source formula
    baseHeat = fundingScore * 0.30 + productScore * 0.25;
    // Add public metric bonus for known popular products
    const popularApps = {
      doubao: 95, moonshot: 80, wenxin: 70, tongyi: 65,
      kling: 65, coze: 60, iflytek: 60, yiyan_app: 65,
      cursor_cn: 55, marscode: 50, jimeng: 45, manus: 55,
      tiangong: 35, huawei_ascend: 70, pony: 40, horizon: 45,
      cambricon: 35, unitree: 50, sensetime: 35, meitu: 40,
    };
    baseHeat += (popularApps[project.id] || 20) * 0.20;
  }

  // Founded year - project didn't exist before founding
  const foundedYear = parseInt(project.founded);

  // Calculate heat per quarter
  const newHeat = {};
  QUARTERS.forEach((q, qi) => {
    const year = parseInt(q.slice(0, 4));
    const qNum = parseInt(q.slice(-1));

    // Before founding: 0
    if (year < foundedYear) {
      newHeat[q] = 0;
      return;
    }

    // Founding year: ramp up
    const quartersActive = (year - foundedYear) * 4 + qNum;
    const rampFactor = Math.min(1, quartersActive / 6); // full ramp in 6 quarters

    // Event boost for this quarter
    const eventScore = getEventScore(project.id, q);

    // Combine: base * ramp + event boost
    let heat = Math.round(baseHeat * rampFactor + eventScore * 0.20);

    // Add time-based growth trend (later quarters slightly higher as ecosystem matures)
    const timeFactor = 1 + (qi / QUARTERS.length) * 0.3;
    heat = Math.round(heat * timeFactor);

    // Cap at 100
    heat = Math.min(100, Math.max(1, heat));

    newHeat[q] = heat;
  });

  project.heatByQuarter = newHeat;
});

// Sort by 2026Q1 heat for verification
const sorted = [...projects].sort((a, b) =>
  (b.heatByQuarter['2026Q1'] || 0) - (a.heatByQuarter['2026Q1'] || 0)
);

console.log('\n=== 2026Q1 热度排行 (方法论计算) ===\n');
sorted.forEach((p, i) => {
  const h = p.heatByQuarter['2026Q1'];
  const stars = p.githubStars ? `⭐${(p.githubStars/1000).toFixed(0)}K` : '';
  console.log(`${String(i+1).padStart(2)}. ${p.name.padEnd(20)} 热度:${String(h).padStart(3)}  ${stars}  ${p.fundingRound}`);
});

// Write back
fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + '\n', 'utf8');
console.log('\n✅ projects.json updated with recalculated heat values');
