/**
 * AI洞察生成脚本
 * 基于GitHub和股价异动数据，调用OpenRouter生成AI分析
 * 用法: node scripts/generate-insights.js
 * 需要: .env.local中的OPENROUTER_API_KEY
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const GITHUB_PATH = path.join(__dirname, "..", "src", "data", "monitor-github.json");
const STOCKS_PATH = path.join(__dirname, "..", "src", "data", "monitor-stocks.json");
const CONFIG_PATH = path.join(__dirname, "..", "src", "data", "monitor-config.json");
const PROJECTS_PATH = path.join(__dirname, "..", "src", "data", "projects.json");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "monitor-insights.json");
const ENV_PATH = path.join(__dirname, "..", ".env.local");

function loadEnv() {
  try {
    const envContent = fs.readFileSync(ENV_PATH, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    // .env.local may not exist
  }
}

function httpsPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const payload = JSON.stringify(body);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
        }
      });
      res.on("error", reject);
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function generateInsights() {
  loadEnv();

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  const projectNames = config.projectNames;
  const now = new Date().toISOString().split("T")[0];

  console.log(`\n🤖 AI洞察生成`);
  console.log(`   日期: ${now}`);
  console.log("─".repeat(50));

  // Collect all anomalies
  const allAnomalies = [];

  // GitHub anomalies
  let githubSummary = "无GitHub数据";
  if (fs.existsSync(GITHUB_PATH)) {
    const github = JSON.parse(fs.readFileSync(GITHUB_PATH, "utf-8"));
    if (github.anomalies && github.anomalies.length > 0) {
      githubSummary = github.anomalies
        .map((a) => {
          const name = projectNames[a.projectId] || a.projectId;
          if (a.type === "github_stars_surge") {
            return `${name}: stars周增长${a.changePercent}% (${a.previous}→${a.current})`;
          }
          if (a.type === "github_stars_absolute") {
            return `${name}: stars周增${a.changeDelta}个`;
          }
          if (a.type === "github_commits_surge") {
            return `${name}: commits活跃度增长${a.changePercent}%`;
          }
          return `${name}: ${a.type}`;
        })
        .join("\n");
      allAnomalies.push(...github.anomalies);
    } else {
      githubSummary = "本周无显著GitHub异动";
    }

    // Also include latest snapshot stats
    if (github.snapshots && github.snapshots.length > 0) {
      const latest = github.snapshots[github.snapshots.length - 1].data;
      const topByStars = Object.entries(latest)
        .sort((a, b) => (b[1].stars || 0) - (a[1].stars || 0))
        .slice(0, 5)
        .map(
          ([id, d]) =>
            `${projectNames[id] || id}: ${(d.stars / 1000).toFixed(1)}k stars`
        )
        .join(", ");
      githubSummary += `\n\nGitHub Stars TOP5: ${topByStars}`;
    }
  }

  // Stock anomalies
  let stockSummary = "无股价数据";
  if (fs.existsSync(STOCKS_PATH)) {
    const stocks = JSON.parse(fs.readFileSync(STOCKS_PATH, "utf-8"));
    if (stocks.anomalies && stocks.anomalies.length > 0) {
      stockSummary = stocks.anomalies
        .map((a) => {
          const name = projectNames[a.projectId] || a.projectId;
          const dir = a.changePercent > 0 ? "涨" : "跌";
          const period = a.metric === "stock_week" ? "周" : "月";
          return `${name}(${a.ticker}): ${period}${dir}${Math.abs(a.changePercent)}%, 价格${a.price}${a.currency}`;
        })
        .join("\n");
      allAnomalies.push(...stocks.anomalies);
    } else {
      stockSummary = "本周无显著股价异动";
    }
  }

  // Format anomalies for output
  const formattedAnomalies = allAnomalies.map((a) => ({
    ...a,
    projectName: projectNames[a.projectId] || a.projectId,
    severity: getSeverity(a),
  }));

  // Generate AI insights
  let aiInsights = [];
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.log("  ⚠️ 未设置OPENROUTER_API_KEY，跳过AI洞察生成");
    console.log("     使用异动数据生成基础摘要...");
    aiInsights = generateFallbackInsights(formattedAnomalies, projectNames);
  } else {
    console.log("  调用OpenRouter生成AI洞察...");

    const prompt = `你是中国AI生态分析师。基于以下本周监控数据变化，生成3-5条生态洞察（每条100-200字，中文）。
重点关注：什么在升温？什么在降温？有哪些出人意料的变化？结构性趋势是什么？
也关注上市公司年报中的员工数量变化作为招聘扩张/收缩信号。

GitHub异动：
${githubSummary}

股价异动：
${stockSummary}

请以JSON数组格式返回，每个元素包含 title(10字以内标题) 和 content(100-200字分析) 字段。
只返回JSON数组，不要其他内容。`;

    try {
      const response = await httpsPost(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://ai-ecosystem-map.local",
        }
      );

      const content = response.choices?.[0]?.message?.content || "";
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiInsights = JSON.parse(jsonMatch[0]);
        console.log(`  ✅ 生成${aiInsights.length}条AI洞察`);
      } else {
        console.log("  ⚠️ AI返回格式异常，使用备用摘要");
        aiInsights = generateFallbackInsights(formattedAnomalies, projectNames);
      }
    } catch (err) {
      console.log(`  ❌ AI调用失败: ${err.message}`);
      console.log("     使用备用摘要...");
      aiInsights = generateFallbackInsights(formattedAnomalies, projectNames);
    }
  }

  // ── Gap Analysis (缺口分析) ──
  console.log("\n  📊 生态缺口分析...");
  const gapAnalysis = analyzeGaps();
  console.log(`  ✅ 发现 ${gapAnalysis.gaps.length} 个缺口, ${gapAnalysis.concentrations.length} 个拥挤赛道`);

  // Save output
  const output = {
    lastUpdated: now,
    anomalies: formattedAnomalies,
    insights: aiInsights,
    gapAnalysis,
    summary: {
      githubAnomalyCount: allAnomalies.filter((a) => a.type.startsWith("github")).length,
      stockAnomalyCount: allAnomalies.filter((a) => a.type.startsWith("stock")).length,
      totalAnomalies: allAnomalies.length,
      gapCount: gapAnalysis.gaps.length,
    },
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n✅ 已保存到 ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log(
    `   异动: ${output.summary.totalAnomalies} (GitHub: ${output.summary.githubAnomalyCount}, 股价: ${output.summary.stockAnomalyCount})`
  );
  console.log(`   洞察: ${aiInsights.length}条`);

  return output;
}

// ── 生态矩阵缺口分析 ──

const IDEAL_ECOSYSTEM = {
  // 每个赛道的"理想"最低项目数和全球对标
  model_open: { min: 5, global: "Meta Llama, Mistral, Falcon", desc: "开源大模型" },
  model_closed: { min: 5, global: "OpenAI, Anthropic, Google", desc: "闭源大模型" },
  model_eval: { min: 3, global: "LMSYS, HuggingFace Open LLM, Stanford HELM", desc: "模型评测" },
  app_office: { min: 4, global: "ChatGPT, Gemini, Copilot", desc: "AI办公" },
  app_coding: { min: 4, global: "GitHub Copilot, Cursor, Replit, Codeium", desc: "AI编程" },
  app_design: { min: 3, global: "Midjourney, DALL-E, Adobe Firefly", desc: "AI设计" },
  app_video: { min: 3, global: "Runway, Pika, Sora", desc: "AI视频" },
  app_search: { min: 3, global: "Perplexity, You.com, SearchGPT", desc: "AI搜索" },
  app_agent: { min: 5, global: "AutoGPT, LangChain, CrewAI, OpenAI Agents", desc: "AI Agent" },
  app_audio: { min: 3, global: "ElevenLabs, Whisper, Suno", desc: "AI音频" },
  infra_chip: { min: 4, global: "NVIDIA, AMD, Intel, Groq", desc: "AI芯片" },
  infra_cloud: { min: 4, global: "AWS Bedrock, Azure OpenAI, GCP Vertex", desc: "AI云服务" },
  infra_framework: { min: 4, global: "PyTorch, JAX, TensorFlow", desc: "AI框架" },
  infra_data: { min: 3, global: "Scale AI, Labelbox, Snorkel", desc: "数据服务" },
  infra_tool: { min: 4, global: "Pinecone, Weaviate, vLLM, Ollama", desc: "AI工具链" },
  ai_safety: { min: 3, global: "Anthropic Constitutional AI, OpenAI Safety, DeepMind Safety", desc: "AI安全" },
  embodied_robot: { min: 4, global: "Boston Dynamics, Figure AI, Tesla Optimus", desc: "人形机器人" },
  embodied_auto: { min: 4, global: "Waymo, Cruise, Tesla FSD", desc: "自动驾驶" },
};

function analyzeGaps() {
  let projects = [];
  try {
    projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf-8"));
  } catch (e) {
    return { gaps: [], concentrations: [], distribution: {}, totalProjects: 0 };
  }

  // Count by category
  const counts = {};
  const heatByCategory = {};
  for (const p of projects) {
    counts[p.category] = (counts[p.category] || 0) + 1;
    if (!heatByCategory[p.category]) heatByCategory[p.category] = [];
    const latestHeat = p.heatByQuarter["2026Q1"] || p.heatByQuarter["2025Q4"] || 0;
    heatByCategory[p.category].push({ id: p.id, name: p.name, heat: latestHeat });
  }

  // Find gaps (under-represented)
  const gaps = [];
  const concentrations = [];

  for (const [category, ideal] of Object.entries(IDEAL_ECOSYSTEM)) {
    const count = counts[category] || 0;
    const avgHeat =
      heatByCategory[category]
        ? heatByCategory[category].reduce((s, p) => s + p.heat, 0) / (heatByCategory[category].length || 1)
        : 0;

    if (count === 0) {
      gaps.push({
        category,
        label: ideal.desc,
        count: 0,
        idealMin: ideal.min,
        severity: "empty",
        globalBenchmark: ideal.global,
        insight: `中国AI生态在"${ideal.desc}"赛道完全空白，全球对标有${ideal.global}。`,
      });
    } else if (count < ideal.min) {
      gaps.push({
        category,
        label: ideal.desc,
        count,
        idealMin: ideal.min,
        severity: count <= 2 ? "critical" : "weak",
        globalBenchmark: ideal.global,
        players: (heatByCategory[category] || []).map((p) => p.name),
        insight: `"${ideal.desc}"仅有${count}个玩家（${(heatByCategory[category] || []).map((p) => p.name).join("、")}），低于健康生态所需的${ideal.min}个。全球对标：${ideal.global}。`,
      });
    }

    if (count >= ideal.min * 2) {
      concentrations.push({
        category,
        label: ideal.desc,
        count,
        avgHeat: Math.round(avgHeat),
        topPlayers: (heatByCategory[category] || [])
          .sort((a, b) => b.heat - a.heat)
          .slice(0, 3)
          .map((p) => p.name),
      });
    }
  }

  // Sort gaps by severity
  const severityOrder = { empty: 0, critical: 1, weak: 2 };
  gaps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Layer-level analysis
  const layerMap = {
    application: ["app_office", "app_coding", "app_design", "app_video", "app_search", "app_agent", "app_audio"],
    model: ["model_open", "model_closed", "model_eval"],
    infrastructure: ["infra_chip", "infra_cloud", "infra_framework", "infra_data", "infra_tool", "ai_safety"],
    embodied: ["embodied_robot", "embodied_auto"],
  };

  const layerStats = {};
  for (const [layer, categories] of Object.entries(layerMap)) {
    const total = categories.reduce((s, c) => s + (counts[c] || 0), 0);
    const gapCount = categories.filter(
      (c) => (counts[c] || 0) < (IDEAL_ECOSYSTEM[c]?.min || 3)
    ).length;
    layerStats[layer] = { total, categories: categories.length, gapCount };
  }

  return {
    gaps,
    concentrations,
    distribution: counts,
    layerStats,
    totalProjects: projects.length,
  };
}

function getSeverity(anomaly) {
  if (anomaly.type === "github_stars_absolute" && anomaly.changeDelta > 10000) return "high";
  if (anomaly.type === "github_stars_surge" && anomaly.changePercent > 15) return "high";
  if (anomaly.type.includes("stock") && Math.abs(anomaly.changePercent) > 20) return "high";
  if (anomaly.type.includes("stock") && Math.abs(anomaly.changePercent) > 10) return "medium";
  return "medium";
}

function generateFallbackInsights(anomalies, projectNames) {
  const insights = [];

  // Load raw data for multi-dimensional analysis
  let latestGithub = {};
  let latestStocks = {};
  let gapData = null;

  try {
    const gh = JSON.parse(fs.readFileSync(GITHUB_PATH, "utf-8"));
    if (gh.snapshots && gh.snapshots.length > 0) {
      latestGithub = gh.snapshots[gh.snapshots.length - 1].data;
    }
  } catch (e) {}

  try {
    const st = JSON.parse(fs.readFileSync(STOCKS_PATH, "utf-8"));
    if (st.snapshots && st.snapshots.length > 0) {
      latestStocks = st.snapshots[st.snapshots.length - 1].data;
    }
  } catch (e) {}

  try {
    gapData = analyzeGaps();
  } catch (e) {}

  // ── 1. 市场情绪 ──
  const stockEntries = Object.entries(latestStocks);
  if (stockEntries.length > 0) {
    const weekVals = stockEntries
      .filter(([, d]) => d.weekChangePercent !== null)
      .map(([, d]) => d.weekChangePercent);
    const monthVals = stockEntries
      .filter(([, d]) => d.monthChangePercent !== null)
      .map(([, d]) => d.monthChangePercent);
    const weekAvg = weekVals.length > 0 ? weekVals.reduce((a, b) => a + b, 0) / weekVals.length : 0;
    const monthAvg = monthVals.length > 0 ? monthVals.reduce((a, b) => a + b, 0) / monthVals.length : 0;
    const upCount = weekVals.filter((v) => v > 0).length;
    const downCount = weekVals.filter((v) => v < 0).length;
    const sentiment = weekAvg > 2 ? "偏多" : weekAvg < -2 ? "偏空" : "震荡";

    insights.push({
      title: "市场情绪",
      content: `AI板块整体${sentiment}：${stockEntries.length}只标的中${upCount}涨${downCount}跌，周均${weekAvg > 0 ? "+" : ""}${weekAvg.toFixed(1)}%、月均${monthAvg > 0 ? "+" : ""}${monthAvg.toFixed(1)}%。${
        weekAvg < -5
          ? "市场恐慌情绪较重，需警惕系统性风险。"
          : weekAvg < -2
            ? "短期承压明显，关注是否有政策面催化。"
            : weekAvg > 3
              ? "市场情绪亢奋，注意追高风险。"
              : "整体波动可控，观望为主。"
      }`,
      type: "trend",
      metric: `${weekAvg > 0 ? "+" : ""}${weekAvg.toFixed(1)}%`,
      relatedProjects: stockEntries.slice(0, 3).map(([id]) => id),
    });
  }

  // ── 2. 开源动量 ──
  const githubEntries = Object.entries(latestGithub);
  if (githubEntries.length > 0) {
    const totalStars = githubEntries.reduce((s, [, d]) => s + (d.stars || 0), 0);
    const topByStars = githubEntries.sort((a, b) => (b[1].stars || 0) - (a[1].stars || 0));
    const top3 = topByStars.slice(0, 3).map(([id, d]) => `${projectNames[id] || id}(${(d.stars / 1000).toFixed(1)}k)`).join("、");
    const avgForkRatio = githubEntries.reduce((s, [, d]) => s + (d.stars > 0 ? d.forks / d.stars : 0), 0) / githubEntries.length;

    insights.push({
      title: "开源动量",
      content: `监控${githubEntries.length}个开源项目，累计Stars ${(totalStars / 1000).toFixed(0)}k。TOP3：${top3}。平均Fork/Star比${(avgForkRatio * 100).toFixed(1)}%，${
        avgForkRatio > 0.2
          ? "说明开发者积极参与二次开发，生态活跃。"
          : "比值偏低，多数项目以观望型关注为主。"
      }`,
      type: "trend",
      metric: `${(totalStars / 1000).toFixed(0)}k★`,
      relatedProjects: topByStars.slice(0, 5).map(([id]) => id),
    });
  }

  // ── 3. 生态均衡 ──
  if (gapData && gapData.gaps.length > 0) {
    const weakest = gapData.gaps[0];
    const gapNames = gapData.gaps.map((g) => g.label).join("、");
    insights.push({
      title: "生态均衡",
      content: `中国AI生态存在${gapData.gaps.length}个薄弱环节：${gapNames}。最突出的是"${weakest.label}"（${weakest.count}/${weakest.idealMin}），全球对标${weakest.globalBenchmark}。基础设施层缺口最多，制约上层应用发展。`,
      type: "alert",
      metric: `${gapData.gaps.length}缺口`,
      relatedProjects: gapData.gaps.flatMap((g) => g.players || []).slice(0, 3).map((name) => {
        const entry = Object.entries(projectNames).find(([, n]) => n === name);
        return entry ? entry[0] : name;
      }),
    });
  }

  // ── 4. 板块轮动 ──
  if (stockEntries.length > 0) {
    const byCurrency = {};
    for (const [id, data] of stockEntries) {
      const key = data.currency;
      if (!byCurrency[key]) byCurrency[key] = [];
      byCurrency[key].push({ id, ...data });
    }
    const sectorSummary = Object.entries(byCurrency)
      .map(([cur, items]) => {
        const avg = items.reduce((s, d) => s + (d.weekChangePercent || 0), 0) / items.length;
        return { cur, avg, count: items.length };
      })
      .sort((a, b) => b.avg - a.avg);
    const strongest = sectorSummary[0];
    const weakestSector = sectorSummary[sectorSummary.length - 1];
    insights.push({
      title: "板块轮动",
      content: `按交易市场分组：${sectorSummary.map((s) => `${s.cur}(${s.count}只,周均${s.avg > 0 ? "+" : ""}${s.avg.toFixed(1)}%)`).join("、")}。${
        strongest.cur !== weakestSector.cur
          ? `${strongest.cur}板块相对抗跌，${weakestSector.cur}板块承压较重。`
          : "各板块走势趋同，缺乏明显的结构性分化。"
      }`,
      type: "trend",
      metric: `${strongest.cur}领先`,
      relatedProjects: stockEntries.slice(0, 3).map(([id]) => id),
    });
  }

  // ── 5. 交叉信号（GitHub+股价同时有数据的项目） ──
  const crossProjects = Object.keys(latestGithub).filter((id) => id in latestStocks);
  if (crossProjects.length > 0) {
    const signals = crossProjects.map((id) => {
      const gh = latestGithub[id];
      const st = latestStocks[id];
      return { id, stars: gh.stars, weekPct: st.weekChangePercent, name: projectNames[id] || id };
    });
    const divergent = signals.filter((s) => s.weekPct !== null && s.weekPct < -5);
    if (divergent.length > 0) {
      insights.push({
        title: "交叉信号",
        content: `${crossProjects.length}个项目同时有开源和股价数据。其中${divergent.map((d) => `${d.name}(★${(d.stars / 1000).toFixed(0)}k但股价周跌${d.weekPct.toFixed(1)}%)`).join("、")}呈现"开源热度高但资本市场冷"的背离，可能是潜在低估机会或商业化困境信号。`,
        type: "opportunity",
        metric: `${divergent.length}背离`,
        relatedProjects: divergent.map((d) => d.id),
      });
    } else {
      insights.push({
        title: "交叉信号",
        content: `${crossProjects.length}个项目同时有开源和股价数据，本周未发现显著的热度-市值背离信号。开源活跃度与资本市场走势基本一致。`,
        type: "neutral",
        metric: "0背离",
        relatedProjects: crossProjects.slice(0, 3),
      });
    }
  }

  // ── 6. 集中度风险 ──
  if (githubEntries.length > 2) {
    const sorted = [...githubEntries].sort((a, b) => (b[1].stars || 0) - (a[1].stars || 0));
    const top1Stars = sorted[0][1].stars || 0;
    const avgStars = githubEntries.reduce((s, [, d]) => s + (d.stars || 0), 0) / githubEntries.length;
    const ratio = top1Stars / (avgStars || 1);
    const top1Name = projectNames[sorted[0][0]] || sorted[0][0];

    insights.push({
      title: "集中度风险",
      content: `开源Stars高度集中：${top1Name}以${(top1Stars / 1000).toFixed(0)}k Stars占据头部位置，是平均值的${ratio.toFixed(1)}倍。${
        ratio > 5
          ? "高度马太效应，头部项目虹吸效应明显，中小项目难获关注。"
          : ratio > 3
            ? "头部效应显著但尚在合理范围，中腰部项目仍有突围机会。"
            : "分布较均匀，竞争格局健康。"
      }`,
      type: "risk",
      metric: `${ratio.toFixed(1)}x集中`,
      relatedProjects: sorted.slice(0, 3).map(([id]) => id),
    });
  }

  // ── 7. 估值回调 / 资本升温 (原有逻辑增强) ──
  const stockUp = anomalies.filter((a) => a.type.includes("stock") && a.changePercent > 0);
  const stockDown = anomalies.filter((a) => a.type.includes("stock") && a.changePercent < 0);

  if (stockUp.length > 0) {
    const names = stockUp.map((a) => `${a.projectName}(+${a.changePercent}%)`).join("、");
    insights.push({
      title: "资本升温",
      content: `本周AI相关上市公司中，${names}出现显著上涨，反映市场对相关赛道的看好。需辨别是业绩驱动的价值重估还是情绪驱动的短期炒作。`,
      type: "alert",
      metric: `${stockUp.length}只↑`,
      relatedProjects: stockUp.map((a) => a.projectId),
    });
  }

  if (stockDown.length > 0) {
    const names = stockDown.map((a) => `${a.projectName}(${a.changePercent}%)`).join("、");
    insights.push({
      title: "估值回调",
      content: `本周${names}出现明显回调。${
        stockDown.some((a) => Math.abs(a.changePercent) > 20)
          ? "部分跌幅超20%，已进入技术性熊市区间，需关注是否触发融资盘强平或机构减持。"
          : "跌幅尚在正常调整范围，可能是前期涨幅过大后的技术回调。"
      }`,
      type: "alert",
      metric: `${stockDown.length}只↓`,
      relatedProjects: stockDown.map((a) => a.projectId),
    });
  }

  // ── 8. GitHub异动 (如果有) ──
  const githubAnomalies = anomalies.filter((a) => a.type.startsWith("github"));
  if (githubAnomalies.length > 0) {
    const names = githubAnomalies.map((a) => a.projectName).join("、");
    insights.push({
      title: "开源异动",
      content: `本周GitHub开源社区出现异动信号：${names}。开源Stars和Commits活跃度的变化往往领先于商业化落地3-6个月，值得持续跟踪技术路线和社区生态演进。`,
      type: "trend",
      metric: `${githubAnomalies.length}异动`,
      relatedProjects: githubAnomalies.map((a) => a.projectId),
    });
  }

  // If no insights generated at all
  if (insights.length === 0) {
    insights.push({
      title: "生态平稳",
      content: "本周中国AI生态主要指标未出现显著异动，各项目保持稳定发展态势。建议关注即将到来的季度财报和新品发布。",
      type: "neutral",
      metric: "0异动",
      relatedProjects: [],
    });
  }

  return insights;
}

if (require.main === module) {
  generateInsights().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}

module.exports = { generateInsights };
