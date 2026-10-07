'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useOnboardingStore } from '@/store/onboarding'
import { useProgressStore } from '@/store/progress'
import { getAllScenarios, getAllPhrases } from '@/lib/data/phrases'
import { computeStreak } from '@/lib/srs/streak'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Tab = 'scenarios' | 'flashcards'

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)
  const userName = useOnboardingStore(s => s.userName)
  const cards = useProgressStore(s => s.cards)
  const scenarios = useMemo(() => getAllScenarios(), [])
  const [now] = useState(() => Date.now())
  const [tab, setTab] = useState<Tab>('scenarios')

  const allCards = Object.values(cards)
  const totalPhrases = getAllPhrases().length
  const reviewed = allCards.filter(c => c.lastReview !== null).length
  const due = allCards.filter(c => c.nextReview <= now).length
  const overallPct = totalPhrases === 0 ? 0 : Math.round((reviewed / totalPhrases) * 100)
  const streak = useMemo(() => computeStreak(allCards, now), [allCards, now])

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-2 px-4 py-20 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Sign in to view your progress</h1>
        <p className="text-sm text-muted-foreground">
          Use the account menu in the navbar to sign in and track your phrases.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {userName ? `${userName}'s progress` : 'Your progress'}
        </h1>
        <p className="text-muted-foreground">Synced to {user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Progress value={overallPct} />
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {reviewed} / {totalPhrases} phrases reviewed ({overallPct}%)
            </span>
            {due > 0 && <Badge variant="secondary">{due} due now</Badge>}
            {streak > 0 && <Badge variant="muted">🔥 {streak} day{streak === 1 ? '' : 's'} streak</Badge>}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">By scenario</h2>
          <div className="flex gap-1 rounded-md border border-border p-0.5" role="tablist" aria-label="View by">
            {(['scenarios', 'flashcards'] as const).map(t => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  'rounded px-3 py-1 text-xs font-medium capitalize transition-colors',
                  tab === t ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {scenarios.map(s => {
            const scenarioCards = allCards.filter(c => c.scenarioSlug === s.slug)
            const scenarioReviewed = scenarioCards.filter(c => c.lastReview !== null).length
            const scenarioDue = scenarioCards.filter(c => c.nextReview <= now).length
            const pct = s.phrases.length === 0 ? 0 : Math.round((scenarioReviewed / s.phrases.length) * 100)
            return (
              <Link key={s.slug} href={`/${tab}/${s.slug}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">{s.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Progress value={pct} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {scenarioReviewed} / {s.phrases.length} reviewed · {pct}%
                      </span>
                      {scenarioDue > 0 && <Badge variant="muted">{scenarioDue} due</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
