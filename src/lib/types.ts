export type Category =
  | "model_open"
  | "model_closed"
  | "model_eval"
  | "app_office"
  | "app_coding"
  | "app_design"
  | "app_video"
  | "app_search"
  | "app_agent"
  | "app_audio"
  | "infra_chip"
  | "infra_cloud"
  | "infra_framework"
  | "infra_data"
  | "infra_tool"
  | "ai_safety"
  | "embodied_robot"
  | "embodied_auto";

export type Layer = "application" | "model" | "infrastructure" | "embodied";

export interface AIProject {
  id: string;
  name: string;
  shortDesc: string;
  category: Category;
  layer: Layer;
  founded: string;
  funding: string;
  fundingRound: string;
  products: string[];
  githubStars?: number;
  baiduIndex?: number;
  url: string;
  tags: string[];
  heatByQuarter: Record<string, number>;
}

export interface TimelineEvent {
  date: string;
  quarter: string;
  title: string;
  description: string;
  relatedProjects: string[];
  impact: "high" | "medium" | "low";
}

export const CATEGORY_LABELS: Record<Category, string> = {
  model_open: "开源大模型",
  model_closed: "闭源大模型",
  model_eval: "模型评测",
  app_office: "AI办公",
  app_coding: "AI编程",
  app_design: "AI设计",
  app_video: "AI视频",
  app_search: "AI搜索",
  app_agent: "AI Agent",
  app_audio: "AI音频",
  infra_chip: "AI芯片",
  infra_cloud: "AI云服务",
  infra_framework: "AI框架",
  infra_data: "数据服务",
  infra_tool: "AI工具链",
  ai_safety: "AI安全",
  embodied_robot: "人形机器人",
  embodied_auto: "自动驾驶",
};

export const LAYER_LABELS: Record<Layer, string> = {
  application: "应用层",
  model: "模型层",
  infrastructure: "基础设施层",
  embodied: "具身智能层",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  model_open: "#10b981",
  model_closed: "#6366f1",
  model_eval: "#a78bfa",
  app_office: "#f59e0b",
  app_coding: "#3b82f6",
  app_design: "#ec4899",
  app_video: "#ef4444",
  app_search: "#14b8a6",
  app_agent: "#8b5cf6",
  app_audio: "#e879f9",
  infra_chip: "#f97316",
  infra_cloud: "#06b6d4",
  infra_framework: "#84cc16",
  infra_data: "#22d3ee",
  infra_tool: "#a3e635",
  ai_safety: "#fb923c",
  embodied_robot: "#d946ef",
  embodied_auto: "#64748b",
};

export const LAYER_CATEGORIES: Record<Layer, Category[]> = {
  application: ["app_office", "app_coding", "app_design", "app_video", "app_search", "app_agent", "app_audio"],
  model: ["model_open", "model_closed", "model_eval"],
  infrastructure: ["infra_chip", "infra_cloud", "infra_framework", "infra_data", "infra_tool", "ai_safety"],
  embodied: ["embodied_robot", "embodied_auto"],
};

export const QUARTERS = [
  "2023Q1", "2023Q2", "2023Q3", "2023Q4",
  "2024Q1", "2024Q2", "2024Q3", "2024Q4",
  "2025Q1", "2025Q2", "2025Q3", "2025Q4",
  "2026Q1",
];

export const FUNDING_ROUND_ORDER: Record<string, number> = {
  "未融资": 0,
  "天使轮": 1,
  "种子轮": 1,
  "A轮": 2,
  "B轮": 3,
  "C轮": 4,
  "D轮": 5,
  "E轮+": 6,
  "已上市": 7,
};

// ─── Monitor Types ───

export interface MonitorGithubEntry {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  weeklyCommitsAvg: number | null;
}

export interface MonitorStockEntry {
  ticker: string;
  price: number;
  currency: string;
  weekChangePercent: number | null;
  monthChangePercent: number | null;
}

export interface MonitorAnomaly {
  projectId: string;
  projectName: string;
  type: string;
  metric: string;
  severity: "high" | "medium";
  changePercent?: number;
  changeDelta?: number;
  current?: number;
  previous?: number;
  ticker?: string;
  price?: number;
  currency?: string;
}

export interface MonitorInsight {
  title: string;
  content: string;
  type?: "trend" | "alert" | "opportunity" | "risk" | "neutral";
  metric?: string;
  relatedProjects?: string[];
}

export interface GapEntry {
  category: string;
  label: string;
  count: number;
  idealMin: number;
  severity: "empty" | "critical" | "weak";
  globalBenchmark: string;
  players?: string[];
  insight: string;
}

export interface ConcentrationEntry {
  category: string;
  label: string;
  count: number;
  avgHeat: number;
  topPlayers: string[];
}

export interface GapAnalysis {
  gaps: GapEntry[];
  concentrations: ConcentrationEntry[];
  distribution: Record<string, number>;
  layerStats: Record<string, { total: number; categories: number; gapCount: number }>;
  totalProjects: number;
}

export interface MonitorData {
  github: {
    snapshots: Array<{ date: string; data: Record<string, MonitorGithubEntry> }>;
    lastUpdated: string | null;
    anomalies: MonitorAnomaly[];
  } | null;
  stocks: {
    snapshots: Array<{ date: string; data: Record<string, MonitorStockEntry> }>;
    lastUpdated: string | null;
    anomalies: MonitorAnomaly[];
  } | null;
  insights: {
    lastUpdated: string | null;
    anomalies: MonitorAnomaly[];
    insights: MonitorInsight[];
    gapAnalysis?: GapAnalysis;
    summary: {
      githubAnomalyCount: number;
      stockAnomalyCount: number;
      totalAnomalies: number;
      gapCount?: number;
    };
  } | null;
}
