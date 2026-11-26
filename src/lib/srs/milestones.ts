import type { SRSCard } from '@/types';

// Phrase reviews only. Kana cards are stored with a `kana:` scenario prefix.
export function countReviewedPhrases(cards: SRSCard[]): number {
  return cards.filter((c) => c.lastReview !== null && !c.scenarioSlug.startsWith('kana:'))
    .length;
}

export function countReviewedKana(cards: SRSCard[]): number {
  return cards.filter((c) => c.lastReview !== null && c.scenarioSlug.startsWith('kana:'))
    .length;
}
