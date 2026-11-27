'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useContentStore } from '@/lib/data/content';
import { groupScenarios } from '@/lib/data/scenarioGroups';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/layout/PageHeader';
import { BilingualText } from '@/components/layout/BilingualText';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { ScenarioMiniCard } from '@/components/scenarios/ScenarioMiniCard';
import { useProgressStore } from '@/store/progress';
import { useBookmarkStore } from '@/store/bookmarks';
import { FlashcardScenarioIntro } from '@/components/scenarios/ScenarioLearningPrompts';

export default function FlashcardsPage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const cards = useProgressStore((s) => s.cards);
  const scenarioProgress = useProgressStore((s) => s.scenarioProgress ?? {});
  const savedCount = useBookmarkStore((s) => s.phraseIds.length);
  const { groups, ungrouped, displayIndex } = groupScenarios(scenarios);

  const renderScenarioGrid = (items: typeof scenarios) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((s) => {
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
            index={displayIndex.get(s.slug) ?? 0}
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
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <FlashcardScenarioIntro scenarios={scenarios} scenarioProgress={scenarioProgress} />
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

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              <BilingualText english={group.title} japanese={group.titleKana} />
            </h2>
            {renderScenarioGrid(group.scenarios)}
          </section>
        ))}
        {ungrouped.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              <BilingualText english="More scenarios" japanese="そのほかのシナリオ" />
            </h2>
            {renderScenarioGrid(ungrouped)}
          </section>
        )}
      </div>
    </div>
  );
}
