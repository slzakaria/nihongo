// lib/tts/speak.ts
// ElevenLabs only. Two-tier cache so the same phrase is never fetched twice:
// in-memory blob URLs for the current tab, IndexedDB for across reloads/navigations.
import { getCachedAudio, setCachedAudio } from './audioCache';
import { showRateLimitDialog } from '@/store/rateLimitDialog';

// Matches the server's CACHE_VERSION so browsers drop audio generated before the language fix
const CACHE_VERSION = 'ja-v2';

const blobUrlCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

async function fetchAudioUrl(text: string, signal?: AbortSignal): Promise<string> {
  const cached = blobUrlCache.get(text);
  if (cached) return cached;

  const pending = inFlight.get(text);
  if (pending) return pending;

  const promise = (async () => {
    const cacheKey = `${CACHE_VERSION}:${text}`;
    const cachedBlob = await getCachedAudio(cacheKey).catch(() => undefined);
    if (cachedBlob) {
      const url = URL.createObjectURL(cachedBlob);
      blobUrlCache.set(text, url);
      return url;
    }

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal,
    });
    if (res.status === 429) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      showRateLimitDialog(data?.error);
      throw new Error('TTS daily limit reached');
    }
    if (!res.ok) throw new Error('TTS request failed');

    const blob = await res.blob();
    void setCachedAudio(cacheKey, blob).catch(() => {
      // non-fatal — the phrase will just be re-fetched next session
    });

    const url = URL.createObjectURL(blob);
    blobUrlCache.set(text, url);
    return url;
  })().finally(() => inFlight.delete(text));

  inFlight.set(text, promise);
  return promise;
}

export function loadAudio(text: string, signal?: AbortSignal): Promise<string> {
  return fetchAudioUrl(text, signal);
}
