import { describe, expect, it } from 'vitest';
import { createCard, REVIEW_INTERVALS_MS, scheduleCard } from './scheduler';

describe('createCard', () => {
  it('creates a fresh card due immediately', () => {
    const card = createCard('gr-01', 'greetings');
    expect(card.phraseId).toBe('gr-01');
    expect(card.scenarioSlug).toBe('greetings');
    expect(card.interval).toBe(0);
    expect(card.repetitions).toBe(0);
    expect(card.easeFactor).toBe(2.5);
    expect(card.lastReview).toBeNull();
    expect(card.nextReview).toBeLessThanOrEqual(Date.now());
    expect(card.totalReviews).toBe(0);
    expect(card.correctReviews).toBe(0);
  });
});

describe('scheduleCard', () => {
  it('uses the four requested fixed intervals', () => {
    const card = createCard('gr-01', 'greetings');
    const now = 1_000_000;
    const grades = [
      ['again', 30_000],
      ['hard', 600_000],
      ['good', 86_400_000],
      ['easy', 259_200_000],
    ] as const;

    for (const [grade, interval] of grades) {
      expect(scheduleCard(card, grade, now).nextReview).toBe(now + interval);
    }
    expect(REVIEW_INTERVALS_MS.again).toBe(30_000);
    expect(REVIEW_INTERVALS_MS.hard).toBe(600_000);
    expect(REVIEW_INTERVALS_MS.good).toBe(86_400_000);
    expect(REVIEW_INTERVALS_MS.easy).toBe(259_200_000);
  });

  it('resets the learning streak on Again and Hard without losing review history', () => {
    const card = {
      ...createCard('gr-01', 'greetings'),
      repetitions: 4,
      totalReviews: 8,
      correctReviews: 6,
    };

    for (const grade of ['again', 'hard'] as const) {
      const result = scheduleCard(card, grade, 1_000);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(0);
      expect(result.totalReviews).toBe(9);
      expect(result.correctReviews).toBe(6);
      expect(result.lastReview).toBe(1_000);
    }
  });

  it('advances the streak for Good and Easy and stores day-based intervals', () => {
    const card = {
      ...createCard('gr-01', 'greetings'),
      repetitions: 2,
      totalReviews: 3,
      correctReviews: 2,
    };

    expect(scheduleCard(card, 'good', 1_000)).toMatchObject({
      interval: 1,
      repetitions: 3,
      nextReview: 86_401_000,
      totalReviews: 4,
      correctReviews: 3,
    });
    expect(scheduleCard(card, 'easy', 1_000)).toMatchObject({
      interval: 3,
      repetitions: 3,
      nextReview: 259_201_000,
      totalReviews: 4,
      correctReviews: 3,
    });
  });
});
