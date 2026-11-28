'use client';

import Image from 'next/image';
import type { Scenario } from '@/types';
import { CardContent } from '@/components/ui/card';
import { LinkCard } from '@/components/ui/link-card';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';
import { scenarioKana } from '@/lib/data/scenarioKana';
import { scenarioAccent } from '@/lib/data/scenarioAccent';

// One scenario tile, shared by the Scenarios page and the landing page so they always match.
// Each scenario has a matching illustration in /public/scenarios/{slug}.png.
export function ScenarioCard({
  scenario,
  index = 0,
  eager = false,
}: {
  scenario: Scenario;
  index?: number;
  eager?: boolean;
}) {
  const scenarioProgress = useProgressStore((s) => s.scenarioProgress ?? {});

  const explored = scenario.phrases.filter((phrase) =>
    Boolean(scenarioProgress[phrase.id]),
  ).length;
  const total = scenario.phrases.length;
  const pct = total === 0 ? 0 : Math.round((explored / total) * 100);
  const kana = scenarioKana(scenario.slug);

  return (
    <LinkCard
      href={`/scenarios/${scenario.slug}`}
      className="scenario-card mx-auto w-[95%] overflow-hidden"
      index={index}
    >
      <div className="relative h-[88px] w-full overflow-hidden bg-muted sm:h-auto sm:aspect-[3/1]">
        <Image
          src={`/scenarios/${scenario.slug}.png`}
          alt=""
          fill
          sizes="(min-width: 1088px) 315px, (min-width: 640px) calc((100vw - 80px) / 3), calc(95vw - 30px)"
          loading={eager ? 'eager' : 'lazy'}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-0.5 px-4 py-2">
        <h3 className={`truncate text-sm font-semibold ${scenarioAccent(scenario.slug)}`}>
          {scenario.label}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {kana && (
            <span lang="ja" className="kana-text text-[1.1em]">
              {kana}
            </span>
          )}
          {kana && <span className="mx-1">·</span>}
          {total} phrase{total === 1 ? '' : 's'}
        </p>
      </div>
      <CardContent className="flex flex-col gap-1.5 p-3 pt-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold tracking-tight">{pct}%</span>
          <span className="text-xs text-muted-foreground">
            {explored} of {total} explored
          </span>
        </div>
        <Progress value={pct} className="h-1" />
      </CardContent>
    </LinkCard>
  );
}
