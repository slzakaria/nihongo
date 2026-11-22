import { auth, clerkClient } from '@clerk/nextjs/server';
import { currentServerUser } from '@/lib/auth/server';
import { accountRateLimitHash } from '@/lib/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

// Permanently deletes the signed-in person's own account: every row they own across the app's
// tables, plus their Clerk account itself. Only ever acts on the caller's own verified session —
// there is no userId parameter to take from the request, so this can't be used against anyone else.
export async function POST() {
  const { userId: clerkUserId } = await auth();
  const serverUser = await currentServerUser();
  if (!clerkUserId || !serverUser) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  const dbId = serverUser.id;
  const supabase = createAdminClient();

  while (true) {
    const { data: avatarFiles, error: listError } = await supabase.storage
      .from('avatars')
      .list(dbId, { limit: 100 });
    if (listError) {
      console.error('Could not list account avatars', listError);
      return Response.json(
        { error: 'Could not delete account data. Please retry.' },
        { status: 500 },
      );
    }
    if (!avatarFiles?.length) break;

    const { error: removeError } = await supabase.storage
      .from('avatars')
      .remove(avatarFiles.map((file) => `${dbId}/${file.name}`));
    if (removeError) {
      console.error('Could not remove account avatars', removeError);
      return Response.json(
        { error: 'Could not delete account data. Please retry.' },
        { status: 500 },
      );
    }
  }

  const { error: databaseError } = await supabase.rpc('delete_account_data', {
    p_user_id: dbId,
    p_rate_limit_identity_hash: accountRateLimitHash(dbId),
  });
  if (databaseError) {
    console.error('Could not delete account database records', databaseError);
    return Response.json(
      { error: 'Could not delete account data. Please retry.' },
      { status: 500 },
    );
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
  } catch (error) {
    console.error('Could not delete Clerk account', error);
    return Response.json(
      {
        error: 'Your app data was deleted, but sign-in removal failed. Please retry.',
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
