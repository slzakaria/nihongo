import { describe, expect, it } from 'vitest';
import { revisitInfo } from './revisit';

const NOW = Date.UTC(2026, 10, 18, 12);
const daysAgo = (n: number) => new Date(NOW - n * 24 * 60 * 60 * 1000).toISOString();

describe('revisitInfo', () => {
  it('reports a scenario never practised as not started', () => {
    expect(revisitInfo(undefined, NOW)).toEqual({
      due: false,
      label: 'Not started yet',
    });
  });

  it('does not ask for a revisit within the first 3 days', () => {
    expect(revisitInfo(daysAgo(2), NOW).due).toBe(false);
  });

  it('asks for a revisit once 3 days have passed', () => {
    expect(revisitInfo(daysAgo(3), NOW).due).toBe(true);
  });
});
