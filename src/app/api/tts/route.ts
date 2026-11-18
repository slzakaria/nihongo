import { NextRequest } from 'next/server'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'
import { checkAndBumpDailyLimit } from '@/lib/rateLimit'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'
const MODEL_ID = 'eleven_turbo_v2_5' // v4 Turbo — fast, Japanese support, free tier
// Disk cache so the same phrase is never sent to ElevenLabs twice, even across
// browsers/devices or a cleared client cache — phrases are a finite, static set.
const CACHE_DIR = path.join(process.cwd(), '.cache', 'tts')
// Bump when the request changes so previously cached audio is regenerated
const CACHE_VERSION = 'ja-v2'

// Generous cap since the app's own finite phrase set is served from the disk cache above
// (free) — this only throttles genuinely novel/arbitrary text from an anonymous caller.
const ANON_DAILY_LIMIT = 100
const LIMIT_COOKIE = 'tts_reqs'

function cacheKeyFor(text: string, voiceId: string) {
  return createHash('sha256').update(`${CACHE_VERSION}:${voiceId}:${MODEL_ID}:${text}`).digest('hex')
}

async function readFromCache(key: string): Promise<Buffer | undefined> {
  try {
    return await readFile(path.join(CACHE_DIR, `${key}.mp3`))
  } catch {
    return undefined
  }
}

async function writeToCache(key: string, buffer: Buffer) {
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(path.join(CACHE_DIR, `${key}.mp3`), buffer)
}

export async function POST(req: NextRequest) {
  const { text } = (await req.json()) as { text: string }
  const cleanText = text?.trim().replace(/\s+/g, ' ')
  if (!cleanText) {
    return Response.json({ error: 'Missing text' }, { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (!apiKey || !voiceId) {
    return Response.json({ error: 'ElevenLabs is not configured' }, { status: 500 })
  }

  const cacheKey = cacheKeyFor(cleanText, voiceId)
  const cached = await readFromCache(cacheKey)
  if (cached) {
    return new Response(new Blob([new Uint8Array(cached)]), {
      headers: { 'Content-Type': 'audio/mpeg', 'X-TTS-Cache': 'hit' },
    })
  }

  let setCookie: string | undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const { limited, setCookie: cookie } = checkAndBumpDailyLimit(req, LIMIT_COOKIE, ANON_DAILY_LIMIT)
    if (limited) {
      return Response.json(
        { error: `You've reached today's ${ANON_DAILY_LIMIT}-request guest limit.` },
        { status: 429 }
      )
    }
    setCookie = cookie
  }

  const res = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: MODEL_ID,
      // Without this the model guesses the language, which made Japanese read as English
      language_code: 'ja',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    console.error('ElevenLabs TTS request failed', res.status, detail)
    return Response.json({ error: 'ElevenLabs request failed' }, { status: 502 })
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  await writeToCache(cacheKey, buffer).catch(err =>
    console.error('Failed to write TTS cache', err)
  )

  const headers: HeadersInit = { 'Content-Type': 'audio/mpeg', 'X-TTS-Cache': 'miss' }
  if (setCookie) headers['Set-Cookie'] = setCookie

  return new Response(new Blob([new Uint8Array(buffer)]), { headers })
}
