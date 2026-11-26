import { SRSCard, SRSGrade } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

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

// SM-2 spaced repetition. grade: 0-2 = fail, 3 = hard, 4 = good, 5 = easy
export function sm2(card: SRSCard, grade: SRSGrade): SRSCard {
  let { interval, repetitions, easeFactor } = card;

  if (grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02),
  );

  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    lastReview: Date.now(),
    nextReview: Date.now() + interval * DAY_MS,
    totalReviews: card.totalReviews + 1,
    correctReviews: card.correctReviews + (grade >= 3 ? 1 : 0),
  };
}
