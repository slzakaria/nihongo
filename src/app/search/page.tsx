'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useContentStore } from '@/lib/data/content'
import { PhraseCard } from '@/components/phrases/PhraseCard'
import { PageHeader } from '@/components/layout/PageHeader'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const scenarios = useContentStore(s => s.content.phrases)
  const allEntries = useMemo(
    () => scenarios.flatMap(s => s.phrases.map(p => ({ phrase: p, scenario: s }))),
    [scenarios]
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allEntries.filter(
      ({ phrase }) =>
        phrase.japanese.toLowerCase().includes(q) ||
        phrase.kanji?.toLowerCase().includes(q) ||
        phrase.romaji.toLowerCase().includes(q) ||
        phrase.english.toLowerCase().includes(q)
    )
  }, [allEntries, query])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6">
      <PageHeader
        title="Search phrases"
        description="Search by English, romaji, or Japanese across every scenario."
      />
      <input
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="e.g. receipt, oishii, 乾杯..."
        aria-label="Search phrases by English, romaji, or Japanese"
        className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {query.trim() && (
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {results.length} result{results.length === 1 ? '' : 's'}
        </p>
      )}
      <div className="flex flex-col gap-4">
        {results.map(({ phrase, scenario }) => (
          <div key={phrase.id} className="flex flex-col gap-1">
            <Link
              href={`/scenarios/${scenario.slug}`}
              className="self-start text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              {scenario.label}
            </Link>
            <PhraseCard phrase={phrase} />
          </div>
        ))}
      </div>
    </div>
  )
}
