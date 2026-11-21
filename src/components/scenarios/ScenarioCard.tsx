'use client'

import type { Scenario } from '@/types'
import { CardContent } from '@/components/ui/card'
import { LinkCard } from '@/components/ui/link-card'
import { Progress } from '@/components/ui/progress'
import { useProgressStore } from '@/store/progress'
import { scenarioKana } from '@/lib/data/scenarioKana'

// One scenario tile, shared by the Scenarios page and the landing page so they always match
export function ScenarioCard({ scenario, index = 0 }: { scenario: Scenario; index?: number }) {
  const cards = useProgressStore(s => s.cards)

  const reviewed = Object.values(cards).filter(
    c => c.scenarioSlug === scenario.slug && c.lastReview !== null
  ).length
  const total = scenario.phrases.length
  const pct = total === 0 ? 0 : Math.round((reviewed / total) * 100)
  const kana = scenarioKana(scenario.slug)

  return (
    <LinkCard href={`/scenarios/${scenario.slug}`} className="overflow-hidden" index={index}>
      <div className="gradient-brand flex items-center justify-between gap-2 px-5 py-4">
        <div className="min-w-0">
          {kana && (
            <p lang="ja" className="truncate text-xs opacity-80">
              {kana}
            </p>
          )}
          <h3 className="min-w-0 truncate text-base font-semibold">{scenario.label}</h3>
        </div>
        {scenario.icon && (
          <span
            className="shrink-0 text-xl transition duration-300 group-hover:-rotate-6 group-hover:scale-125"
            aria-hidden="true"
          >
            {scenario.icon}
          </span>
        )}
      </div>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold tracking-tight">{pct}%</span>
          <span className="text-xs text-muted-foreground">
            {reviewed} of {total} reviewed
          </span>
        </div>
        <Progress value={pct} />
      </CardContent>
    </LinkCard>
  )
}
