import { create } from 'zustand'
import type { Scenario } from '@/types'
import phrasesRaw from './phrases.json'
import hiraganaRaw from './hiragana.json'
import katakanaRaw from './katakana.json'

export interface ContentSet {
  phrases: Scenario[]
  hiragana: Scenario[]
  katakana: Scenario[]
}

// Bundled copies of the JSON files. Used until the database loads, and whenever it is unreachable.
export const FALLBACK_CONTENT: ContentSet = {
  phrases: phrasesRaw.scenarios as Scenario[],
  hiragana: hiraganaRaw.scenarios as Scenario[],
  katakana: katakanaRaw.scenarios as Scenario[],
}

interface ContentStore {
  content: ContentSet
  setContent: (content: ContentSet) => void
}

export const useContentStore = create<ContentStore>()(set => ({
  content: FALLBACK_CONTENT,
  setContent: content => set({ content }),
}))

export function getContent(): ContentSet {
  return useContentStore.getState().content
}

const TABLES: Record<keyof ContentSet, string> = {
  phrases: 'phrase_scenarios',
  hiragana: 'hiragana_rows',
  katakana: 'katakana_rows',
}

// Reads the content tables through PostgREST with plain fetch. A supabase-js client here would create
// a second GoTrueClient in the browser, which shares the auth storage key with the app's auth client.
// The one-hour revalidate lets server renders reuse the cached response instead of querying on every request.
async function fetchTable(table: string, url: string, key: string): Promise<Scenario[]> {
  const res = await fetch(`${url}/rest/v1/${table}?select=slug,label,icon,phrases&order=sort_order.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`${table} unavailable`)
  const rows = (await res.json()) as Scenario[]
  if (rows.length === 0) throw new Error(`${table} is empty`)
  return rows.map(({ slug, label, icon, phrases }) => ({ slug, label, icon, phrases }))
}

// Reads all three tables with the public key. Returns null if any table fails or is empty,
// so callers can fall back to the bundled JSON.
export async function fetchContent(): Promise<ContentSet | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null

  try {
    const entries = await Promise.all(
      (Object.keys(TABLES) as (keyof ContentSet)[]).map(
        async name => [name, await fetchTable(TABLES[name], url, key)] as const
      )
    )
    return Object.fromEntries(entries) as unknown as ContentSet
  } catch {
    return null
  }
}

// Bundled JSON is the primary source, so pages render with no network call. Supabase is only used if the
// bundled content is empty.
export async function loadContent(): Promise<ContentSet> {
  if (FALLBACK_CONTENT.phrases.length > 0) return FALLBACK_CONTENT
  return (await fetchContent()) ?? FALLBACK_CONTENT
}
