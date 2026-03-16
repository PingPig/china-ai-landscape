import OpenAI from "openai";

const SYSTEM_PROMPT = `你是一个中国AI产业分析专家。用户会问你关于中国AI生态的问题。
请基于你的知识给出专业、客观的分析。回答要求：
1. 结构清晰，使用要点列表
2. 基于事实，避免主观臆断
3. 如果不确定，明确说明
4. 回答控制在300字以内
5. 用中文回答

你了解的中国AI公司和产品包括但不限于：
- 大模型：DeepSeek、通义千问Qwen、智谱GLM、百川、Kimi（月之暗面）、MiniMax、阶跃星辰
- AI应用：豆包（字节）、文心一言（百度）、通义（阿里）、可灵AI（快手）、即梦AI
- AI编程：通义灵码、MarsCode（豆包）
- AI Agent：Manus
- 基础设施：华为昇腾、寒武纪
- 具身智能：宇树科技、小马智行`;

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string" || question.length > 500) {
      return new Response("Invalid question", { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response("API not configured", { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const stream = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const data = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response("Internal error", { status: 500 });
  }
}
