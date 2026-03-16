import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "2026中国AI生态全景图 — 一图看懂中国人工智能版图",
  description: "交互式可视化展示2026年中国AI生态全貌：大模型、AI应用、基础设施、具身智能四大赛道，20+核心项目，时间轴推演、项目对比、趋势分析。",
  keywords: "中国AI, 人工智能, DeepSeek, 大模型, AI生态, 2026, AI全景图",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
