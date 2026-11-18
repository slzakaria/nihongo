'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ConversationSummary } from '@/lib/supabase/simulator'
import type { Scenario, SRSCard } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Tab = 'scenarios' | 'flashcards' | 'simulator'

const TABS: { value: Tab; label: string }[] = [
  { value: 'scenarios', label: 'Scenarios' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'simulator', label: 'Simulator' },
]

// A card counts as mastered once it has been answered correctly three times in a row (SM-2 convention)
const MASTERED_REPETITIONS = 3

function formatDate(value: number | string | null | undefined) {
  if (value === null || value === undefined) return '—'
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export function ProgressTabs({
  cards,
  scenarios,
  conversations,
  now,
}: {
  cards: SRSCard[]
  scenarios: Scenario[]
  conversations: ConversationSummary[] | null
  now: number
}) {
  const [tab, setTab] = useState<Tab>('scenarios')
  const conversationBySlug = new Map((conversations ?? []).map(c => [c.scenarioSlug, c]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 rounded-md border border-border p-0.5" role="tablist" aria-label="Progress by">
        {TABS.map(t => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors',
              tab === t.value ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {scenarios.map(s => {
          const scenarioCards = cards.filter(c => c.scenarioSlug === s.slug)
          const total = s.phrases.length

          if (tab === 'scenarios') {
            const reviewed = scenarioCards.filter(c => c.lastReview !== null).length
            const pct = total === 0 ? 0 : Math.round((reviewed / total) * 100)
            return (
              <RowCard key={s.slug} href={`/scenarios/${s.slug}`} icon={s.icon} title={s.label}>
                <Progress value={pct} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {reviewed} / {total} reviewed
                  </span>
                  <span className="font-medium text-foreground">{pct}%</span>
                </div>
              </RowCard>
            )
          }

          if (tab === 'flashcards') {
            const mastered = scenarioCards.filter(c => c.repetitions >= MASTERED_REPETITIONS).length
            const learning = scenarioCards.filter(
              c => c.lastReview !== null && c.repetitions < MASTERED_REPETITIONS
            ).length
            const due = scenarioCards.filter(c => c.nextReview <= now).length
            const upcoming = scenarioCards.filter(c => c.nextReview > now).map(c => c.nextReview)
            const nextReview = upcoming.length > 0 ? Math.min(...upcoming) : null
            const pct = total === 0 ? 0 : Math.round((mastered / total) * 100)
            return (
              <RowCard key={s.slug} href={`/flashcards/${s.slug}`} icon={s.icon} title={s.label}>
                <Progress value={pct} />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{mastered} mastered</span>
                  <span>· {learning} learning</span>
                  {due > 0 && <Badge variant="secondary">{due} due</Badge>}
                  <span className="ml-auto">Next: {formatDate(nextReview)}</span>
                </div>
              </RowCard>
            )
          }

          const conversation = conversationBySlug.get(s.slug)
          return (
            <RowCard key={s.slug} href={`/simulator/${s.slug}`} icon={s.icon} title={s.label}>
              {conversation ? (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {conversation.userTurns} {conversation.userTurns === 1 ? 'reply' : 'replies'}
                  </span>
                  <span>Last practised {formatDate(conversation.updatedAt)}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Not started yet</span>
              )}
            </RowCard>
          )
        })}
      </div>
    </div>
  )
}

function RowCard({
  href,
  icon,
  title,
  children,
}: {
  href: string
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="text-xl transition duration-300 group-hover:scale-110" aria-hidden="true">
                {icon}
              </span>
            )}
            <h3 className="truncate text-sm font-medium">{title}</h3>
          </div>
          {children}
        </CardContent>
      </Card>
    </Link>
  )
}
