import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'
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

// Reads all three tables with the public key. Returns null if any table fails or is empty,
// so callers can fall back to the bundled JSON.
export async function fetchContent(): Promise<ContentSet | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  try {
    const entries = await Promise.all(
      (Object.keys(TABLES) as (keyof ContentSet)[]).map(async name => {
        const { data, error } = await supabase
          .from(TABLES[name])
          .select('slug, label, icon, phrases')
          .order('sort_order')
        if (error || !data || data.length === 0) throw new Error(`${TABLES[name]} unavailable`)
        const scenarios: Scenario[] = data.map(row => ({
          slug: row.slug,
          label: row.label,
          icon: row.icon,
          phrases: row.phrases,
        }))
        return [name, scenarios] as const
      })
    )
    return Object.fromEntries(entries) as unknown as ContentSet
  } catch {
    return null
  }
}

// For server components and route handlers: database first, bundled JSON as fallback.
export async function loadContent(): Promise<ContentSet> {
  return (await fetchContent()) ?? FALLBACK_CONTENT
}
