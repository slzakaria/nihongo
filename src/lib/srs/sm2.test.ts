import { describe, it, expect } from 'vitest';
import { createCard, sm2 } from './sm2';

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

describe('sm2', () => {
  it('resets interval and repetitions on a failing grade', () => {
    const card = createCard('gr-01', 'greetings');
    const afterGoodRuns = sm2(sm2(card, 4), 4); // repetitions: 2, interval: 6
    const failed = sm2(afterGoodRuns, 0);
    expect(failed.repetitions).toBe(0);
    expect(failed.interval).toBe(1);
  });

  it('treats grade 2 (the Hard rating) as a lapse under the current SM-2 policy', () => {
    const card = sm2(sm2(createCard('gr-01', 'greetings'), 4), 4);
    const hard = sm2(card, 2);
    expect(hard.repetitions).toBe(0);
    expect(hard.interval).toBe(1);
  });

  it('grows the interval on consecutive passing grades (1 -> 6 -> ease-based)', () => {
    const card = createCard('gr-01', 'greetings');
    const first = sm2(card, 4);
    expect(first.repetitions).toBe(1);
    expect(first.interval).toBe(1);

    const second = sm2(first, 4);
    expect(second.repetitions).toBe(2);
    expect(second.interval).toBe(6);

    const third = sm2(second, 4);
    expect(third.repetitions).toBe(3);
    expect(third.interval).toBe(Math.round(6 * second.easeFactor));
  });

  it('never lets easeFactor drop below 1.3', () => {
    let card = createCard('gr-01', 'greetings');
    for (let i = 0; i < 20; i++) {
      card = sm2(card, 0);
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('sets lastReview and schedules nextReview in the future on a pass', () => {
    const card = createCard('gr-01', 'greetings');
    const before = Date.now();
    const graded = sm2(card, 5);
    expect(graded.lastReview).toBeGreaterThanOrEqual(before);
    expect(graded.nextReview).toBeGreaterThan(before);
  });

  it('increments totalReviews on every grade, including failures, and never resets it', () => {
    const card = createCard('gr-01', 'greetings');
    const passed = sm2(card, 4);
    expect(passed.totalReviews).toBe(1);

    const failed = sm2(passed, 0);
    expect(failed.totalReviews).toBe(2);
    expect(failed.repetitions).toBe(0); // repetitions resets on failure, totalReviews does not

    const passedAgain = sm2(failed, 4);
    expect(passedAgain.totalReviews).toBe(3);
  });

  it('increments correctReviews only on passing grades (>= 3), and never resets it', () => {
    const card = createCard('gr-01', 'greetings');
    const passed = sm2(card, 4);
    expect(passed.correctReviews).toBe(1);

    const failed = sm2(passed, 0);
    expect(failed.correctReviews).toBe(1);
    expect(failed.totalReviews).toBe(2);

    const passedAgain = sm2(failed, 3);
    expect(passedAgain.correctReviews).toBe(2);
  });
});
