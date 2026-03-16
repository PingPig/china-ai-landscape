/**
 * 一键运行全部数据采集 + AI洞察生成
 * 用法: node scripts/collect-all.js
 */

const { collectGitHub } = require("./collect-github");
const { collectStocks } = require("./collect-stocks");
const { generateInsights } = require("./generate-insights");

async function collectAll() {
  const startTime = Date.now();

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   AI生态监控 — 全量数据采集              ║");
  console.log("╚══════════════════════════════════════════╝");

  // Step 1: GitHub
  console.log("\n[1/3] GitHub数据采集");
  try {
    await collectGitHub();
  } catch (err) {
    console.error(`  ❌ GitHub采集失败: ${err.message}`);
  }

  // Step 2: Stocks
  console.log("\n[2/3] 股价数据采集");
  try {
    await collectStocks();
  } catch (err) {
    console.error(`  ❌ 股价采集失败: ${err.message}`);
  }

  // Step 3: AI Insights
  console.log("\n[3/3] AI洞察生成");
  try {
    await generateInsights();
  } catch (err) {
    console.error(`  ❌ AI洞察生成失败: ${err.message}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ 全部完成! 耗时 ${elapsed}s`);
  console.log(`   下一步: npx next build && npx next start -p 4000`);
}

collectAll().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
