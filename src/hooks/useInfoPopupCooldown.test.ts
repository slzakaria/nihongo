import { describe, expect, it } from 'vitest';
import { isInfoPopupCooldownComplete } from './useInfoPopupCooldown';

const DAY = 24 * 60 * 60 * 1000;

describe('isInfoPopupCooldownComplete', () => {
  it('allows the first informational popup', () => {
    expect(isInfoPopupCooldownComplete(null, 10_000)).toBe(true);
  });

  it('holds back another popup until a full day has passed', () => {
    expect(isInfoPopupCooldownComplete(10_000, 10_000 + DAY - 1)).toBe(false);
    expect(isInfoPopupCooldownComplete(10_000, 10_000 + DAY)).toBe(true);
  });
});
