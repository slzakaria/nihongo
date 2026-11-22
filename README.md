# Hanazono (花園 - はなぞの)

**Survival Japanese for your trip.** Practise useful phrases by situation, learn kana, speak aloud, and build a study habit with goals, streaks and progress tracking.

## Features

- **Scenario phrasebook:** 38 travel situations, from restaurants and konbini to trains, hotels, onsen and emergencies. Phrases include romaji, usage notes, kanji where available, and common replies.
- **Spaced-repetition flashcards:** scenario-based SM-2 review decks that bring phrases back when they are due, with progress for each deck. Bookmark phrases and review them in a focused saved-phrase queue.
- **Kana study:** hiragana and katakana, organised by row, with a separate practice flow for kana due for review.
- **Offline practice:** phrase and kana flashcards work from bundled content, save progress on the device, and queue signed-in changes to sync when reconnected. Open Offline practice once while online to cache its app shell.
- **Getting-started tour:** a shorter first-visit tour is shown to signed-in and anonymous visitors. Signed-in completion is saved to the account; anonymous completion is remembered in a first-party cookie. Informational popups are spaced at least 24 hours apart in the browser.
- **Speaking practice:** listen to a phrase, record it in a supported browser, and get a match score with word-by-word feedback.
- **AI conversation simulator:** role-play travel scenarios with an AI partner. Type or speak your replies, and return to saved conversations later.
- **Audio:** listen to Japanese phrase pronunciations, with adjustable playback speed.
- **Search and quick references:** find phrases by English, romaji or Japanese, and print a compact phrase sheet for each scenario.
- **Study goals and milestones:** set daily and weekly review targets, track study streaks and days, and earn badges for phrases, scenarios and practice. New badges are celebrated in-app.
- **Daily recap:** revisit your recent study streak, phrase reviews and simulator practice.
- **Profile and preferences:** view progress, due cards, goals, badges, saved phrases and account activity; update your display name and avatar; choose a theme, romaji display mode and speech speed. Streak protection can cover a planned break.
- **Accounts:** Clerk-managed sign-in and sign-up. Signed-in profile and study data sync across devices.
- **Themes and installability:** light, dark and system themes; the web app manifest supports adding Hanazono to a device home screen.
- **Homepage:** a travel-focused hero, horizontally scrollable Explore links, a two-column simulator preview on desktop, featured scenarios, and a responsive kana teaser.

## Design system

The shared palette, typography, logo usage, dark-mode rules, and responsive homepage patterns are documented in the [design system guide](docs/design-system.md). Use the semantic CSS variables in `src/app/globals.css` when styling new components so they stay consistent across themes.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) and React, styled with Tailwind CSS v4 and shadcn-style components
- [Clerk](https://clerk.com) for authentication and [Supabase](https://supabase.com) for Postgres (with row-level security), profile data, study progress and avatar storage
- [Zustand](https://zustand.docs.pmnd.rs) for client state
- [Anthropic Claude](https://www.anthropic.com) for the simulator's replies
- [ElevenLabs](https://elevenlabs.io) for text-to-speech and server-side speech-to-text, with browser speech recognition where supported
- [Vercel Analytics](https://vercel.com/docs/analytics) for page-view analytics
- Vitest for unit tests

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env`, then fill in the values supplied by the project owner. `.env.example` contains blank placeholders and is safe to commit; never commit `.env`.

| Variable                                                           | Used for                                                                                     |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`            | Clerk sign-in and server-side authentication                                                 |
| `NEXT_PUBLIC_SUPABASE_URL`                                         | Supabase project URL                                                                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                             | Public Supabase key (browser)                                                                |
| `SUPABASE_SERVICE_ROLE_KEY`                                        | Server-only key for privileged operations, including the admin dashboard and content seeding |
| `SUPABASE_DB_URL`, `SUPABASE_APP_URL`, `SUPABASE_ID`, `DB_PW`      | Supabase database and project details                                                        |
| `CLAUDE_API_KEY`                                                   | Simulator replies                                                                            |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID` | Text-to-speech and speech-to-text                                                            |
| `RATE_LIMIT_SECRET`                                                | Optional secret for signing guest rate-limit cookies                                         |

### 3. Database

Run the migrations in `supabase/migrations` in order, using the Supabase SQL editor or the Supabase CLI. Each migration is safe to re-run.

The phrase and kana JSON is bundled with the app, so database access is not required to load practice content. To seed the optional content tables:

```bash
node --env-file=.env scripts/seed-content.mjs
```

To use offline practice in a production deployment, open `/offline-practice` once while connected so the service worker can cache its app shell and static assets. Generated audio, speech services, and the AI simulator still need their respective network services.

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                     | What it does                 |
| --------------------------- | ---------------------------- |
| `pnpm dev`                  | Start the development server |
| `pnpm build` / `pnpm start` | Production build and server  |
| `pnpm lint`                 | ESLint                       |
| `pnpm test`                 | Unit tests (Vitest)          |

## Project structure

```
docs/
  design-system.md      Visual tokens and responsive UI guidelines
src/
  app/                  App Router pages and API handlers
  components/           UI, layout, marketing, phrase, simulator, profile and auth components
  hooks/                Audio, speech recognition, flashcard session and popup timing
  lib/
    data/               Bundled phrase and kana content
    srs/                Spaced-repetition logic, merges and study-day helpers
    supabase/           Profile, progress, bookmark and activity access
    simulator/          Simulator prompts and conversation flows
    speech/, tts/       Speech scoring, recognition and audio playback
  store/                Zustand stores for auth, progress, bookmarks, goals and preferences
supabase/migrations/    Database schema changes
public/sw.js            Production service worker for offline practice
public/offline.html     Cached offline fallback shell
scripts/                Content seeding
```

Route details are listed in [`.claude/pages.md`](.claude/pages.md), with the current runtime structure in [`.claude/architecture.md`](.claude/architecture.md) and persistence/offline behavior in [`.claude/data-layer.md`](.claude/data-layer.md).

## Content

Phrases live in `src/lib/data/phrases.json`, with kana in `hiragana.json` and `katakana.json`. Each scenario has an `icon` (emoji), a label, and a list of phrases with `responses`. After editing the JSON, run the seed script to update the database.

## Known limitations

- Microphone-based practice depends on browser speech-recognition support and microphone permission.
- AI conversation, speaking feedback and generated audio require their corresponding API keys and may be subject to provider limits.
- Offline app-shell support requires a browser with service-worker support and a prior online visit to Offline practice. Offline progress is stored on the current device until signed-in changes can sync.
