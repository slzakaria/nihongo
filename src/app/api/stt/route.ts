import { NextRequest } from 'next/server'
import { currentServerUser } from '@/lib/auth/server'
import { checkAndBumpDailyLimit } from '@/lib/rateLimit'

const ELEVENLABS_STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text'
const MODEL_ID = 'scribe_v2'

// Lower than TTS since each request is a real (uncached) transcription call
const ANON_DAILY_LIMIT = 30
const LIMIT_COOKIE = 'stt_reqs'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ElevenLabs is not configured' }, { status: 500 })
  }

  let setCookie: string | undefined
  const user = await currentServerUser()
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

  const incoming = await req.formData()
  const file = incoming.get('file')
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: 'Missing audio file' }, { status: 400 })
  }

  const form = new FormData()
  form.append('file', file, 'speech.webm')
  form.append('model_id', MODEL_ID)
  // No language_code — auto-detect so the user can speak any language, not just Japanese.

  const res = await fetch(ELEVENLABS_STT_URL, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('ElevenLabs STT request failed', res.status, detail)
    return Response.json({ error: 'ElevenLabs request failed' }, { status: 502 })
  }

  const data = (await res.json()) as { text?: string }
  const headers: HeadersInit = {}
  if (setCookie) headers['Set-Cookie'] = setCookie
  return Response.json({ text: data.text?.trim() ?? '' }, { headers })
}
