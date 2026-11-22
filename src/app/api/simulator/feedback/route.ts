import { NextRequest } from "next/server";
import { askClaudeJson } from "@/lib/ai/claude";
import { ANON_DAILY_LIMIT, checkAndBumpDailyLimit } from "@/lib/rateLimit";
import { currentServerUser } from "@/lib/auth/server";
import { loadContent } from "@/lib/data/content";
import type { ChatMessage } from "@/types";

const LIMIT_COOKIE = "feedback_reqs";
const MAX_TURNS = 20;

interface Feedback {
  summary: string;
  mistakes: { said: string; correction: string; why: string }[];
  natural: { said: string; better: string }[];
  newPhrases: { japanese: string; romaji: string; english: string }[];
}

// Reviews the learner's side of a simulator conversation
export async function POST(req: NextRequest) {
  const { scenarioSlug, messages } = (await req.json()) as {
    scenarioSlug?: string;
    messages?: ChatMessage[];
  };
  const scenario = (await loadContent()).phrases.find(
    (s) => s.slug === scenarioSlug,
  );
  if (!scenario)
    return Response.json({ error: "Unknown scenario" }, { status: 400 });

  const turns = (messages ?? []).slice(-MAX_TURNS * 2);
  const learnerLines = turns
    .filter((m) => m.role === "user")
    .map((m) => m.content);
  if (learnerLines.length === 0) {
    return Response.json(
      { error: "Send at least one reply first" },
      { status: 400 },
    );
  }

  let setCookie: string | undefined;
  const user = await currentServerUser();
  if (!user) {
    const { limited, setCookie: cookie } = checkAndBumpDailyLimit(
      req,
      LIMIT_COOKIE,
      ANON_DAILY_LIMIT,
    );
    if (limited) {
      return Response.json(
        {
          error: `You've reached today's ${ANON_DAILY_LIMIT}-review guest limit.`,
        },
        { status: 429 },
      );
    }
    setCookie = cookie;
  }

  const transcript = turns
    .map((m) => `${m.role === "user" ? "Learner" : "Local"}: ${m.content}`)
    .join("\n");

  try {
    const feedback = await askClaudeJson<Feedback>(
      `You are a patient Japanese tutor. The learner is an English-speaking traveller practising "${scenario.label}".
Review ONLY the learner's lines. Reply with only a JSON object with keys:
- "summary": two short sentences on how they did, in English.
- "mistakes": up to 4 objects with "said" (their Japanese), "correction" (the correct Japanese), "why" (short English reason). Empty array if none.
- "natural": up to 3 objects with "said" and "better" (a more natural way a local would say it). Empty array if none.
- "newPhrases": 3 useful phrases for this situation the learner did not use, each with "japanese", "romaji" and "english".
Keep everything short and encouraging.`,
      `Conversation:\n${transcript}`,
      1200,
    );
    const headers: HeadersInit = {};
    if (setCookie) headers["Set-Cookie"] = setCookie;
    return Response.json(
      {
        summary: feedback.summary ?? "",
        mistakes: feedback.mistakes ?? [],
        natural: feedback.natural ?? [],
        newPhrases: feedback.newPhrases ?? [],
      },
      { headers },
    );
  } catch (err) {
    console.error("Simulator feedback failed", err);
    return Response.json(
      { error: "Feedback is unavailable right now. Please try again." },
      { status: 502 },
    );
  }
}
