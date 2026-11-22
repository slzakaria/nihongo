import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
  currentServerUser: vi.fn(),
  rpc: vi.fn(),
  list: vi.fn(),
  remove: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: mocks.auth,
  clerkClient: mocks.clerkClient,
}));

vi.mock('@/lib/auth/server', () => ({
  currentServerUser: mocks.currentServerUser,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: mocks.rpc,
    storage: {
      from: () => ({ list: mocks.list, remove: mocks.remove }),
    },
  }),
}));

import { POST } from '@/app/api/account/delete/route';

describe('POST /api/account/delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RATE_LIMIT_SECRET = 'test-rate-limit-secret';
    mocks.auth.mockResolvedValue({ userId: 'clerk-user-1' });
    mocks.currentServerUser.mockResolvedValue({
      id: 'database-user-1',
      token: 'verified-token',
    });
    mocks.list.mockResolvedValue({ data: [], error: null });
    mocks.remove.mockResolvedValue({ data: [], error: null });
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    mocks.clerkClient.mockResolvedValue({
      users: { deleteUser: mocks.deleteUser },
    });
    mocks.deleteUser.mockResolvedValue({});
  });

  it('deletes all database-owned records before removing the Clerk user', async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith(
      'delete_account_data',
      expect.objectContaining({
        p_user_id: 'database-user-1',
        p_rate_limit_identity_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
      }),
    );
    expect(mocks.deleteUser).toHaveBeenCalledWith('clerk-user-1');
  });

  it('does not claim success if app data cannot be deleted', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: new Error('database unavailable'),
    });

    const response = await POST();

    expect(response.status).toBe(500);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('reports a retryable failure if Clerk deletion fails after app data is removed', async () => {
    mocks.deleteUser.mockRejectedValueOnce(new Error('Clerk unavailable'));

    const response = await POST();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('sign-in removal failed'),
    });
  });
});
