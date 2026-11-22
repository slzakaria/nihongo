'use client';

import { useEffect, useMemo, useState } from 'react';
import { Phrase } from '@/types';
import { PhraseCard } from '@/components/phrases/PhraseCard';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/store/progress';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'core' | 'extra';

export function PhraseList({
  phrases,
  scenarioSlug,
}: {
  phrases: Phrase[];
  scenarioSlug: string;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const initScenario = useProgressStore((s) => s.initScenario);

  useEffect(() => {
    initScenario(scenarioSlug);
  }, [scenarioSlug, initScenario]);

  const filtered = useMemo(
    () => (filter === 'all' ? phrases : phrases.filter((p) => p.difficulty === filter)),
    [phrases, filter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['all', 'core', 'extra'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            className={cn('capitalize')}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((p) => (
          <PhraseCard key={p.id} phrase={p} />
        ))}
      </div>
    </div>
  );
}
