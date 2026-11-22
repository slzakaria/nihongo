'use client';

import { useEffect, useState } from 'react';
import { useContentStore } from '@/lib/data/content';
import { useAuthStore } from '@/store/auth';
import {
  fetchConversationSummaries,
  type ConversationSummary,
} from '@/lib/supabase/simulator';
import { revisitInfo } from '@/lib/simulator/revisit';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { ScenarioMiniCard } from '@/components/scenarios/ScenarioMiniCard';

export default function SimulatorPickerPage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const userId = useAuthStore((s) => s.user?.id);
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!userId) return;
    void fetchConversationSummaries(userId).then(setSummaries);
  }, [userId]);

  const updatedBySlug = new Map(summaries.map((s) => [s.scenarioSlug, s.updatedAt]));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="Simulator"
        description="Pick a scenario and practice a live conversation."
      >
        <SearchTrigger />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {scenarios.map((s, i) => {
          const info = userId
            ? revisitInfo(updatedBySlug.get(s.slug), now)
            : { due: false, label: 'Start conversation' };
          return (
            <ScenarioMiniCard
              key={s.slug}
              scenario={s}
              href={`/simulator/${s.slug}`}
              index={i}
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
    </div>
  );
}
