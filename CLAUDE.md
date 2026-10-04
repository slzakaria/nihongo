@AGENTS.md


# Nihongo Trip App — Project Context

## Goal
A Next.js web app to help me learn survival Japanese before a December trip to Japan.
I can already read and write hiragana and katakana. I know ~15 basic words.
The goal is NOT deep study — it is functional Japanese for commercial and social
interactions during the trip, especially bars and cocktail conversations.

## My Stack
- Next.js App Router (TypeScript)
- Tailwind CSS
- shadcn/ui
- Zustand (with localStorage persistence)
- Anthropic Claude API (for the simulator feature)

## App Features
1. **Scenario Phrasebook** — phrases organized by real-life situation
2. **Flashcard Drill** — SM-2 spaced repetition, English prompt → reveal Japanese
3. **Scenario Simulator** — Claude plays a Japanese role (bartender, cashier, etc.), user types in Japanese
4. **Quick Reference** — printable per-scenario cheat sheet

## Architecture
- All phrase data is static JSON in `src/lib/data/phrases.ts` — no database
- Progress and SRS state lives in Zustand, persisted to localStorage (`nihongo-progress`)
- Claude API key is server-side only — goes through `app/api/simulator/route.ts`
- Romaji toggle is a global setting (always / reveal on tap / never)

## File Structure
\`\`\`
src/
├── app/
│   ├── scenarios/[slug]/page.tsx
│   ├── flashcards/[slug]/page.tsx
│   ├── simulator/[slug]/page.tsx
│   ├── quick-ref/[slug]/page.tsx
│   └── api/simulator/route.ts
├── components/
│   ├── phrases/
│   ├── flashcards/
│   ├── simulator/
│   └── layout/
├── lib/
│   ├── data/phrases.ts        ← full phrase DB (see docs/phrases.json)
│   ├── srs/sm2.ts
│   ├── tts/speak.ts
│   └── simulator/prompts.ts
├── hooks/
│   ├── useFlashcardSession.ts
│   ├── useSRS.ts
│   └── useAudio.ts
├── store/
│   └── progress.ts
└── types/index.ts
\`\`\`

## Key Types
\`\`\`ts
interface Phrase {
  id: string
  japanese: string
  romaji: string
  english: string
  difficulty: 'core' | 'extra'
  notes: string
  responses: PhraseResponse[]
}

interface PhraseResponse {
  japanese: string
  romaji: string
  english: string
  listen_for: string
}

interface Scenario {
  slug: string
  label: string
  icon: string
  phrases: Phrase[]
}

interface SRSCard {
  phraseId: string
  interval: number
  repetitions: number
  easeFactor: number      // starts at 2.5, min 1.3
  nextReview: number      // timestamp ms
  lastReview: number | null
}
\`\`\`

## Scenarios (9 total)
| slug | label | phrases |
|------|-------|---------|
| greetings | Greetings & Basics | 11 phrases |
| shopping | Shopping | 11 phrases |
| restaurant | Restaurants & Konbini | 12 phrases |
| transport | Transport | 10 phrases |
| hotel | Hotel | 8 phrases |
| bar-cocktails | Bar & Cocktails | 15 phrases |
| directions | Directions | 5 phrases |
| emergencies | Emergencies | 5 phrases |
| numbers | Numbers & Time | 3 phrases |

## Simulator System Prompt Pattern
Claude plays a native Japanese role (bartender, cashier, etc.)
- Responds in Japanese only
- Max 1–2 sentences per turn
- Adds `[HINT: English translation]` on a new line after each response
- Gently uses correct forms if user makes mistakes — never explicitly corrects
- Role is determined by scenario slug (see `lib/simulator/prompts.ts`)

## SRS Grading Buttons
Flashcard session uses 4 grades mapped to SM-2:
- **Again** → grade 0 (reset)
- **Hard** → grade 3
- **Good** → grade 4
- **Easy** → grade 5

## Conventions
- Server components by default, `'use client'` only where needed (hooks, interactivity)
- All Japanese text rendered with `lang="ja"` attribute on the wrapping element
- TTS uses Web Speech API, `lang: 'ja-JP'`, rate: 0.85
- Phrase IDs follow pattern: `{scenario-prefix}-{number}` e.g. `ba-01`, `gr-03`
- API key in `.env.local` as `ANTHROPIC_API_KEY` — never on the client

## Do Not
- Add authentication — localStorage is enough for a solo trip prep tool
- Use a database — all data is static or in localStorage
- Add voice input (STT) — too flaky, skip it
- Fetch phrase data — it's a static import, not an API call
\`\`\`

## Phrase Data
Full phrase database is in `.claude/phrases-reference.json`.
The typed version lives at `lib/data/phrases.ts` and is the source of truth during dev.
all the instructions and files are in .claude/

## Voice / TTS
- Provider: ElevenLabs (`eleven_multilingual_v2` model)
- API key: `ELEVENLABS_API_KEY` in `.env.local` (server-side only)
- Voice: `ELEVENLABS_VOICE_ID` in `.env.local`
- Route: `POST /api/tts` accepts `{ text: string }`, returns `audio/mpeg`
- Client cache: blob URLs stored in a module-level Map in `lib/tts/speak.ts`
- Preloading: `preloadScenarioPhrases(texts[])` fires on scenario page mount, core phrases only
- AudioButton component handles loading/playing states with Loader2/Volume2 icons (lucide)
- Web Speech API is NOT used anywhere — ElevenLabs only