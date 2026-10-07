'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProgressStore } from '@/store/progress'
import { getAllScenarios } from '@/lib/data/phrases'

export default function Home() {
  const cards = useProgressStore(s => s.cards)
  const scenarios = useMemo(() => getAllScenarios(), [])

  const totalPhrases = useMemo(
    () => scenarios.reduce((sum, s) => sum + s.phrases.length, 0),
    [scenarios]
  )
  const reviewedCount = useMemo(
    () => Object.values(cards).filter(c => c.lastReview !== null).length,
    [cards]
  )
  const overallPct = totalPhrases === 0 ? 0 : Math.round((reviewedCount / totalPhrases) * 100)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="flex flex-col items-start gap-3">
        <h1 className="text-3xl font-semibold tracking-tight"><span>はなぞの -</span> Survival Japanese for your trip</h1>
        <p className="max-w-xl text-muted-foreground">
          Phrases organized by situation, spaced-repetition drills, and a live chat simulator —
          everything you need for bars, shops, and small talk in Japan.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/flashcards">Start Flashcards</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/scenarios">Browse Scenarios</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/simulator">Try Simulator</Link>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your progress</h2>
          <span className="text-sm text-muted-foreground">
            {reviewedCount} / {totalPhrases} phrases reviewed
          </span>
        </div>
        <Progress value={overallPct} />

        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {scenarios.map(s => {
            const scenarioCards = Object.values(cards).filter(c => c.scenarioSlug === s.slug)
            const reviewed = scenarioCards.filter(c => c.lastReview !== null).length
            const pct = s.phrases.length === 0 ? 0 : Math.round((reviewed / s.phrases.length) * 100)
            return (
              <Link key={s.slug} href={`/scenarios/${s.slug}`}>
                <Card className="transition-colors hover:border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{s.label}</span>
                      <span className="text-sm font-normal text-muted-foreground">{pct}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={pct} />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
