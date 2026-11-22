import { NextRequest } from 'next/server';
import { askClaudeJson } from '@/lib/ai/claude';
import { checkAndBumpDailyLimit, rateLimitResponse } from '@/lib/rateLimit';
import { currentServerUser } from '@/lib/auth/server';
import { loadContent } from '@/lib/data/content';
import type { ChatMessage } from '@/types';
import { isJsonRecord, readJsonRequestBody } from '@/lib/http/requestBody';

const MAX_TURNS = 20;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOTAL_MESSAGE_LENGTH = 24000;

interface Feedback {
  summary: string;
  mistakes: { said: string; correction: string; why: string }[];
  natural: { said: string; better: string }[];
  newPhrases: { japanese: string; romaji: string; english: string }[];
}

// Reviews the learner's side of a simulator conversation
export async function POST(req: NextRequest) {
  const parsed = await readJsonRequestBody(req, 32 * 1024);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  if (
    !isJsonRecord(parsed.value) ||
    typeof parsed.value.scenarioSlug !== 'string' ||
    !Array.isArray(parsed.value.messages) ||
    parsed.value.messages.length > 100
  ) {
    return Response.json({ error: 'Invalid conversation' }, { status: 400 });
  }
  const messages: ChatMessage[] = [];
  let totalMessageLength = 0;
  for (const message of parsed.value.messages) {
    if (
      !isJsonRecord(message) ||
      (message.role !== 'user' && message.role !== 'assistant') ||
      typeof message.content !== 'string' ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return Response.json({ error: 'Invalid conversation' }, { status: 400 });
    }
    totalMessageLength += message.content.length;
    if (totalMessageLength > MAX_TOTAL_MESSAGE_LENGTH) {
      return Response.json({ error: 'Conversation is too long' }, { status: 400 });
    }
    messages.push({ role: message.role, content: message.content });
  }
  const { scenarioSlug } = parsed.value;

  const scenario = (await loadContent()).phrases.find((s) => s.slug === scenarioSlug);
  if (!scenario) return Response.json({ error: 'Unknown scenario' }, { status: 400 });

  const turns = (messages ?? []).slice(-MAX_TURNS * 2);
  const learnerLines = turns.filter((m) => m.role === 'user').map((m) => m.content);
  if (learnerLines.length === 0) {
    return Response.json({ error: 'Send at least one reply first' }, { status: 400 });
  }

  const user = await currentServerUser();
  const rateLimit = await checkAndBumpDailyLimit(req, 'anthropic', user?.id ?? null);
  const rateLimitError = rateLimitResponse(rateLimit);
  if (rateLimitError) return rateLimitError;

  const transcript = turns
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Local'}: ${m.content}`)
    .join('\n');

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
    return Response.json({
      summary: feedback.summary ?? '',
      mistakes: feedback.mistakes ?? [],
      natural: feedback.natural ?? [],
      newPhrases: feedback.newPhrases ?? [],
    });
  } catch (err) {
    console.error('Simulator feedback failed', err);
    return Response.json(
      { error: 'Feedback is unavailable right now. Please try again.' },
      { status: 502 },
    );
  }
}
