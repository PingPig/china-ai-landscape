import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 赛道颜色
        "model-open": "#10b981",
        "model-closed": "#6366f1",
        "app-office": "#f59e0b",
        "app-coding": "#3b82f6",
        "app-design": "#ec4899",
        "app-video": "#ef4444",
        "app-search": "#14b8a6",
        "app-agent": "#8b5cf6",
        "infra-chip": "#f97316",
        "infra-cloud": "#06b6d4",
        "infra-framework": "#84cc16",
        "embodied-robot": "#d946ef",
        "embodied-auto": "#64748b",
      },
    },
  },
  plugins: [],
};
export default config;
