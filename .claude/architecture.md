# Architecture

Hanazono is a Next.js App Router application. Route handlers live beside pages under `src/app`; shared UI and browser state are separated into components, hooks, libraries, and Zustand stores.

```text
src/
  app/
    (marketing)/          Landing page
    api/                  Server routes for AI, speech, audio, and account operations
    flashcards/           Review setup, sessions, and saved phrases
    kana/                 Kana reference and practice
    offline-practice/     Offline practice entry point
    profile/              Account progress and preferences
    quick-ref/            Printable phrase sheets
    scenarios/            Scenario directory and phrase lists
    simulator/            AI role-play sessions
    speaking/             Pronunciation practice
  components/
    auth/ layout/ marketing/ profile/ ui/
    flashcards/ kana/ phrases/ scenarios/ search/ simulator/
  hooks/                  Audio, speech recognition, review, and popup timing
  lib/
    activity/              Study-day and activity helpers
    data/                  Bundled phrase and kana content
    simulator/ ai/         Prompt and AI request logic
    speech/ tts/            Speech scoring and audio
    srs/                    Review scheduling and merge logic
    supabase/               Persistence adapters
  store/                   Zustand state for auth, study, goals, and settings
public/
  offline.html sw.js       Offline shell and service worker
supabase/migrations/       Database schema
docs/                      User-facing project documentation
```

## Data and synchronization

- Phrase and kana content is bundled with the app so standard study flows do not need a content API.
- Zustand stores keep study state available locally. Signed-in changes are queued and synchronized with Supabase; the offline practice flow can continue without a network connection.
- The service worker (`public/sw.js`) caches the Scenarios/Flashcards/Kana pages themselves (plus their assets) as they're visited, so a page opened once while online is available on a later cold offline load, not only mid-session.
- Clerk provides identity. Supabase stores account profiles, review progress, bookmarks, and study activity.
- API credentials for AI and speech providers must remain server-side.

See [pages.md](pages.md) for the route inventory and [../docs/design-system.md](../docs/design-system.md) for visual implementation guidance.
