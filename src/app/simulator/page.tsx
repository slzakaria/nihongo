'use client';

import { useEffect, useState } from 'react';
import { useContentStore } from '@/lib/data/content';
import { groupScenarios } from '@/lib/data/scenarioGroups';
import { useAuthStore } from '@/store/auth';
import {
  fetchConversationSummaries,
  type ConversationSummary,
} from '@/lib/supabase/simulator';
import { revisitInfo } from '@/lib/simulator/revisit';
import { PageHeader } from '@/components/layout/PageHeader';
import { BilingualText } from '@/components/layout/BilingualText';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { ScenarioMiniCard } from '@/components/scenarios/ScenarioMiniCard';

export default function SimulatorPickerPage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const userId = useAuthStore((s) => s.user?.id);
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [now] = useState(() => Date.now());
  const { groups, ungrouped, displayIndex } = groupScenarios(scenarios);

  useEffect(() => {
    if (!userId) return;
    void fetchConversationSummaries(userId).then(setSummaries);
  }, [userId]);

  const updatedBySlug = new Map(summaries.map((s) => [s.scenarioSlug, s.updatedAt]));

  const renderScenarioGrid = (items: typeof scenarios) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((s) => {
        const info = userId
          ? revisitInfo(updatedBySlug.get(s.slug), now)
          : { due: false, label: 'Start conversation' };
        return (
          <ScenarioMiniCard
            key={s.slug}
            scenario={s}
            href={`/simulator/${s.slug}`}
            index={displayIndex.get(s.slug) ?? 0}
            size="lg"
          >
            <span
              className={
                info.due
                  ? 'text-xs font-medium text-primary'
                  : 'text-xs text-muted-foreground'
              }
            >
              {info.label}
            </span>
          </ScenarioMiniCard>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="Simulator"
        titleKana="かいわシミュレーター"
        description="Pick a scenario and practice a live conversation."
        descriptionKana="シナリオをえらんで、リアルタイムのかいわをれんしゅうしましょう。"
      >
        <SearchTrigger />
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
