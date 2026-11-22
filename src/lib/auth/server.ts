import { auth } from "@clerk/nextjs/server";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export interface ServerUser {
  // Database ID: the Supabase ID for migrated users, the Clerk ID for new ones
  id: string;
  token: string;
}

// Reads the verified Clerk session on the server. Returns null for guests.
export async function currentServerUser(): Promise<ServerUser | null> {
  const { userId, getToken } = await auth();
  if (!userId) return null;
  const token = await getToken({ template: "supabase" });
  if (!token) return null;
  // The token was just issued by Clerk for this request, so its `db_id` claim can be read without re-verifying
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
  ) as { db_id?: string };
  if (!payload.db_id) return null;
  return { id: payload.db_id, token };
}

// Supabase client that acts as the given user, so row-level security applies to their rows only
export function serverSupabase(user: ServerUser): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => user.token,
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
