'use client';

import { useProgressStore } from '@/store/progress';

// Thin convenience wrapper over the progress store's SRS-related actions
export function useSRS(scenarioSlug?: string) {
  const dueCards = useProgressStore((s) => s.getDueCards(scenarioSlug));
  const gradeCard = useProgressStore((s) => s.gradeCard);
  const completion = useProgressStore((s) =>
    scenarioSlug ? s.getCompletion(scenarioSlug) : 0,
  );

  return { dueCards, gradeCard, completion };
}
