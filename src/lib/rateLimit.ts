import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

// Shared anonymous-caller cap. Signed-in users (checked by callers via currentServerUser())
// skip this entirely — this only throttles guests.
export const ANON_DAILY_LIMIT = 20;
const DAY_SECONDS = 3600;

// Signs the cookie so a client can't edit its own count back down (e.g. `today:0`) or replay a
// cookie minted for a different route. Prefer a dedicated secret; fall back to secrets already
// required in production so no new env var is needed there. In local dev, where none of those
// may be set, fall back to a random per-process secret — existing cookies simply stop verifying
// (and guests get a fresh count) after a restart, which is harmless.
const SECRET =
  process.env.RATE_LIMIT_SECRET ??
  process.env.CLERK_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  randomBytes(32).toString("hex");

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32);
}

function verify(payload: string, signature: string): boolean {
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export interface RateLimitResult {
  limited: boolean;
  setCookie?: string;
}

// Hard per-day cap for anonymous requests, tracked via a signed HttpOnly cookie
// (`date:count.signature`). The signature covers the cookie name too, so a value can't be
// edited down or copied onto a different endpoint's cookie. Any cookie that fails to verify is
// treated as already over the limit rather than reset to zero — resetting it would hand an
// attacker an easy way to defeat the cap by sending a slightly-tweaked value each time.
export function checkAndBumpDailyLimit(
  req: NextRequest,
  cookieName: string,
  limit: number,
): RateLimitResult {
  const raw = req.cookies.get(cookieName)?.value ?? "";
  const today = todayKey();

  let count = 0;
  if (raw) {
    const dot = raw.lastIndexOf(".");
    const payload = dot === -1 ? raw : raw.slice(0, dot);
    const signature = dot === -1 ? "" : raw.slice(dot + 1);

    if (!verify(`${cookieName}:${payload}`, signature)) {
      return { limited: true };
    }

    const [storedDate, storedCount] = payload.split(":");
    count = storedDate === today ? parseInt(storedCount || "0", 10) || 0 : 0;
  }

  if (count >= limit) {
    return { limited: true };
  }

  const payload = `${today}:${count + 1}`;
  const value = `${payload}.${sign(`${cookieName}:${payload}`)}`;
  const isProd = process.env.NODE_ENV === "production";
  const setCookie = `${cookieName}=${value}; Path=/; Max-Age=${DAY_SECONDS}; SameSite=Lax; HttpOnly${isProd ? "; Secure" : ""}`;
  return { limited: false, setCookie };
}
