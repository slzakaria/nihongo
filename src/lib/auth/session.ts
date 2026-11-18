// Sign-in time, stored in a cookie set by the auth callback. Read by middleware and the client.
export const SIGNED_IN_AT_COOKIE = 'hz_signed_in_at'
export const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000

// Records a fresh sign-in from the browser. Used by flows that verify on the client (phone codes).
export function markSignedInNow() {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SIGNED_IN_AT_COOKIE}=${Date.now()}; Path=/; Max-Age=${SESSION_MAX_AGE_MS / 1000}; SameSite=Lax${secure}`
}

// A missing or unreadable timestamp counts as expired, so sessions without a known start time are revalidated
export function isSessionExpired(signedInAt: string | null | undefined, now = Date.now()): boolean {
  if (!signedInAt) return true
  const started = Number(signedInAt)
  return !Number.isFinite(started) || now - started >= SESSION_MAX_AGE_MS
}

// Client-side read of the sign-in cookie
export function readSignedInAt(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${SIGNED_IN_AT_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
