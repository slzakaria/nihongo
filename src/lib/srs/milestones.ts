import type { SRSCard } from '@/types';

// Phrase reviews only. Kana cards are stored with a `kana:` scenario prefix and don't count towards milestones.
export function countReviewedPhrases(cards: SRSCard[]): number {
  return cards.filter((c) => c.lastReview !== null && !c.scenarioSlug.startsWith('kana:'))
    .length;
}
