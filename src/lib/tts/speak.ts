// lib/tts/speak.ts
// ElevenLabs only. Two-tier cache so the same phrase is never fetched twice:
// in-memory blob URLs for the current tab, IndexedDB for across reloads/navigations.
import { getCachedAudio, setCachedAudio } from './audioCache'

// Matches the server's CACHE_VERSION so browsers drop audio generated before the language fix
const CACHE_VERSION = 'ja-v2'

const blobUrlCache = new Map<string, string>()
const inFlight = new Map<string, Promise<string>>()

async function fetchAudioUrl(text: string): Promise<string> {
  const cached = blobUrlCache.get(text)
  if (cached) return cached

  const pending = inFlight.get(text)
  if (pending) return pending

  const promise = (async () => {
    const cacheKey = `${CACHE_VERSION}:${text}`
    const cachedBlob = await getCachedAudio(cacheKey).catch(() => undefined)
    if (cachedBlob) {
      const url = URL.createObjectURL(cachedBlob)
      blobUrlCache.set(text, url)
      return url
    }

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error('TTS request failed')

    const blob = await res.blob()
    void setCachedAudio(cacheKey, blob).catch(() => {
      // non-fatal — the phrase will just be re-fetched next session
    })

    const url = URL.createObjectURL(blob)
    blobUrlCache.set(text, url)
    return url
  })().finally(() => inFlight.delete(text))

  inFlight.set(text, promise)
  return promise
}

export function loadAudio(text: string): Promise<string> {
  return fetchAudioUrl(text)
}

// Fire-and-forget warm-up for a batch of phrases (e.g. core phrases on scenario mount)
export function preloadScenarioPhrases(texts: string[]) {
  for (const text of texts) {
    if (!blobUrlCache.has(text) && !inFlight.has(text)) {
      fetchAudioUrl(text).catch(() => {
        // silent — AudioButton will retry the request on click
      })
    }
  }
}
