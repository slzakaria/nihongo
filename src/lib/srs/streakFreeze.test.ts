import { describe, expect, it } from 'vitest';
import { effectiveToday } from './streakFreeze';

describe('effectiveToday', () => {
  it('returns today unchanged when there is no freeze', () => {
    expect(effectiveToday(['2026-11-18'], '2026-11-20', null)).toBe('2026-11-20');
  });

  it('returns today unchanged once the freeze window has passed', () => {
    expect(effectiveToday(['2026-11-18'], '2026-11-20', '2026-11-19')).toBe('2026-11-20');
  });

  it('returns today unchanged if today was already studied', () => {
    expect(effectiveToday(['2026-11-20'], '2026-11-20', '2026-11-25')).toBe('2026-11-20');
  });

  it('pins to the most recent study day while an active freeze covers an unstudied today', () => {
    expect(effectiveToday(['2026-11-16', '2026-11-18'], '2026-11-20', '2026-11-25')).toBe(
      '2026-11-18',
    );
  });

  it('falls back to today if there are no study days at all, even with an active freeze', () => {
    expect(effectiveToday([], '2026-11-20', '2026-11-25')).toBe('2026-11-20');
  });
});
