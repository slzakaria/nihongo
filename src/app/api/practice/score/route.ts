import { NextRequest } from 'next/server';
import { askClaudeJson } from '@/lib/ai/claude';
import { checkAndBumpDailyLimit, rateLimitResponse } from '@/lib/rateLimit';
import { currentServerUser } from '@/lib/auth/server';
import { isJsonRecord, readJsonRequestBody } from '@/lib/http/requestBody';

interface Score {
  score: number;
  words: { word: string; heard: boolean }[];
  tip: string;
}

// Compares what the learner said with the target phrase, word by word
export async function POST(req: NextRequest) {
  const parsed = await readJsonRequestBody(req, 8 * 1024);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  if (
    !isJsonRecord(parsed.value) ||
    !isJsonRecord(parsed.value.target) ||
    typeof parsed.value.target.japanese !== 'string' ||
    typeof parsed.value.transcript !== 'string'
  ) {
    return Response.json({ error: 'Missing phrase or transcript' }, { status: 400 });
  }
  const target = parsed.value.target;
  const japanese = target.japanese;
  const romaji = target.romaji;
  const english = target.english;
  const transcript = parsed.value.transcript;
  if (
    typeof japanese !== 'string' ||
    !japanese.trim() ||
    japanese.length > 300 ||
    (romaji !== undefined && typeof romaji !== 'string') ||
    (english !== undefined && typeof english !== 'string') ||
    !transcript.trim() ||
    transcript.length > 300
  ) {
    return Response.json({ error: 'Missing phrase or transcript' }, { status: 400 });
  }

  const user = await currentServerUser();
  const rateLimit = await checkAndBumpDailyLimit(req, 'anthropic', user?.id ?? null);
  const rateLimitError = rateLimitResponse(rateLimit);
  if (rateLimitError) return rateLimitError;

  try {
    const result = await askClaudeJson<Score>(
      `You are a patient Japanese pronunciation coach. The learner tried to say a target phrase; a speech recogniser transcribed what they said.
Compare the transcript with the target. The transcript may mix kanji, kana and romaji, so compare meaning and sounds, not spelling.
Reply with only a JSON object with keys:
- "score": an integer 0 to 100 for how close the attempt is.
- "words": the target split into its natural words, each with "word" (in the target's Japanese) and "heard" (true if the learner clearly said it).
- "tip": one short, encouraging English sentence on what to practise next.`,
      `Target: ${japanese} (${typeof romaji === 'string' ? romaji : ''}) meaning "${typeof english === 'string' ? english : ''}"\nTranscript: ${transcript.trim()}`,
      500,
    );
    return Response.json({
      score: Math.max(0, Math.min(100, Math.round(result.score ?? 0))),
      words: result.words ?? [],
      tip: result.tip ?? '',
    });
  } catch (err) {
    console.error('Speaking score failed', err);
    return Response.json(
      { error: 'Scoring is unavailable right now. Please try again.' },
      { status: 502 },
    );
  }
}
