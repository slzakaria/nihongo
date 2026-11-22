'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useContentStore } from '@/lib/data/content';
import { useProgressStore } from '@/store/progress';
import { scenarioKana } from '@/lib/data/scenarioKana';
import { BilingualText } from '@/components/layout/BilingualText';
import { cn } from '@/lib/utils';

export function ScenarioSidebar({
  currentSlug,
  basePath,
}: {
  currentSlug: string;
  basePath: string;
}) {
  const scenarios = useContentStore((s) => s.content.phrases);
  const cards = useProgressStore((s) => s.cards);

  // One pass over the cards, instead of one scan per scenario
  const reviewedByScenario = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of Object.values(cards)) {
      if (c.lastReview === null) continue;
      counts.set(c.scenarioSlug, (counts.get(c.scenarioSlug) ?? 0) + 1);
    }
    return counts;
  }, [cards]);

  return (
    <nav className="hidden w-[240px] shrink-0 flex-col gap-1 md:flex lg:w-[260px] xl:w-[300px]">
      {scenarios.map((s) => {
        const reviewed = reviewedByScenario.get(s.slug) ?? 0;
        const pct =
          s.phrases.length === 0 ? 0 : Math.round((reviewed / s.phrases.length) * 100);
        const active = s.slug === currentSlug;
        return (
          <Link
            key={s.slug}
            href={`${basePath}/${s.slug}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'grid grid-cols-[minmax(0,1fr)_3.25rem] items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-foreground/5',
              active &&
                'bg-secondary/20 font-semibold text-foreground hover:bg-secondary/25',
            )}
          >
            <span className="min-w-0">
              <BilingualText
                english={s.label}
                japanese={scenarioKana(s.slug) ?? 'シナリオ'}
                className="max-w-full"
              />
            </span>
            <span className="shrink-0 pl-2 text-right text-xs tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
