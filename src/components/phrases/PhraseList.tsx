'use client';

import { useEffect, useMemo, useState } from 'react';
import { Difficulty, Phrase } from '@/types';
import { PhraseCard } from '@/components/phrases/PhraseCard';
import { Button } from '@/components/ui/button';
import { loadPhraseResponsesFor } from '@/lib/data/content';
import { useProgressStore } from '@/store/progress';
import { cn } from '@/lib/utils';

type Filter = 'all' | Difficulty;

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export function PhraseList({
  phrases,
  scenarioSlug,
}: {
  phrases: Phrase[];
  scenarioSlug: string;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [hydratedPhrases, setHydratedPhrases] = useState<Phrase[] | null>(null);
  const initScenario = useProgressStore((s) => s.initScenario);
  const needsResponseHydration = phrases.some((phrase) => phrase.responses.length === 0);
  const displayPhrases = hydratedPhrases ?? phrases;
  const difficultyCounts = useMemo(() => {
    const counts: Record<Difficulty, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0,
    };

    for (const phrase of phrases) counts[phrase.difficulty] += 1;
    return counts;
  }, [phrases]);

  useEffect(() => {
    initScenario(scenarioSlug);
  }, [scenarioSlug, initScenario]);

  useEffect(() => {
    if (!needsResponseHydration) {
      setHydratedPhrases(null);
      return;
    }

    let active = true;
    setHydratedPhrases(null);
    void loadPhraseResponsesFor(phrases).then((loaded) => {
      if (active) setHydratedPhrases(loaded);
    });
    return () => {
      active = false;
    };
  }, [needsResponseHydration, phrases]);

  const activeFilter = filter === 'all' || difficultyCounts[filter] > 0 ? filter : 'all';
  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? displayPhrases
        : displayPhrases.filter((p) => p.difficulty === activeFilter),
    [displayPhrases, activeFilter],
  );
  const filters: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: displayPhrases.length },
    ...DIFFICULTIES.map((difficulty) => ({
      value: difficulty,
      label: difficulty[0].toUpperCase() + difficulty.slice(1),
      count: difficultyCounts[difficulty],
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {filters.map(({ value, label, count }) => (
          <Button
            key={value}
            size="sm"
            variant={activeFilter === value ? 'default' : 'outline'}
            className={cn('capitalize', activeFilter === value && 'solid-primary-button')}
            disabled={value !== 'all' && count === 0}
            onClick={() => setFilter(value)}
          >
            {label} ({count})
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map((p) => <PhraseCard key={p.id} phrase={p} />)
        ) : (
          <p className="text-sm text-muted-foreground">
            No phrases at this difficulty in this scenario.
          </p>
        )}
      </div>
    </div>
  );
}
