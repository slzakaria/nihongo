import { NextRequest } from 'next/server'
import { askClaudeJson } from '@/lib/ai/claude'
import { checkAndBumpDailyLimit } from '@/lib/rateLimit'
import { currentServerUser } from '@/lib/auth/server'

// Guests get a small daily cap so lookups can't be used to run up API costs anonymously
const ANON_DAILY_LIMIT = 30
const LIMIT_COOKIE = 'word_reqs'

interface WordResult {
  reading: string
  meaning: string
  note: string
}

// Looks up a selected word or phrase: its kana reading, English meaning and a short usage note
export async function POST(req: NextRequest) {
  const { word, context } = (await req.json()) as { word?: string; context?: string }
  const term = word?.trim() ?? ''
  if (!term || term.length > 40) {
    return Response.json({ error: 'Select a shorter word or phrase' }, { status: 400 })
  }

  let setCookie: string | undefined
  const user = await currentServerUser()
  if (!user) {
    const { limited, setCookie: cookie } = checkAndBumpDailyLimit(req, LIMIT_COOKIE, ANON_DAILY_LIMIT)
    if (limited) {
      return Response.json({ error: `You've reached today's ${ANON_DAILY_LIMIT}-lookup guest limit.` }, { status: 429 })
    }
    setCookie = cookie
  }

  try {
    const result = await askClaudeJson<WordResult>(
      `You are a Japanese tutor helping an English-speaking traveller. Reply with only a JSON object with keys:
"reading" (the term in hiragana), "meaning" (a short English meaning), and "note" (one short sentence on how it is used, in English).`,
      `Term: ${term}${context ? `\nContext phrase: ${context.slice(0, 200)}` : ''}`,
      300
    )
    const headers: HeadersInit = {}
    if (setCookie) headers['Set-Cookie'] = setCookie
    return Response.json(
      { reading: result.reading ?? '', meaning: result.meaning ?? '', note: result.note ?? '' },
      { headers }
    )
  } catch (err) {
    console.error('Word lookup failed', err)
    return Response.json({ error: 'Lookup failed. Please try again.' }, { status: 502 })
  }
}
