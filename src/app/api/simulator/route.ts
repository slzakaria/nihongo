import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { loadContent } from "@/lib/data/content";
import { getSimulatorPrompt } from "@/lib/simulator/prompts";
import { currentServerUser } from "@/lib/auth/server";
import { ANON_DAILY_LIMIT, checkAndBumpDailyLimit } from "@/lib/rateLimit";
import { ChatMessage } from "@/types";

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// Guests get a hard daily cap (signed cookie) so the Claude API can't be spammed anonymously
const LIMIT_COOKIE = "sim_msgs";

export async function POST(req: NextRequest) {
  const { messages, scenarioSlug } = (await req.json()) as {
    messages: ChatMessage[];
    scenarioSlug: string;
  };

  const scenario = (await loadContent()).phrases.find(
    (s) => s.slug === scenarioSlug,
  );
  if (!scenario) {
    return Response.json({ error: "Unknown scenario" }, { status: 400 });
  }

  const user = await currentServerUser();

  let setCookie: string | undefined;
  if (!user) {
    const { limited, setCookie: cookie } = checkAndBumpDailyLimit(
      req,
      LIMIT_COOKIE,
      ANON_DAILY_LIMIT,
    );
    if (limited) {
      return Response.json(
        {
          error: `You've reached today's ${ANON_DAILY_LIMIT}-message guest limit.`,
        },
        { status: 429 },
      );
    }
    setCookie = cookie;
  }

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: getSimulatorPrompt(scenario),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.controller.abort();
    },
  });

  const headers: HeadersInit = { "Content-Type": "text/plain; charset=utf-8" };
  if (setCookie) headers["Set-Cookie"] = setCookie;

  return new Response(readable, { headers });
}
