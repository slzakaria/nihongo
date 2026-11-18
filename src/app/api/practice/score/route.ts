import { NextRequest } from 'next/server'
import { askClaudeJson } from '@/lib/ai/claude'
import { checkAndBumpDailyLimit } from '@/lib/rateLimit'
import { currentServerUser } from '@/lib/auth/server'

const ANON_DAILY_LIMIT = 30
const LIMIT_COOKIE = 'score_reqs'

interface Score {
  score: number
  words: { word: string; heard: boolean }[]
  tip: string
}

// Compares what the learner said with the target phrase, word by word
export async function POST(req: NextRequest) {
  const { target, transcript } = (await req.json()) as {
    target?: { japanese: string; romaji: string; english: string }
    transcript?: string
  }
  if (!target?.japanese || !transcript?.trim() || transcript.length > 300) {
    return Response.json({ error: 'Missing phrase or transcript' }, { status: 400 })
  }

  let setCookie: string | undefined
  const user = await currentServerUser()
  if (!user) {
    const { limited, setCookie: cookie } = checkAndBumpDailyLimit(req, LIMIT_COOKIE, ANON_DAILY_LIMIT)
    if (limited) {
      return Response.json({ error: `You've reached today's ${ANON_DAILY_LIMIT}-attempt guest limit.` }, { status: 429 })
    }
    setCookie = cookie
  }

  try {
    const result = await askClaudeJson<Score>(
      `You are a patient Japanese pronunciation coach. The learner tried to say a target phrase; a speech recogniser transcribed what they said.
Compare the transcript with the target. The transcript may mix kanji, kana and romaji, so compare meaning and sounds, not spelling.
Reply with only a JSON object with keys:
- "score": an integer 0 to 100 for how close the attempt is.
- "words": the target split into its natural words, each with "word" (in the target's Japanese) and "heard" (true if the learner clearly said it).
- "tip": one short, encouraging English sentence on what to practise next.`,
      `Target: ${target.japanese} (${target.romaji}) meaning "${target.english}"\nTranscript: ${transcript.trim()}`,
      500
    )
    const headers: HeadersInit = {}
    if (setCookie) headers['Set-Cookie'] = setCookie
    return Response.json(
      {
        score: Math.max(0, Math.min(100, Math.round(result.score ?? 0))),
        words: result.words ?? [],
        tip: result.tip ?? '',
      },
      { headers }
    )
  } catch (err) {
    console.error('Speaking score failed', err)
    return Response.json({ error: 'Scoring is unavailable right now. Please try again.' }, { status: 502 })
  }
}
