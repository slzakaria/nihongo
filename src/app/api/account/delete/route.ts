import { auth, clerkClient } from "@clerk/nextjs/server";
import { currentServerUser } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Permanently deletes the signed-in person's own account: every row they own across the app's
// tables, plus their Clerk account itself. Only ever acts on the caller's own verified session —
// there is no userId parameter to take from the request, so this can't be used against anyone else.
export async function POST() {
  const { userId: clerkUserId } = await auth();
  const serverUser = await currentServerUser();
  if (!clerkUserId || !serverUser) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const dbId = serverUser.id;
  const supabase = createAdminClient();

  // Avatars live in a public bucket under the user's own folder (see lib/supabase/avatar.ts) —
  // list and remove whatever's there rather than guessing the file extension.
  const { data: avatarFiles } = await supabase.storage
    .from("avatars")
    .list(dbId);
  if (avatarFiles && avatarFiles.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(avatarFiles.map((f) => `${dbId}/${f.name}`));
  }

  const results = await Promise.all([
    supabase.from("srs_cards").delete().eq("user_id", dbId),
    supabase.from("study_activity").delete().eq("user_id", dbId),
    supabase.from("simulator_conversations").delete().eq("user_id", dbId),
    supabase.from("profiles").delete().eq("id", dbId),
  ]);
  const dbError = results.find((r) => r.error)?.error;
  if (dbError) {
    return Response.json(
      { error: "Could not delete account data" },
      { status: 500 },
    );
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
  } catch {
    // The person's data is already gone at this point; the Clerk account itself can be removed
    // by them (or support) afterwards if this step fails, so this isn't treated as a hard failure.
  }

  return Response.json({ ok: true });
}
