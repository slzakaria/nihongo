import { SRSCard, SRSGrade } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export const REVIEW_INTERVALS_MS: Readonly<Record<SRSGrade, number>> = {
  again: 30 * 1000,
  hard: 10 * 60 * 1000,
  good: DAY_MS,
  easy: 3 * DAY_MS,
};

export function createCard(phraseId: string, scenarioSlug: string): SRSCard {
  return {
    phraseId,
    scenarioSlug,
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
    lastReview: null,
    totalReviews: 0,
    correctReviews: 0,
  };
}

export function scheduleCard(card: SRSCard, grade: SRSGrade, now = Date.now()): SRSCard {
  const successful = grade === 'good' || grade === 'easy';
  const interval = grade === 'good' ? 1 : grade === 'easy' ? 3 : 0;

  return {
    ...card,
    interval,
    repetitions: successful ? card.repetitions + 1 : 0,
    lastReview: now,
    nextReview: now + REVIEW_INTERVALS_MS[grade],
    totalReviews: card.totalReviews + 1,
    correctReviews: card.correctReviews + (successful ? 1 : 0),
  };
}
