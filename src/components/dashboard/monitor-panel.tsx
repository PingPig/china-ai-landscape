"use client";

import { useState, useMemo, useEffect } from "react";
import { MonitorData, MonitorAnomaly, MonitorInsight, GapEntry, GapAnalysis } from "@/lib/types";

interface Props {
  monitorData: MonitorData;
  selectedProjectId?: string;
  onSelectProject?: (projectId: string) => void;
}

type SubTab = "anomalies" | "github" | "stocks" | "insights" | "gaps";

// ── Insight type config ──
const INSIGHT_TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  trend: { color: "#3b82f6", icon: "📊" },
  alert: { color: "#ef4444", icon: "🚨" },
  opportunity: { color: "#10b981", icon: "💡" },
  risk: { color: "#f97316", icon: "⚠️" },
  neutral: { color: "#6b7280", icon: "📌" },
};

export default function MonitorPanel({ monitorData, selectedProjectId, onSelectProject }: Props) {
  const { github, stocks, insights } = monitorData;
  const [subTab, setSubTab] = useState<SubTab>("anomalies");

  const lastUpdated =
    insights?.lastUpdated || github?.lastUpdated || stocks?.lastUpdated || null;

  const allAnomalies = insights?.anomalies || [];
  const aiInsights = insights?.insights || [];
  const summary = insights?.summary || {
    githubAnomalyCount: 0,
    stockAnomalyCount: 0,
    totalAnomalies: 0,
  };

  const latestGithub =
    github?.snapshots && github.snapshots.length > 0
      ? github.snapshots[github.snapshots.length - 1].data
      : null;

  const latestStocks =
    stocks?.snapshots && stocks.snapshots.length > 0
      ? stocks.snapshots[stocks.snapshots.length - 1].data
      : null;

  const gapAnalysis = insights?.gapAnalysis || null;

  const hasData = lastUpdated !== null;

  // ── Computed stats ──
  const stockStats = useMemo(() => {
    if (!latestStocks) return { weekAvg: 0, count: 0 };
    const entries = Object.values(latestStocks);
    const weekVals = entries.filter(s => s.weekChangePercent !== null).map(s => s.weekChangePercent!);
    const weekAvg = weekVals.length > 0 ? weekVals.reduce((a, b) => a + b, 0) / weekVals.length : 0;
    return { weekAvg, count: entries.length };
  }, [latestStocks]);

  // ── Health score ──
  const healthScore = useMemo(() => {
    let score = 100;
    const gapCount = gapAnalysis?.gaps.length || 0;
    score -= gapCount * 5;
    for (const a of allAnomalies) {
      score -= a.severity === "high" ? 3 : 1;
    }
    if (stockStats.weekAvg < 0) {
      score -= Math.min(15, Math.abs(stockStats.weekAvg) * 1.5);
    }
    return Math.max(0, Math.round(score));
  }, [gapAnalysis, allAnomalies, stockStats]);

  const healthColor = healthScore > 80 ? "#10b981" : healthScore >= 60 ? "#f59e0b" : "#ef4444";

  // ── Auto-switch to relevant sub-tab when project selected ──
  useEffect(() => {
    if (!selectedProjectId) return;
    const hasAnomaly = allAnomalies.some(a => a.projectId === selectedProjectId);
    const hasStock = latestStocks && selectedProjectId in latestStocks;
    const hasGithub = latestGithub && selectedProjectId in latestGithub;
    if (hasAnomaly) setSubTab("anomalies");
    else if (hasStock) setSubTab("stocks");
    else if (hasGithub) setSubTab("github");
  }, [selectedProjectId, allAnomalies, latestStocks, latestGithub]);

  // ── Highlight helper ──
  const getHighlightStyle = (projectId: string) => {
    if (!selectedProjectId) return {};
    if (projectId === selectedProjectId) {
      return { background: "var(--accent-1)" + "18", border: "1.5px solid var(--accent-1)" };
    }
    return { opacity: 0.4 };
  };

  // ── Stock groups by currency ──
  const stockGroups = useMemo(() => {
    if (!latestStocks) return {};
    const groups: Record<string, [string, typeof latestStocks[string]][]> = {};
    for (const [id, data] of Object.entries(latestStocks)) {
      const key = data.currency;
      if (!groups[key]) groups[key] = [];
      groups[key].push([id, data]);
    }
    return groups;
  }, [latestStocks]);

  const subTabs: { key: SubTab; label: string; count?: number }[] = [
    { key: "anomalies", label: "异动", count: allAnomalies.length },
    { key: "gaps", label: "缺口", count: gapAnalysis?.gaps.length || 0 },
    { key: "github", label: "GitHub", count: latestGithub ? Object.keys(latestGithub).length : 0 },
    { key: "stocks", label: "股价", count: latestStocks ? Object.keys(latestStocks).length : 0 },
    { key: "insights", label: "洞察", count: aiInsights.length },
  ];

  return (
    <div className="h-full dash-panel flex flex-col min-h-0">
      {/* Header */}
      <div className="p-2 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: hasData ? healthColor : "#6b7280" }}
            />
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-1)" }}>
              生态监控
            </span>
            {hasData && (
              <span
                className="text-[9px] font-mono font-bold px-1 py-0.5 rounded"
                style={{ backgroundColor: healthColor + "20", color: healthColor }}
              >
                {healthScore}
              </span>
            )}
          </div>
          <span className="text-[9px]" style={{ color: "var(--text-4)" }}>
            {lastUpdated ? `${lastUpdated}` : "未采集"}
          </span>
        </div>

        {/* Selected project badge */}
        {selectedProjectId && (
          <div className="flex items-center gap-1 mb-1">
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "var(--accent-1)" + "20", color: "var(--accent-1)" }}
            >
              {selectedProjectId}
              <button
                onClick={() => onSelectProject?.("")}
                className="hover:opacity-70 text-[8px] leading-none"
                style={{ color: "var(--accent-1)" }}
              >
                x
              </button>
            </span>
          </div>
        )}

        {!hasData && (
          <div className="text-[10px]" style={{ color: "var(--text-3)" }}>
            运行 <code className="px-1 py-0.5 rounded" style={{ background: "var(--bg-hover)" }}>node scripts/collect-all.js</code>
          </div>
        )}

        {/* Sub-tab switcher */}
        {hasData && (
          <div className="flex gap-1 mt-1">
            {subTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setSubTab(t.key)}
                className="text-[9px] px-1.5 py-1 rounded transition-all"
                style={{
                  background: subTab === t.key ? "var(--accent-1)" : "var(--bg-hover)",
                  color: subTab === t.key ? "#fff" : "var(--text-3)",
                  fontWeight: subTab === t.key ? 600 : 400,
                }}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="ml-0.5 opacity-70">({t.count})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Summary stats bar */}
        {hasData && (
          <div
            className="flex items-center gap-2 mt-1.5 text-[9px] font-mono"
            style={{ color: "var(--text-3)" }}
          >
            <span>
              异动 <span style={{ color: allAnomalies.length > 0 ? "#ef4444" : "var(--text-3)", fontWeight: 600 }}>{allAnomalies.length}</span>
            </span>
            <span style={{ color: "var(--border)" }}>|</span>
            <span>
              缺口 <span style={{ fontWeight: 600 }}>{gapAnalysis?.gaps.length || 0}</span>
            </span>
            <span style={{ color: "var(--border)" }}>|</span>
            <span>
              周均{" "}
              <span style={{
                color: stockStats.weekAvg > 0 ? "#10b981" : stockStats.weekAvg < 0 ? "#ef4444" : "var(--text-3)",
                fontWeight: 600,
              }}>
                {stockStats.weekAvg > 0 ? "+" : ""}{stockStats.weekAvg.toFixed(1)}%
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
        {/* Anomalies tab */}
        {subTab === "anomalies" && (
          <>
            {allAnomalies.length === 0 && (
              <div className="text-[10px] text-center py-6" style={{ color: "var(--text-4)" }}>
                {hasData ? "本周暂无显著异动" : "等待数据采集..."}
              </div>
            )}
            {allAnomalies.map((anomaly, i) => (
              <div key={`${anomaly.projectId}-${anomaly.type}-${i}`} style={getHighlightStyle(anomaly.projectId)}>
                <AnomalyCard
                  anomaly={anomaly}
                  onClick={() => onSelectProject?.(anomaly.projectId)}
                />
              </div>
            ))}
          </>
        )}

        {/* Gaps tab */}
        {subTab === "gaps" && (
          <>
            {(!gapAnalysis || gapAnalysis.gaps.length === 0) && (
              <div className="text-[10px] text-center py-6" style={{ color: "var(--text-4)" }}>
                {hasData ? "生态分布均衡，无明显缺口" : "采集数据后分析"}
              </div>
            )}
            {gapAnalysis && (
              <>
                {gapAnalysis.layerStats && (
                  <div className="rounded p-2 mb-1" style={{ background: "var(--bg-hover)" }}>
                    <div className="text-[9px] font-semibold mb-1.5" style={{ color: "var(--text-2)" }}>
                      生态覆盖度 ({gapAnalysis.totalProjects}个项目)
                    </div>
                    <div className="space-y-1">
                      {Object.entries(gapAnalysis.layerStats).map(([layer, stats]) => {
                        const layerLabels: Record<string, string> = {
                          application: "应用层",
                          model: "模型层",
                          infrastructure: "基础设施",
                          embodied: "具身智能",
                        };
                        const health = stats.gapCount === 0 ? "#10b981" : stats.gapCount <= 1 ? "#f59e0b" : "#ef4444";
                        return (
                          <div key={layer} className="flex items-center justify-between">
                            <span className="text-[9px]" style={{ color: "var(--text-2)" }}>
                              {layerLabels[layer] || layer}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono" style={{ color: "var(--text-3)" }}>
                                {stats.total}项目 / {stats.categories}赛道
                              </span>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: health }} title={`${stats.gapCount}个缺口`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {gapAnalysis.gaps.map((gap) => (
                  <GapCard key={gap.category} gap={gap} />
                ))}
                {gapAnalysis.concentrations.length > 0 && (
                  <>
                    <div className="text-[9px] font-semibold mt-2 mb-1" style={{ color: "var(--text-3)" }}>
                      拥挤赛道
                    </div>
                    {gapAnalysis.concentrations.map((c) => (
                      <div
                        key={c.category}
                        className="rounded px-2 py-1.5"
                        style={{ background: "var(--bg-hover)", borderLeft: "2px solid #10b981" }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium" style={{ color: "var(--text-1)" }}>
                            {c.label}
                          </span>
                          <span className="text-[9px] font-mono" style={{ color: "#10b981" }}>
                            {c.count}个玩家
                          </span>
                        </div>
                        <span className="text-[8px]" style={{ color: "var(--text-4)" }}>
                          TOP: {c.topPlayers.join("、")}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* GitHub tab — enhanced 2-line layout */}
        {subTab === "github" && (
          <>
            {(!latestGithub || Object.keys(latestGithub).length === 0) && (
              <div className="text-[10px] text-center py-6" style={{ color: "var(--text-4)" }}>
                无GitHub数据
              </div>
            )}
            {latestGithub &&
              Object.entries(latestGithub)
                .sort((a, b) => (b[1].stars || 0) - (a[1].stars || 0))
                .map(([id, data]) => {
                  const activityColor = data.weeklyCommitsAvg === null
                    ? "#6b7280"
                    : data.weeklyCommitsAvg > 10
                      ? "#10b981"
                      : data.weeklyCommitsAvg >= 1
                        ? "#f59e0b"
                        : "#6b7280";
                  return (
                    <div
                      key={id}
                      className="cursor-pointer rounded px-2 py-1.5 transition-colors"
                      style={{ background: "var(--bg-hover)", ...getHighlightStyle(id) }}
                      onMouseEnter={(e) => {
                        if (!selectedProjectId || id === selectedProjectId)
                          e.currentTarget.style.background = "var(--accent-1)" + "12";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-hover)";
                      }}
                      onClick={() => onSelectProject?.(id)}
                    >
                      {/* Line 1: name + stars */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activityColor }} title={
                            data.weeklyCommitsAvg === null ? "无数据" :
                            data.weeklyCommitsAvg > 10 ? "高活跃" :
                            data.weeklyCommitsAvg >= 1 ? "中活跃" : "低活跃"
                          } />
                          <span className="text-[10px] font-medium" style={{ color: "var(--text-1)" }}>
                            {id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono font-semibold" style={{ color: "var(--accent-3)" }}>
                            {data.stars >= 1000 ? `${(data.stars / 1000).toFixed(1)}k` : data.stars}
                          </span>
                          <span className="text-[8px]" style={{ color: "var(--text-4)" }}>★</span>
                        </div>
                      </div>
                      {/* Line 2: forks + issues */}
                      <div className="flex items-center gap-3 mt-0.5 pl-3">
                        <span className="text-[8px] font-mono" style={{ color: "var(--text-4)" }}>
                          forks {data.forks >= 1000 ? `${(data.forks / 1000).toFixed(1)}k` : data.forks}
                        </span>
                        <span className="text-[8px] font-mono" style={{ color: "var(--text-4)" }}>
                          issues {data.openIssues >= 1000 ? `${(data.openIssues / 1000).toFixed(1)}k` : data.openIssues}
                        </span>
                      </div>
                    </div>
                  );
                })}
          </>
        )}

        {/* Stocks tab — enhanced with bars, grouped by currency */}
        {subTab === "stocks" && (
          <>
            {(!latestStocks || Object.keys(latestStocks).length === 0) && (
              <div className="text-[10px] text-center py-6" style={{ color: "var(--text-4)" }}>
                无股价数据
              </div>
            )}
            {Object.entries(stockGroups).map(([currency, entries]) => (
              <div key={currency}>
                <div className="text-[8px] font-semibold mb-1 mt-1" style={{ color: "var(--text-4)" }}>
                  {currency}
                </div>
                {entries.map(([id, data]) => {
                  const weekPct = data.weekChangePercent;
                  const monthPct = data.monthChangePercent;
                  const currencySymbol = data.currency === "CNY" ? "¥" : data.currency === "HKD" ? "HK$" : "$";
                  return (
                    <div
                      key={id}
                      className="rounded px-2 py-1.5 mb-1 cursor-pointer transition-colors"
                      style={{ background: "var(--bg-hover)", ...getHighlightStyle(id) }}
                      onMouseEnter={(e) => {
                        if (!selectedProjectId || id === selectedProjectId)
                          e.currentTarget.style.background = "var(--accent-1)" + "12";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-hover)";
                      }}
                      onClick={() => onSelectProject?.(id)}
                    >
                      {/* Line 1: name, ticker, price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium" style={{ color: "var(--text-1)" }}>
                            {id}
                          </span>
                          <span className="text-[8px] font-mono" style={{ color: "var(--text-4)" }}>
                            {data.ticker}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold" style={{ color: "var(--text-1)" }}>
                          {currencySymbol}{data.price.toLocaleString()}
                        </span>
                      </div>
                      {/* Line 2: change bars */}
                      <div className="flex items-center gap-3 mt-1">
                        {weekPct !== null && (
                          <ChangeBar label="周" percent={weekPct} />
                        )}
                        {monthPct !== null && (
                          <ChangeBar label="月" percent={monthPct} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {/* Insights tab — enhanced with type colors and metrics */}
        {subTab === "insights" && (
          <>
            {aiInsights.length === 0 && (
              <div className="text-[10px] text-center py-6" style={{ color: "var(--text-4)" }}>
                {hasData ? "暂无洞察" : "采集数据后自动生成"}
              </div>
            )}
            {aiInsights.map((insight, i) => (
              <InsightCard
                key={i}
                insight={insight}
                index={i}
                selectedProjectId={selectedProjectId}
                onSelectProject={onSelectProject}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Change Bar component ──
function ChangeBar({ label, percent }: { label: string; percent: number }) {
  const isUp = percent > 0;
  const color = isUp ? "#10b981" : percent < 0 ? "#ef4444" : "var(--text-3)";
  const barWidth = Math.min(100, Math.abs(percent) * 3);

  return (
    <div className="flex items-center gap-1 flex-1">
      <span className="text-[8px] w-3" style={{ color: "var(--text-4)" }}>{label}</span>
      <span className="text-[9px] font-mono w-12 text-right" style={{ color }}>
        {isUp ? "+" : ""}{percent.toFixed(1)}%
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Anomaly Card ──
function AnomalyCard({
  anomaly,
  onClick,
}: {
  anomaly: MonitorAnomaly;
  onClick: () => void;
}) {
  const isGithub = anomaly.type.startsWith("github");
  const isUp =
    (anomaly.changePercent !== undefined && anomaly.changePercent > 0) ||
    (anomaly.changeDelta !== undefined && anomaly.changeDelta > 0);

  const icon = isGithub ? (isUp ? "🔥" : "📉") : isUp ? "📈" : "📉";
  const color = isUp ? "#10b981" : "#ef4444";

  let detail = "";
  if (anomaly.type === "github_stars_surge") {
    detail = `stars +${anomaly.changePercent}%`;
  } else if (anomaly.type === "github_stars_absolute") {
    detail = `stars +${((anomaly.changeDelta || 0) / 1000).toFixed(1)}k`;
  } else if (anomaly.type === "github_commits_surge") {
    detail = `commits +${anomaly.changePercent}%`;
  } else if (anomaly.type.includes("stock")) {
    const dir = isUp ? "+" : "";
    const period = anomaly.metric === "stock_week" ? "周" : "月";
    detail = `${period} ${dir}${anomaly.changePercent}%`;
  }

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all"
      style={{
        background: "var(--bg-hover)",
        borderLeft: `2px solid ${color}`,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color + "15";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
      }}
    >
      <span className="text-sm flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium truncate" style={{ color: "var(--text-1)" }}>
            {anomaly.projectName}
          </span>
          <span className="text-[10px] font-mono flex-shrink-0 ml-1" style={{ color }}>
            {detail}
          </span>
        </div>
        {anomaly.ticker && (
          <span className="text-[8px]" style={{ color: "var(--text-4)" }}>
            {anomaly.ticker}
            {anomaly.price ? ` · ${anomaly.price}${anomaly.currency || ""}` : ""}
          </span>
        )}
      </div>
      {anomaly.severity === "high" && (
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#ef4444" }} />
      )}
    </div>
  );
}

// ── Gap Card ──
function GapCard({ gap }: { gap: GapEntry }) {
  const severityConfig = {
    empty: { color: "#ef4444", icon: "🚫", label: "空白" },
    critical: { color: "#f59e0b", icon: "⚠️", label: "薄弱" },
    weak: { color: "#eab308", icon: "📊", label: "不足" },
  };
  const cfg = severityConfig[gap.severity];

  return (
    <div
      className="rounded px-2 py-2"
      style={{
        background: "var(--bg-hover)",
        borderLeft: `2px solid ${cfg.color}`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-xs">{cfg.icon}</span>
          <span className="text-[11px] font-semibold" style={{ color: "var(--text-1)" }}>
            {gap.label}
          </span>
        </div>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: cfg.color + "20", color: cfg.color }}
        >
          {gap.count}/{gap.idealMin} {cfg.label}
        </span>
      </div>
      {gap.players && gap.players.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {gap.players.map((p) => (
            <span
              key={p}
              className="text-[8px] px-1 py-0.5 rounded"
              style={{ background: "var(--bg-primary)", color: "var(--text-3)" }}
            >
              {p}
            </span>
          ))}
        </div>
      )}
      <div className="text-[9px] leading-relaxed" style={{ color: "var(--text-3)" }}>
        对标: {gap.globalBenchmark}
      </div>
    </div>
  );
}

// ── Insight Card — enhanced with type, metric, relatedProjects ──
function InsightCard({
  insight,
  index,
  selectedProjectId,
  onSelectProject,
}: {
  insight: MonitorInsight;
  index: number;
  selectedProjectId?: string;
  onSelectProject?: (id: string) => void;
}) {
  const typeConfig = INSIGHT_TYPE_CONFIG[insight.type || "neutral"] || INSIGHT_TYPE_CONFIG.neutral;

  const isRelated = insight.relatedProjects?.includes(selectedProjectId || "");
  const dimmed = selectedProjectId && !isRelated && insight.relatedProjects && insight.relatedProjects.length > 0;

  return (
    <div
      className="rounded p-2.5 relative"
      style={{
        background: "var(--bg-hover)",
        borderLeft: `2px solid ${typeConfig.color}`,
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{typeConfig.icon}</span>
          <span className="text-[11px] font-semibold" style={{ color: typeConfig.color }}>
            {insight.title}
          </span>
        </div>
        {insight.metric && (
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: typeConfig.color + "15", color: typeConfig.color }}
          >
            {insight.metric}
          </span>
        )}
      </div>
      <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-2)" }}>
        {insight.content}
      </p>
      {insight.relatedProjects && insight.relatedProjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {insight.relatedProjects.map((pid) => (
            <button
              key={pid}
              className="text-[8px] px-1.5 py-0.5 rounded-full cursor-pointer transition-colors"
              style={{
                background: pid === selectedProjectId ? typeConfig.color + "30" : "var(--bg-primary)",
                color: pid === selectedProjectId ? typeConfig.color : "var(--text-3)",
                border: `1px solid ${pid === selectedProjectId ? typeConfig.color : "var(--border)"}`,
              }}
              onClick={() => onSelectProject?.(pid)}
            >
              {pid}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
