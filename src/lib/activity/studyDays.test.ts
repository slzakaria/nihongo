import { describe, expect, it } from 'vitest';
import { computeStudyStats } from './studyDays';

describe('computeStudyStats', () => {
  it('counts distinct days once', () => {
    expect(
      computeStudyStats(['2026-11-16', '2026-11-16', '2026-11-17'], '2026-11-18').total,
    ).toBe(2);
  });

  it('counts a streak that includes today', () => {
    expect(
      computeStudyStats(['2026-11-16', '2026-11-17', '2026-11-18'], '2026-11-18').streak,
    ).toBe(3);
  });

  it('keeps the streak alive when the last study day was yesterday', () => {
    expect(computeStudyStats(['2026-11-16', '2026-11-17'], '2026-11-18').streak).toBe(2);
  });

  it('resets the streak after a missed day', () => {
    expect(computeStudyStats(['2026-11-14', '2026-11-15'], '2026-11-18').streak).toBe(0);
  });
});
