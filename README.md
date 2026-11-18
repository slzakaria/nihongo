# Hanazono (花園 - はなぞの)

**Survival Japanese for your trip.** Phrases organised by real-life situation, spaced-repetition flashcards, kana drills, and a live conversation simulator that plays a Japanese local.

## Features

- **Scenarios:** 37 situations, from restaurants, konbini and bars to trains, hotels, onsen, emergencies and small talk. Each phrase comes with romaji, notes, and the likely replies you'll hear back, with optional romaji reveal and kanji.
- **Flashcards:** a SM-2 spaced-repetition deck per scenario, so phrases come back when you're about to forget them.
- **Kana:** hiragana and katakana drills, row by row.
- **Simulator:** a conversation with a Japanese role-player (bartender, shop assistant, station staff, and so on). Each scenario has a flow of steps, so the conversation moves forward instead of only reacting. Replies are kept between visits.
- **Audio:** text-to-speech for every phrase, with cached audio so repeated plays are instant. Speech input is available in the simulator.
- **Search:** find any phrase by English, romaji, or Japanese.
- **Quick reference:** a printable one-page cheat sheet for each scenario.
- **Accounts:** sign in with a password, a magic link, or a new account. Progress syncs across devices. Sessions end after six hours.
- **Profile:** registered name, avatar, email, phone, progress for every scenario, flashcard deck and simulator conversation, plus your current streak and total days studied.
- **Reminders:** an optional daily push notification (09:00, via Vercel cron) when flashcards are due.
- **Themes:** light and dark modes, plus a pastel palette.
- **Offline-friendly:** installable as a PWA with a service worker.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) and React, styled with Tailwind CSS v4 and shadcn-style components
- [Supabase](https://supabase.com) for auth, Postgres (with row-level security), and avatar storage
- [Zustand](https://zustand.docs.pmnd.rs) for client state
- [Anthropic Claude](https://www.anthropic.com) for the simulator's replies
- [ElevenLabs](https://elevenlabs.io) for text-to-speech and speech-to-text
- Vitest for unit tests

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root. Ask the project owner for the values. Never commit this file.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Supabase key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key, used by the seed script and push reminders |
| `SUPABASE_DB_URL`, `SUPABASE_APP_URL`, `SUPABASE_ID`, `DB_PW` | Supabase database and project details |
| `CLAUDE_API_KEY` | Simulator replies |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID` | Text-to-speech and speech-to-text |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web push reminders |
| `CRON_SECRET` | Protects the scheduled reminder endpoint |
| `TWILIO_AUTH_TOKEN`, `TWILIO_SSID`, `TWILIO_MESSAGE_SERVICE_SID` | SMS sign-in (hidden in the UI, see `PHONE_AUTH_ENABLED`) |

### 3. Database

Run the migrations in `supabase/migrations` in order, using the Supabase SQL editor or the Supabase CLI. Each migration is safe to re-run.

Then load the content (phrases and kana) into the database:

```bash
node --env-file=.env scripts/seed-content.mjs
```

The app reads content from the database first and falls back to the bundled JSON in `src/lib/data`, so it still works offline or while the database is unreachable.

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |

## Project structure

```
src/
  app/                  Routes (pages and API handlers)
  components/           UI, layout, phrase, simulator, profile and auth components
  hooks/                Audio, speech recognition, flashcard session, push subscription
  lib/
    data/               Bundled phrases and kana, content loader
    srs/                Spaced-repetition (SM-2) logic and streaks
    supabase/           Database access (progress, profile, simulator, avatars)
    auth/               Session and phone helpers
    simulator/          Simulator prompts and conversation flows
    tts/                Audio playback and caching
  store/                Zustand stores (auth, progress, onboarding, settings, theme)
supabase/migrations/    Database schema changes
scripts/                Content seeding
```

## Content

Phrases live in `src/lib/data/phrases.json`, with kana in `hiragana.json` and `katakana.json`. Each scenario has an `icon` (emoji), a label, and a list of phrases with `responses`. After editing the JSON, run the seed script to update the database.

## Known limitations

- Phone sign-in is hidden until SMS delivery is configured with Twilio.
- Email delivery uses Supabase's built-in sender unless custom SMTP is set up, which is limited in volume.
- The simulator's conversation flows are written in English. Japanese replies are generated by the model.
