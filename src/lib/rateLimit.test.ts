import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ rpc }),
}));

import { NextRequest } from 'next/server';
import { accountRateLimitHash, checkAndBumpDailyLimit } from '@/lib/rateLimit';

describe('API daily limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('RATE_LIMIT_SECRET', 'test-rate-limit-secret');
    vi.stubEnv('NODE_ENV', 'test');
    rpc.mockResolvedValue({ data: true, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses a shared IP identity for anonymous provider requests', async () => {
    const req = new NextRequest('https://example.test/api', {
      headers: { 'x-forwarded-for': '192.0.2.10, 10.0.0.1' },
    });

    await expect(checkAndBumpDailyLimit(req, 'anthropic', null)).resolves.toEqual({
      limited: false,
    });

    expect(rpc).toHaveBeenCalledWith(
      'consume_api_daily_limit',
      expect.objectContaining({
        p_bucket: 'anthropic',
        p_limit: 20,
        p_identity_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
      }),
    );
    expect(JSON.stringify(rpc.mock.calls)).not.toContain('192.0.2.10');
  });

  it('does not rate limit signed-in users or their shared client IP', async () => {
    const req = new NextRequest('https://example.test/api', {
      headers: { 'x-real-ip': '192.0.2.10' },
    });

    await expect(checkAndBumpDailyLimit(req, 'elevenlabs', 'user-123')).resolves.toEqual({
      limited: false,
    });

    expect(rpc).not.toHaveBeenCalled();
    expect(accountRateLimitHash('user-123')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('does not require rate-limit configuration for signed-in users', async () => {
    vi.stubEnv('RATE_LIMIT_SECRET', '');
    vi.stubEnv('NODE_ENV', 'production');
    const req = new NextRequest('https://example.test/api');

    await expect(checkAndBumpDailyLimit(req, 'anthropic', 'user-123')).resolves.toEqual({
      limited: false,
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('fails closed when the shared counter cannot be checked', async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: new Error('database unavailable'),
    });
    const req = new NextRequest('https://example.test/api', {
      headers: { 'x-forwarded-for': '192.0.2.10' },
    });

    await expect(checkAndBumpDailyLimit(req, 'anthropic', null)).resolves.toEqual({
      limited: false,
      unavailable: true,
    });
  });

  it('fails closed for anonymous production requests without a trusted IP', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = new NextRequest('https://example.test/api');

    await expect(checkAndBumpDailyLimit(req, 'anthropic', null)).resolves.toEqual({
      limited: false,
      unavailable: true,
    });
    expect(rpc).not.toHaveBeenCalled();
  });
});
