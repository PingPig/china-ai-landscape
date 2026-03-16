"use client";

import { useState, useRef } from "react";
import { Send, Loader2 } from "lucide-react";

export default function AiChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [queryCount, setQueryCount] = useState(() => {
    if (typeof window !== "undefined") return parseInt(localStorage.getItem("ai_query_count") || "0");
    return 0;
  });
  const abortRef = useRef<AbortController | null>(null);
  const maxQueries = 5;

  const askAI = async () => {
    if (!question.trim() || queryCount >= maxQueries) return;
    setLoading(true);
    setAnswer("");
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) { setAnswer("服务暂不可用"); setLoading(false); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const content = JSON.parse(data).choices?.[0]?.delta?.content;
              if (content) { result += content; setAnswer(result); }
            } catch {}
          }
        }
      }
      const n = queryCount + 1;
      setQueryCount(n);
      localStorage.setItem("ai_query_count", String(n));
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") setAnswer("请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full dash-panel flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <span>智能问答</span>
        <span className="text-[9px] font-normal" style={{ color: "var(--text-4)" }}>
          剩余 {maxQueries - queryCount}/{maxQueries}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 min-h-0">
        {answer ? (
          <div className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>
            {answer}
            {loading && <span className="streaming-cursor" />}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="text-[10px] mb-2" style={{ color: "var(--text-4)" }}>
              关于中国AI的任何问题
            </p>
            <div className="space-y-1">
              {["DeepSeek vs Qwen?", "国产芯片现状?", "AI Agent趋势?"].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="block text-[9px] transition-colors"
                  style={{ color: "var(--text-3)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-2 flex gap-1.5 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askAI()}
          placeholder="输入问题..."
          className="flex-1 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-1)" }}
          disabled={queryCount >= maxQueries}
        />
        <button
          onClick={askAI}
          disabled={loading || !question.trim() || queryCount >= maxQueries}
          className="px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-30"
          style={{ background: "var(--accent-1)", color: "#fff" }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        </button>
      </div>
    </div>
  );
}
