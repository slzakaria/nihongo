import { describe, it, expect } from 'vitest';
import { computeStreak } from './streak';
import { createCard } from './scheduler';
import { SRSCard } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

function reviewedAt(ts: number): SRSCard {
  return { ...createCard('x', 'greetings'), lastReview: ts };
}

describe('computeStreak', () => {
  it('is 0 when nothing has ever been reviewed', () => {
    expect(computeStreak([createCard('x', 'greetings')])).toBe(0);
  });

  it('is 1 when only reviewed today', () => {
    const now = Date.now();
    expect(computeStreak([reviewedAt(now)], now)).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const now = Date.now();
    const cards = [
      reviewedAt(now),
      reviewedAt(now - DAY_MS),
      reviewedAt(now - 2 * DAY_MS),
    ];
    expect(computeStreak(cards, now)).toBe(3);
  });

  it('still counts the streak if today has no review yet but yesterday does', () => {
    const now = Date.now();
    const cards = [reviewedAt(now - DAY_MS), reviewedAt(now - 2 * DAY_MS)];
    expect(computeStreak(cards, now)).toBe(2);
  });

  it('breaks on a gap day', () => {
    const now = Date.now();
    const cards = [reviewedAt(now), reviewedAt(now - 3 * DAY_MS)];
    expect(computeStreak(cards, now)).toBe(1);
  });
});
