'use client'

import Link from 'next/link'
import { useContentStore } from '@/lib/data/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProgressStore } from '@/store/progress'

export default function ScenariosPage() {
  const cards = useProgressStore(s => s.cards)
  const scenarios = useContentStore(s => s.content.phrases)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scenarios</h1>
        <p className="text-muted-foreground">Pick a situation to review its phrases.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {scenarios.map(s => {
          const scenarioCards = Object.values(cards).filter(c => c.scenarioSlug === s.slug)
          const reviewed = scenarioCards.filter(c => c.lastReview !== null).length
          const pct = s.phrases.length === 0 ? 0 : Math.round((reviewed / s.phrases.length) * 100)
          return (
            <Link key={s.slug} href={`/scenarios/${s.slug}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-base">{s.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Progress value={pct} />
                  <span className="text-xs text-muted-foreground">
                    {s.phrases.length} phrases · {pct}% reviewed
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
