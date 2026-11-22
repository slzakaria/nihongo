import { NextRequest } from 'next/server';
import { askClaudeJson } from '@/lib/ai/claude';
import { checkAndBumpDailyLimit, rateLimitResponse } from '@/lib/rateLimit';
import { currentServerUser } from '@/lib/auth/server';
import { isJsonRecord, readJsonRequestBody } from '@/lib/http/requestBody';

interface WordResult {
  reading: string;
  meaning: string;
  note: string;
}

// Looks up a selected word or phrase: its kana reading, English meaning and a short usage note
export async function POST(req: NextRequest) {
  const parsed = await readJsonRequestBody(req, 8 * 1024);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  if (
    !isJsonRecord(parsed.value) ||
    typeof parsed.value.word !== 'string' ||
    (parsed.value.context !== undefined && typeof parsed.value.context !== 'string')
  ) {
    return Response.json({ error: 'Invalid word lookup' }, { status: 400 });
  }
  const term = parsed.value.word.trim();
  const context = parsed.value.context;
  if (!term || term.length > 40) {
    return Response.json({ error: 'Select a shorter word or phrase' }, { status: 400 });
  }

  const user = await currentServerUser();
  const rateLimit = await checkAndBumpDailyLimit(req, 'anthropic', user?.id ?? null);
  const rateLimitError = rateLimitResponse(rateLimit);
  if (rateLimitError) return rateLimitError;

  try {
    const result = await askClaudeJson<WordResult>(
      `You are a Japanese tutor helping an English-speaking traveller. Reply with only a JSON object with keys:
"reading" (the term in hiragana), "meaning" (a short English meaning), and "note" (one short sentence on how it is used, in English).`,
      `Term: ${term}${context ? `\nContext phrase: ${context.slice(0, 200)}` : ''}`,
      300,
    );
    return Response.json({
      reading: result.reading ?? '',
      meaning: result.meaning ?? '',
      note: result.note ?? '',
    });
  } catch (err) {
    console.error('Word lookup failed', err);
    return Response.json({ error: 'Lookup failed. Please try again.' }, { status: 502 });
  }
}
