'use client'

import { ArrowRight, Layers } from 'lucide-react'
import { useContentStore } from '@/lib/data/content'
import { CardContent } from '@/components/ui/card'
import { LinkCard } from '@/components/ui/link-card'
import { PageHeader } from '@/components/layout/PageHeader'

export default function FlashcardsPage() {
  const scenarios = useContentStore(s => s.content.phrases)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="Flashcards"
        description="Pick a scenario to start a spaced-repetition session."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {scenarios.map((s, i) => (
          <LinkCard key={s.slug} href={`/flashcards/${s.slug}`} index={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true">
                {s.icon || <Layers className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium">{s.label}</h3>
                <p className="text-xs text-muted-foreground">{s.phrases.length} cards to review</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </CardContent>
          </LinkCard>
        ))}
      </div>
    </div>
  )
}
