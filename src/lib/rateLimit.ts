import { createHmac, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const ANON_DAILY_LIMIT = 20;
const DEVELOPMENT_SECRET =
  process.env.NODE_ENV === 'production' ? undefined : randomBytes(32).toString('hex');

export interface RateLimitResult {
  limited: boolean;
  unavailable?: boolean;
}

function clientIp(req: NextRequest): string | undefined {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const candidates = [
    ...(forwardedFor?.split(',') ?? []),
    req.headers.get('x-real-ip') ?? '',
  ];

  const forwardedIp = candidates
    .map((candidate) => candidate.trim())
    .find((ip) => isIP(ip));
  if (forwardedIp) return forwardedIp;
  return process.env.NODE_ENV === 'production' ? undefined : '127.0.0.1';
}

function rateLimitSecret(): string | undefined {
  return [
    process.env.RATE_LIMIT_SECRET,
    process.env.CLERK_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    DEVELOPMENT_SECRET,
  ].find((secret) => Boolean(secret?.trim()));
}

function identityHash(identity: string, secret: string): string {
  return createHmac('sha256', secret).update(identity).digest('hex');
}

export function accountRateLimitHash(userId: string): string | null {
  const secret = rateLimitSecret();
  return secret ? identityHash(`user:${userId}`, secret) : null;
}

function retryAfterSeconds(): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((millisecondsPerDay - (Date.now() % millisecondsPerDay)) / 1000);
}

export function rateLimitResponse(result: RateLimitResult): Response | undefined {
  if (result.unavailable) {
    return Response.json(
      { error: 'Usage limits are temporarily unavailable. Please try again.' },
      { status: 503, headers: { 'Retry-After': '30' } },
    );
  }

  if (!result.limited) return undefined;

  return Response.json(
    {
      error: "Today's usage limit has been reached. Please try again tomorrow.",
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds()) },
    },
  );
}

export async function checkAndBumpDailyLimit(
  req: NextRequest,
  provider: 'anthropic' | 'elevenlabs',
  userId: string | null,
  anonymousLimit = ANON_DAILY_LIMIT,
): Promise<RateLimitResult> {
  if (userId) return { limited: false };

  const secret = rateLimitSecret();
  const ip = clientIp(req);
  if (!secret || !ip) {
    console.error('API rate limiting is missing a stable secret or client IP');
    return { limited: false, unavailable: true };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('consume_api_daily_limit', {
    p_bucket: provider,
    p_identity_hash: identityHash(`ip:${ip}`, secret),
    p_limit: anonymousLimit,
  });

  if (error || typeof data !== 'boolean') {
    console.error('API rate-limit check failed', error);
    return { limited: false, unavailable: true };
  }

  return { limited: !data };
}
