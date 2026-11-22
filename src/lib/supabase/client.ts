import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

interface ClerkGlobal {
  session?: {
    getToken: (options: { template: string }) => Promise<string | null>;
  };
}

// Clerk's session is exposed on window once its browser SDK loads. The `supabase` JWT template must include the
// `db_id` claim used by Supabase row-level security to identify the signed-in person's database ID.
async function clerkSupabaseToken(): Promise<string | null> {
  const clerk = (window as unknown as { Clerk?: ClerkGlobal }).Clerk;
  if (!clerk?.session) return null;
  try {
    return await clerk.session.getToken({ template: 'supabase' });
  } catch {
    return null;
  }
}

let client: SupabaseClient | null = null;

// One shared client. Auth is handled by Clerk, so Supabase does not store or refresh a session of its own.
export function createClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        accessToken: clerkSupabaseToken,
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return client;
}
