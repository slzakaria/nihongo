'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { KanaCard } from '@/components/kana/KanaCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { loadKana, useContentStore } from '@/lib/data/content'
import { cn } from '@/lib/utils'

const labels = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
} as const

type Script = keyof typeof labels

export default function KanaPage() {
  const [script, setScript] = useState<Script>('hiragana')
  const rows = useContentStore(s => s.content[script])

  useEffect(() => {
    loadKana()
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader title="Kana" description="Learn the Japanese syllabaries, row by row.">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/kana/practice"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            Practise due kana
          </Link>
          <SearchTrigger className="max-w-xs" />
        </div>
      </PageHeader>

      <div role="tablist" className="flex gap-2">
        {(Object.keys(labels) as Script[]).map(key => (
          <Button
            key={key}
            role="tab"
            aria-selected={script === key}
            size="sm"
            variant={script === key ? 'default' : 'outline'}
            className={cn('min-w-28 cursor-pointer')}
            onClick={() => setScript(key)}
          >
            {labels[key]}
          </Button>
        ))}
      </div>

      {rows.map(row => (
        <section key={row.slug} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{row.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {row.phrases.map(kana => (
              <KanaCard key={kana.id} kana={kana} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
