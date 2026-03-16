/**
 * GitHub数据采集脚本
 * 采集12个开源项目的stars/forks/commits数据
 * 用法: node scripts/collect-github.js
 * 可选: GITHUB_TOKEN=xxx node scripts/collect-github.js (提升限额到5000/h)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "src", "data", "monitor-config.json");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "monitor-github.json");
const PROJECTS_PATH = path.join(__dirname, "..", "src", "data", "projects.json");

const MAX_SNAPSHOTS = 12;

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      "User-Agent": "ai-ecosystem-monitor/1.0",
      Accept: "application/vnd.github.v3+json",
      ...headers,
    };

    if (process.env.GITHUB_TOKEN) {
      defaultHeaders["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: defaultHeaders,
    };

    https.get(options, (res) => {
      // Handle GitHub 301 redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          httpsGet(redirectUrl, headers).then(resolve).catch(reject);
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
            reject(new Error(`JSON parse error: ${e.message}`));
          }
        } else if (res.statusCode === 403 || res.statusCode === 429) {
          console.warn(`  Rate limited (${res.statusCode}), skipping...`);
          resolve(null);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function collectGitHub() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  const githubMap = config.github;
  const projectNames = config.projectNames;

  // Load existing data
  let existing = { snapshots: [], lastUpdated: null };
  if (fs.existsSync(OUTPUT_PATH)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
  }

  const now = new Date().toISOString().split("T")[0];
  const entries = {};

  console.log(`\n📦 GitHub数据采集 (${Object.keys(githubMap).length}个仓库)`);
  console.log(`   日期: ${now}`);
  console.log("─".repeat(50));

  for (const [projectId, repo] of Object.entries(githubMap)) {
    const name = projectNames[projectId] || projectId;
    process.stdout.write(`  ${name} (${repo})... `);

    try {
      // Basic repo info
      const repoData = await httpsGet(`https://api.github.com/repos/${repo}`);
      if (!repoData) {
        console.log("⏭️ skipped");
        continue;
      }

      await sleep(500);

      // Commit activity (last 52 weeks)
      let weeklyCommits = null;
      try {
        const commitData = await httpsGet(
          `https://api.github.com/repos/${repo}/stats/commit_activity`
        );
        if (Array.isArray(commitData) && commitData.length > 0) {
          const recent4 = commitData.slice(-4);
          weeklyCommits = Math.round(
            recent4.reduce((sum, w) => sum + w.total, 0) / recent4.length
          );
        }
      } catch (e) {
        // commit_activity can 202 (computing), ignore
      }

      entries[projectId] = {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        watchers: repoData.subscribers_count,
        weeklyCommitsAvg: weeklyCommits,
      };

      console.log(
        `⭐ ${(repoData.stargazers_count / 1000).toFixed(1)}k  🍴 ${repoData.forks_count}  📝 ${weeklyCommits ?? "N/A"}/wk`
      );

      await sleep(500);
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  // Anomaly detection
  const anomalies = [];
  const prevSnapshot =
    existing.snapshots.length > 0
      ? existing.snapshots[existing.snapshots.length - 1]
      : null;

  if (prevSnapshot) {
    for (const [id, curr] of Object.entries(entries)) {
      const prev = prevSnapshot.data[id];
      if (!prev) continue;

      const starGrowth = prev.stars > 0 ? (curr.stars - prev.stars) / prev.stars : 0;
      const starDelta = curr.stars - prev.stars;

      if (starGrowth > 0.05) {
        anomalies.push({
          projectId: id,
          type: "github_stars_surge",
          metric: "stars",
          current: curr.stars,
          previous: prev.stars,
          changePercent: +(starGrowth * 100).toFixed(1),
          changeDelta: starDelta,
        });
      }

      if (starDelta > 5000) {
        anomalies.push({
          projectId: id,
          type: "github_stars_absolute",
          metric: "stars",
          current: curr.stars,
          previous: prev.stars,
          changeDelta: starDelta,
        });
      }

      if (
        curr.weeklyCommitsAvg &&
        prev.weeklyCommitsAvg &&
        prev.weeklyCommitsAvg > 0
      ) {
        const commitRatio = curr.weeklyCommitsAvg / prev.weeklyCommitsAvg;
        if (commitRatio > 2) {
          anomalies.push({
            projectId: id,
            type: "github_commits_surge",
            metric: "commits",
            current: curr.weeklyCommitsAvg,
            previous: prev.weeklyCommitsAvg,
            changePercent: +((commitRatio - 1) * 100).toFixed(1),
          });
        }
      }
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
  console.log(`   项目数: ${Object.keys(entries).length}  异动: ${anomalies.length}`);

  // Update projects.json githubStars
  try {
    const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf-8"));
    let updated = 0;
    for (const [id, data] of Object.entries(entries)) {
      const proj = projects.find((p) => p.id === id);
      if (proj && data.stars) {
        proj.githubStars = data.stars;
        updated++;
      }
    }
    if (updated > 0) {
      fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2), "utf-8");
      console.log(`   同步更新 projects.json (${updated}个项目的githubStars)`);
    }
  } catch (e) {
    console.warn(`   ⚠️ 更新projects.json失败: ${e.message}`);
  }

  return { entries, anomalies };
}

if (require.main === module) {
  collectGitHub().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}

module.exports = { collectGitHub };
