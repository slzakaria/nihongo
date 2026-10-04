'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { getAllScenarios } from '@/lib/data/phrases'
import { useProgressStore } from '@/store/progress'
import { cn } from '@/lib/utils'

export function ScenarioSidebar({
  currentSlug,
  basePath,
}: {
  currentSlug: string
  basePath: string
}) {
  const scenarios = useMemo(() => getAllScenarios(), [])
  const cards = useProgressStore(s => s.cards)

  return (
    <nav className="hidden w-48 shrink-0 flex-col gap-1 md:flex">
      {scenarios.map(s => {
        const reviewed = Object.values(cards).filter(
          c => c.scenarioSlug === s.slug && c.lastReview !== null
        ).length
        const pct = s.phrases.length === 0 ? 0 : Math.round((reviewed / s.phrases.length) * 100)
        const active = s.slug === currentSlug
        return (
          <Link
            key={s.slug}
            href={`${basePath}/${s.slug}`}
            className={cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
              active && 'bg-secondary text-secondary-foreground hover:bg-secondary'
            )}
          >
            <span>{s.label}</span>
            <span className="text-xs text-muted-foreground">{pct}%</span>
          </Link>
        )
      })}
    </nav>
  )
}
