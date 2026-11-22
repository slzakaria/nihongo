import { NextRequest } from 'next/server';
import { currentServerUser } from '@/lib/auth/server';
import { checkAndBumpDailyLimit, rateLimitResponse } from '@/lib/rateLimit';
import { readBoundedRequestBody } from '@/lib/http/requestBody';

const ELEVENLABS_STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text';
const MODEL_ID = 'scribe_v2';
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_AUDIO_BYTES + 64 * 1024;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ElevenLabs is not configured' }, { status: 500 });
  }

  const user = await currentServerUser();
  const rateLimit = await checkAndBumpDailyLimit(req, 'elevenlabs', user?.id ?? null);
  const rateLimitError = rateLimitResponse(rateLimit);
  if (rateLimitError) return rateLimitError;

  const body = await readBoundedRequestBody(req, MAX_REQUEST_BYTES);
  if (!body.ok) {
    return Response.json({ error: body.error }, { status: body.status });
  }
  const headers = new Headers(req.headers);
  headers.delete('content-length');
  const requestBody = new ArrayBuffer(body.bytes.byteLength);
  new Uint8Array(requestBody).set(body.bytes);
  let incoming: FormData;
  try {
    incoming = await new Request(req.url, {
      method: 'POST',
      headers,
      body: requestBody,
    }).formData();
  } catch (error) {
    if (error instanceof TypeError) {
      return Response.json({ error: 'Invalid audio form data' }, { status: 400 });
    }
    throw error;
  }
  const file = incoming.get('file');
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: 'Missing audio file' }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: 'Audio file is too large' }, { status: 413 });
  }

  const form = new FormData();
  form.append('file', file, 'speech.webm');
  form.append('model_id', MODEL_ID);
  // No language_code — auto-detect so the user can speak any language, not just Japanese.

  const res = await fetch(ELEVENLABS_STT_URL, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('ElevenLabs STT request failed', res.status, detail);
    return Response.json({ error: 'ElevenLabs request failed' }, { status: 502 });
  }

  const data = (await res.json()) as { text?: string };
  return Response.json({ text: data.text?.trim() ?? '' });
}
