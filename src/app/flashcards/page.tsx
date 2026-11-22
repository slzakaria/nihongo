'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useContentStore } from '@/lib/data/content';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { ScenarioMiniCard } from '@/components/scenarios/ScenarioMiniCard';
import { useProgressStore } from '@/store/progress';
import { useBookmarkStore } from '@/store/bookmarks';

export default function FlashcardsPage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const cards = useProgressStore((s) => s.cards);
  const savedCount = useBookmarkStore((s) => s.phraseIds.length);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="Flashcards"
        titleKana="フラッシュカード"
        description="Pick a scenario to start a spaced-repetition session."
        descriptionKana="シナリオをえらんで、くりかえしれんしゅうをはじめましょう。"
      >
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/offline-practice"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            Offline practice
          </a>
          <Link
            href="/flashcards/bookmarks"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
            Saved phrases ({savedCount})
          </Link>
          <SearchTrigger />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {scenarios.map((s, i) => {
          const reviewed = Object.values(cards).filter(
            (c) => c.scenarioSlug === s.slug && c.lastReview !== null,
          ).length;
          const total = s.phrases.length;
          const pct = total === 0 ? 0 : Math.round((reviewed / total) * 100);

          return (
            <ScenarioMiniCard
              key={s.slug}
              scenario={s}
              href={`/flashcards/${s.slug}`}
              index={i}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold tracking-tight">{pct}%</span>
                  <span className="text-[10px] text-muted-foreground">
                    {reviewed}/{total}
                  </span>
                </div>
                <Progress value={pct} className="h-1" />
              </div>
            </ScenarioMiniCard>
          );
        })}
      </div>
    </div>
  );
}
