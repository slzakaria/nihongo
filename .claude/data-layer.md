# Data Layer and Offline Sync

## Content

- Phrase and kana content is bundled in `src/lib/data/`; standard practice does not need a content API.
- `src/lib/data/phrases.ts` provides phrase lookup helpers used by study flows.
- Supabase content tables can be populated with `scripts/seed-content.mjs`, but the bundled data is the runtime source for phrase and kana practice.

## Local study state

- `src/store/progress.ts` stores SRS cards in the `nihongo-progress` Zustand persistence entry. It also retains signed-in pending card writes, study days, and scenario resets.
- `src/store/bookmarks.ts` stores saved phrase IDs in `nihongo-bookmarks`, along with queued signed-in bookmark changes.
- Other Zustand stores hold settings, goals, streaks, onboarding, badges, and theme state.
- Guests can practice and save data locally. On account changes, `src/components/auth/AuthSync.tsx` prevents one visitor's local data from being reused for another account.

## Signed-in synchronization

- Clerk supplies the account identity; `AuthSync` loads account sync only for signed-in users.
- `src/lib/supabase/sync.ts` hydrates server cards and bookmarks, merges them with local state, then flushes pending writes to Supabase.
- Pending changes are acknowledged only after their write succeeds. Failed operations stay queued and are retried with backoff.
- Sync pauses while the browser is offline. The `online` event and visible-tab transition schedule a retry.
- `src/lib/supabase/` contains the data adapters for profiles, review cards, bookmarks, and study activity. Database schema changes live under `supabase/migrations/`.

## Offline practice

- `/offline-practice` is the dedicated entry point for offline flashcard and kana practice.
- `public/sw.js` caches the offline fallback shell plus same-origin assets requested from the offline-practice, scenarios, flashcards, and kana pages.
- Scenario/flashcards/kana page navigations are network-first with a per-page cache fallback (`PAGE_CACHE` in `sw.js`): the page is cached on every successful visit (capped, oldest evicted first) and served from that cache if a later navigation to the same URL fails offline — so a page opened once while online stays available on a cold offline load later, not just within the same session. A page never visited still falls back to the generic offline shell.
- `src/hooks/useOnlineStatus.ts` centralizes `navigator.onLine`/`online`/`offline` detection; `src/components/layout/OfflineBadge.tsx` shows an app-wide offline indicator, and `src/components/flashcards/SyncStatus.tsx` shows pending-write detail within practice flows.
- Study content is bundled and progress is persisted locally; network-dependent simulator, speech, generated-audio, and AI word-lookup (`/api/word`) services are not available offline.

Keep Supabase service-role credentials and external AI or speech-provider keys on the server. Do not fetch bundled phrase data from a new API without a product requirement.
