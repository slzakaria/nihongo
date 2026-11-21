'use client'

import Image from 'next/image'
import type { Scenario } from '@/types'
import { CardContent } from '@/components/ui/card'
import { LinkCard } from '@/components/ui/link-card'
import { Progress } from '@/components/ui/progress'
import { useProgressStore } from '@/store/progress'
import { scenarioKana } from '@/lib/data/scenarioKana'
import { scenarioAccent } from '@/lib/data/scenarioAccent'

// One scenario tile, shared by the Scenarios page and the landing page so they always match.
// Each scenario has a matching illustration in /public/scenarios/{slug}.png.
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
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={`/scenarios/${scenario.slug}.png`}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-0.5 px-4 py-2.5">
        <h3 className={`truncate text-sm font-semibold ${scenarioAccent(scenario.slug)}`}>{scenario.label}</h3>
        <p className="truncate text-xs text-muted-foreground">
          {kana && <span lang="ja">{kana} · </span>}
          {total} phrase{total === 1 ? '' : 's'}
        </p>
      </div>
      <CardContent className="flex flex-col gap-1.5 p-4 pt-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold tracking-tight">{pct}%</span>
          <span className="text-xs text-muted-foreground">
            {reviewed} of {total} reviewed
          </span>
        </div>
        <Progress value={pct} className="h-1" />
      </CardContent>
    </LinkCard>
  )
}
