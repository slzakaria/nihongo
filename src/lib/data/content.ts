import { create } from 'zustand'
import type { Phrase, PhraseResponse, Scenario } from '@/types'
import phrasesRaw from './phrases.json'

export interface ContentSet {
  phrases: Scenario[]
  hiragana: Scenario[]
  katakana: Scenario[]
}

type StrippedScenario = Omit<Scenario, 'phrases'> & { phrases: Omit<Phrase, 'responses'>[] }

// Bundled phrase list without responses (see loadPhraseResponses). Used until the database loads, and whenever it is unreachable.
// Kana starts empty and fills in when a kana page calls loadKana.
export const FALLBACK_CONTENT: ContentSet = {
  phrases: (phrasesRaw.scenarios as StrippedScenario[]).map(s => ({
    ...s,
    phrases: s.phrases.map(p => ({ ...p, responses: [] })),
  })),
  hiragana: [],
  katakana: [],
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

type ResponseMap = Record<string, PhraseResponse[]>

// Imported only when something needs responses, so the JSON stays out of the initial bundle
let responseMap: Promise<ResponseMap> | undefined
function getResponseMap(): Promise<ResponseMap> {
  responseMap ??= import('./phrase-responses.json').then(m => m.default as ResponseMap)
  return responseMap
}

function attachResponses(scenarios: Scenario[], byId: ResponseMap): Scenario[] {
  return scenarios.map(s => ({
    ...s,
    phrases: s.phrases.map(p => ({ ...p, responses: byId[p.id] ?? p.responses })),
  }))
}

// Fills responses into the client store. Only the search page renders them there.
let responsesLoaded: Promise<void> | undefined
export function loadPhraseResponses(): Promise<void> {
  responsesLoaded ??= getResponseMap().then(byId => {
    const content = getContent()
    useContentStore.getState().setContent({ ...content, phrases: attachResponses(content.phrases, byId) })
  })
  return responsesLoaded
}

let kanaLoaded: Promise<void> | undefined
export function loadKana(): Promise<void> {
  kanaLoaded ??= Promise.all([import('./hiragana.json'), import('./katakana.json')]).then(([hiragana, katakana]) => {
    useContentStore.getState().setContent({
      ...getContent(),
      hiragana: hiragana.default.scenarios as Scenario[],
      katakana: katakana.default.scenarios as Scenario[],
    })
  })
  return kanaLoaded
}

// Bundled JSON is the primary source, so pages render with no network call. Supabase is only used if the
// bundled content is empty. Responses are merged in here because only server pages call this.
export async function loadContent(): Promise<ContentSet> {
  const content = FALLBACK_CONTENT.phrases.length > 0 ? FALLBACK_CONTENT : ((await fetchContent()) ?? FALLBACK_CONTENT)
  return { ...content, phrases: attachResponses(content.phrases, await getResponseMap()) }
}
