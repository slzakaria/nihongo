@AGENTS.md

# Hanazono — Project Context

Hanazono is a travel-focused Japanese learning app. It combines scenario phrases, kana study, spaced-repetition practice, pronunciation feedback, and AI role-play.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4 with shared CSS theme tokens and shadcn-style UI components
- Clerk authentication and Supabase account data
- Zustand client state with local persistence and queued signed-in sync
- AI conversation and speech services behind server-side API routes
- Vitest for unit tests

## Source of truth

- Route inventory: [`.claude/pages.md`](.claude/pages.md)
- Runtime structure: [`.claude/architecture.md`](.claude/architecture.md)
- Visual tokens and responsive design rules: [`docs/design-system.md`](docs/design-system.md)
- Bundled phrase and kana content: `src/lib/data/`
- Shared theme variables and custom visual treatments: `src/app/globals.css`

## Product and data notes

- Phrase and kana practice content is bundled with the app and remains available offline.
- Review progress and bookmarks are stored locally; signed-in changes are synchronized with Supabase.
- Clerk is the identity provider. Do not treat authentication or Supabase as optional/local-only features.
- The production service worker is `public/sw.js`; the offline practice entry point is `/offline-practice`.
- Keep AI, database service-role, and speech-provider credentials on the server.

## Implementation conventions

- Prefer Server Components; add `'use client'` only for browser state, event handlers, or hooks.
- Use the semantic theme classes and CSS variables rather than introducing a separate palette. Keep light and dark states paired for custom colors.
- Japanese copy should use `lang="ja"` on its containing element.
- Keep keyboard focus visible and give icon-only controls accessible names.
- Run the narrowest relevant tests, then `pnpm exec tsc --noEmit` for type validation when changing application code.
