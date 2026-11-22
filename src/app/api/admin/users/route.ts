import { currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeStudyStats, dayKey } from "@/lib/activity/studyDays";
import phrasesRaw from "@/lib/data/phrases.json";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  phrasesReviewed: number;
  studyStreak: number;
  studyDays: number;
  conversations: number;
  // Labels of scenarios reviewed to 100% — scenarios and flashcards share the same underlying
  // review data, so this one count covers completion from either surface.
  completedScenarios: string[];
}

// Total phrase count per scenario, so "100% reviewed" can be checked per user per scenario
const SCENARIO_TOTALS = new Map(
  phrasesRaw.scenarios.map((s) => [s.slug, s.phrases.length]),
);
const SCENARIO_LABELS = new Map(
  phrasesRaw.scenarios.map((s) => [s.slug, s.label]),
);

// Admin-only: every signed-up person's profile, activity and progress, for the owner's dashboard
// in /profile. The email check here is the real security boundary — it re-derives the caller's
// address from their verified Clerk session, so a client can't just claim to be the admin.
export async function GET() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  if (!isAdminEmail(email)) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const supabase = createAdminClient();

  const [
    { data: profiles, error: profilesError },
    { data: cards },
    { data: studyRows },
    { data: conversations },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, user_name, email, created_at, last_sign_in_at"),
    supabase.from("srs_cards").select("user_id, scenario_slug, last_review"),
    supabase.from("study_activity").select("user_id, day"),
    supabase.from("simulator_conversations").select("user_id"),
  ]);

  if (profilesError) {
    return Response.json({ error: "Could not load users" }, { status: 500 });
  }

  const reviewedByUser = new Map<string, number>();
  // user_id -> scenario_slug -> reviewed count, to work out per-scenario completion below
  const reviewedByUserScenario = new Map<string, Map<string, number>>();
  for (const c of cards ?? []) {
    if (!c.last_review) continue;
    reviewedByUser.set(c.user_id, (reviewedByUser.get(c.user_id) ?? 0) + 1);
    const byScenario =
      reviewedByUserScenario.get(c.user_id) ?? new Map<string, number>();
    byScenario.set(c.scenario_slug, (byScenario.get(c.scenario_slug) ?? 0) + 1);
    reviewedByUserScenario.set(c.user_id, byScenario);
  }

  function completedScenarios(userId: string): string[] {
    const byScenario = reviewedByUserScenario.get(userId);
    if (!byScenario) return [];
    const labels: string[] = [];
    for (const [slug, count] of byScenario) {
      const total = SCENARIO_TOTALS.get(slug);
      if (total && count >= total)
        labels.push(SCENARIO_LABELS.get(slug) ?? slug);
    }
    return labels;
  }

  const daysByUser = new Map<string, string[]>();
  for (const row of studyRows ?? []) {
    const list = daysByUser.get(row.user_id) ?? [];
    list.push(row.day);
    daysByUser.set(row.user_id, list);
  }

  const conversationsByUser = new Map<string, number>();
  for (const row of conversations ?? []) {
    conversationsByUser.set(
      row.user_id,
      (conversationsByUser.get(row.user_id) ?? 0) + 1,
    );
  }

  const today = dayKey();
  const users: AdminUserRow[] = (profiles ?? []).map((p) => {
    const study = computeStudyStats(daysByUser.get(p.id) ?? [], today);
    return {
      id: p.id,
      name: p.user_name || null,
      email: p.email,
      createdAt: p.created_at,
      lastSignInAt: p.last_sign_in_at,
      phrasesReviewed: reviewedByUser.get(p.id) ?? 0,
      studyStreak: study.streak,
      studyDays: study.total,
      conversations: conversationsByUser.get(p.id) ?? 0,
      completedScenarios: completedScenarios(p.id),
    };
  });

  // Most recently active first
  users.sort((a, b) =>
    (b.lastSignInAt ?? "").localeCompare(a.lastSignInAt ?? ""),
  );

  return Response.json({ users });
}
