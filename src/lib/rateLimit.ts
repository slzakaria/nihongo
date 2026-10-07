import { NextRequest } from 'next/server'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export interface RateLimitResult {
  limited: boolean
  setCookie?: string
}

// Soft per-day cap for anonymous requests, tracked via an HttpOnly cookie (date:count).
// Not a strict security control — just a cheap guard against unbounded anonymous API cost.
export function checkAndBumpDailyLimit(
  req: NextRequest,
  cookieName: string,
  limit: number
): RateLimitResult {
  const raw = req.cookies.get(cookieName)?.value ?? ''
  const [storedDate, storedCount] = raw.split(':')
  const count = storedDate === todayKey() ? parseInt(storedCount || '0', 10) || 0 : 0

  if (count >= limit) {
    return { limited: true }
  }

  const isProd = process.env.NODE_ENV === 'production'
  const setCookie = `${cookieName}=${todayKey()}:${count + 1}; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly${isProd ? '; Secure' : ''}`
  return { limited: false, setCookie }
}
