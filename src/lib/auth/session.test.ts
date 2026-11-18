import { describe, expect, it } from 'vitest'
import { isSessionExpired, SESSION_MAX_AGE_MS } from './session'

const NOW = Date.UTC(2026, 10, 18, 12, 0, 0)

describe('isSessionExpired', () => {
  it('treats a missing sign-in time as expired', () => {
    expect(isSessionExpired(null, NOW)).toBe(true)
    expect(isSessionExpired(undefined, NOW)).toBe(true)
  })

  it('treats an unreadable sign-in time as expired', () => {
    expect(isSessionExpired('not-a-number', NOW)).toBe(true)
  })

  it('keeps a session signed in just under 6 hours', () => {
    expect(isSessionExpired(String(NOW - SESSION_MAX_AGE_MS + 1000), NOW)).toBe(false)
  })

  it('expires a session at exactly 6 hours', () => {
    expect(isSessionExpired(String(NOW - SESSION_MAX_AGE_MS), NOW)).toBe(true)
  })
})
