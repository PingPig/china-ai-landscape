/**
 * 股价数据采集脚本
 * 采集15家上市公司的股价数据（Yahoo Finance）
 * 用法: node scripts/collect-stocks.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "src", "data", "monitor-config.json");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "monitor-stocks.json");

const MAX_SNAPSHOTS = 12;
const REQUEST_DELAY_MS = 2000;

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    };

    https.get(options, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          httpsGet(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error for ${url}: ${e.message}`));
          }
        } else if (res.statusCode === 403 || res.statusCode === 429) {
          console.warn(`  Rate limited (${res.statusCode}), skipping...`);
          resolve(null);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseYahooChart(data) {
  try {
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;

    if (!quotes || !timestamps || timestamps.length === 0) return null;

    // Get closing prices
    const closes = quotes.close.filter((c) => c !== null);
    if (closes.length === 0) return null;

    const latestClose = closes[closes.length - 1];
    const currency = meta.currency || "USD";

    // Week change (5 trading days)
    let weekChange = null;
    if (closes.length >= 5) {
      const weekAgo = closes[closes.length - 5];
      weekChange = +((latestClose - weekAgo) / weekAgo * 100).toFixed(2);
    }

    // Month change (all available data, ~22 trading days)
    let monthChange = null;
    if (closes.length >= 2) {
      const monthAgo = closes[0];
      monthChange = +((latestClose - monthAgo) / monthAgo * 100).toFixed(2);
    }

    return {
      price: +latestClose.toFixed(2),
      currency,
      weekChangePercent: weekChange,
      monthChangePercent: monthChange,
    };
  } catch (e) {
    return null;
  }
}

async function collectStocks() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  const stockMap = config.stocks;
  const projectNames = config.projectNames;

  // Load existing data
  let existing = { snapshots: [], lastUpdated: null };
  if (fs.existsSync(OUTPUT_PATH)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
  }

  const now = new Date().toISOString().split("T")[0];
  const entries = {};

  console.log(`\n📈 股价数据采集 (${Object.keys(stockMap).length}只股票)`);
  console.log(`   日期: ${now}`);
  console.log("─".repeat(50));

  for (const [projectId, ticker] of Object.entries(stockMap)) {
    const name = projectNames[projectId] || projectId;
    process.stdout.write(`  ${name} (${ticker})... `);

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1mo&interval=1d`;
      const data = await httpsGet(url);

      if (!data) {
        console.log("⏭️ skipped");
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const parsed = parseYahooChart(data);
      if (!parsed) {
        console.log("❌ 无数据");
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      entries[projectId] = {
        ticker,
        ...parsed,
      };

      const weekStr = parsed.weekChangePercent !== null
        ? `${parsed.weekChangePercent > 0 ? "+" : ""}${parsed.weekChangePercent}%`
        : "N/A";
      const monthStr = parsed.monthChangePercent !== null
        ? `${parsed.monthChangePercent > 0 ? "+" : ""}${parsed.monthChangePercent}%`
        : "N/A";

      console.log(
        `💰 ${parsed.price} ${parsed.currency}  周${weekStr}  月${monthStr}`
      );

      await sleep(REQUEST_DELAY_MS);
    } catch (err) {
      console.log(`❌ ${err.message}`);
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // Anomaly detection
  const anomalies = [];
  for (const [id, data] of Object.entries(entries)) {
    if (data.weekChangePercent !== null && Math.abs(data.weekChangePercent) > 10) {
      anomalies.push({
        projectId: id,
        type: data.weekChangePercent > 0 ? "stock_surge" : "stock_drop",
        metric: "stock_week",
        ticker: data.ticker,
        price: data.price,
        currency: data.currency,
        changePercent: data.weekChangePercent,
      });
    }

    if (data.monthChangePercent !== null && Math.abs(data.monthChangePercent) > 20) {
      anomalies.push({
        projectId: id,
        type: data.monthChangePercent > 0 ? "stock_month_surge" : "stock_month_drop",
        metric: "stock_month",
        ticker: data.ticker,
        price: data.price,
        currency: data.currency,
        changePercent: data.monthChangePercent,
      });
    }
  }

  // Save snapshot
  const newSnapshot = { date: now, data: entries };
  existing.snapshots.push(newSnapshot);
  if (existing.snapshots.length > MAX_SNAPSHOTS) {
    existing.snapshots = existing.snapshots.slice(-MAX_SNAPSHOTS);
  }
  existing.lastUpdated = now;
  existing.anomalies = anomalies;

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2), "utf-8");
  console.log(`\n✅ 已保存到 ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log(`   股票数: ${Object.keys(entries).length}  异动: ${anomalies.length}`);

  return { entries, anomalies };
}

if (require.main === module) {
  collectStocks().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}

module.exports = { collectStocks };
