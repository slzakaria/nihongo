'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { loadPhraseResponses, useContentStore } from '@/lib/data/content'
import { useSearchDialogStore } from '@/store/searchDialog'

// Caps the list so a broad query (e.g. a single common letter) doesn't render hundreds of rows
const MAX_RESULTS = 30

// Centered command-palette style search, reachable from the bar on every page and from the navbar.
// Each result is a plain link to its scenario, so clicking it actually navigates there.
export function SearchDialog() {
  const open = useSearchDialogStore(s => s.open)
  const hide = useSearchDialogStore(s => s.hide)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scenarios = useContentStore(s => s.content.phrases)

  const allEntries = useMemo(
    () => scenarios.flatMap(s => s.phrases.map(p => ({ phrase: p, scenario: s }))),
    [scenarios]
  )

  useEffect(() => {
    if (open) void loadPhraseResponses()
  }, [open])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, hide])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allEntries
      .filter(
        ({ phrase }) =>
          phrase.japanese.toLowerCase().includes(q) ||
          phrase.kanji?.toLowerCase().includes(q) ||
          phrase.romaji.toLowerCase().includes(q) ||
          phrase.english.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS)
  }, [allEntries, query])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onMouseDown={e => {
        if (e.target === e.currentTarget) hide()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search phrases"
        className="animate-scale-in flex w-full max-w-xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by English, romaji, or Japanese..."
            aria-label="Search phrases by English, romaji, or Japanese"
            className="h-6 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={hide}
            aria-label="Close search"
            className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Start typing to search every scenario&apos;s phrases.
            </p>
          )}
          {query.trim() && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No phrases found.</p>
          )}
          {results.map(({ phrase, scenario }) => (
            <Link
              key={phrase.id}
              href={`/scenarios/${scenario.slug}`}
              onClick={hide}
              className="flex flex-col gap-0.5 border-b border-border px-4 py-3 last:border-0 hover:bg-muted"
            >
              <div className="flex items-center justify-between gap-2">
                <p lang="ja" className="truncate text-sm font-medium">
                  {phrase.japanese}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">{scenario.label}</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {phrase.romaji} · {phrase.english}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
