'use client'

import type { Scenario } from '@/types'
import { CardContent } from '@/components/ui/card'
import { LinkCard } from '@/components/ui/link-card'
import { Progress } from '@/components/ui/progress'
import { useProgressStore } from '@/store/progress'

// One scenario tile, shared by the Scenarios page and the landing page so they always match
export function ScenarioCard({ scenario, index = 0 }: { scenario: Scenario; index?: number }) {
  const cards = useProgressStore(s => s.cards)

  const reviewed = Object.values(cards).filter(
    c => c.scenarioSlug === scenario.slug && c.lastReview !== null
  ).length
  const total = scenario.phrases.length
  const pct = total === 0 ? 0 : Math.round((reviewed / total) * 100)

  return (
    <LinkCard href={`/scenarios/${scenario.slug}`} className="overflow-hidden" index={index}>
      <div className="flex items-center gap-3 gradient-brand px-5 py-4">
        {scenario.icon && (
          <span className="inline-block text-2xl transition duration-300 group-hover:-rotate-6 group-hover:scale-125" aria-hidden="true">
            {scenario.icon}
          </span>
        )}
        <div>
          <h3 className="text-base font-semibold">{scenario.label}</h3>
        </div>
      </div>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold">{pct}%</span>
          <span className="text-xs text-muted-foreground">
            {reviewed} of {total} reviewed
          </span>
        </div>
        <Progress value={pct} />
      </CardContent>
    </LinkCard>
  )
}
