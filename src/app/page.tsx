import Dashboard from "@/components/dashboard";
import projectsData from "@/data/projects.json";
import eventsData from "@/data/timeline-events.json";
import githubData from "@/data/monitor-github.json";
import stocksData from "@/data/monitor-stocks.json";
import insightsData from "@/data/monitor-insights.json";
import type { AIProject, TimelineEvent, MonitorData } from "@/lib/types";

const projects = projectsData as AIProject[];
const events = eventsData as TimelineEvent[];

const monitorData = {
  github: githubData,
  stocks: stocksData,
  insights: insightsData,
} as unknown as MonitorData;

export default function Home() {
  return <Dashboard projects={projects} events={events} monitorData={monitorData} />;
}
