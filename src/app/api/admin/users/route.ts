import { currentUser } from '@clerk/nextjs/server';
import { isAdminEmail } from '@/lib/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildAdminMetrics } from '@/lib/adminMetrics';
import type { SRSGrade } from '@/types';
import phrasesRaw from '@/lib/data/phrases.json';

export type { AdminDashboardSummary, AdminUserRow } from '@/lib/adminMetrics';

interface ReviewEventRecord {
  user_id: string;
  rating: SRSGrade;
}

const ADMIN_QUERY_PAGE_SIZE = 1000;

interface PageResult<T> {
  data: T[] | null;
  error: unknown;
}

async function fetchAllPages<T>(
  fetchPage: (start: number, end: number) => PromiseLike<PageResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let start = 0; ; start += ADMIN_QUERY_PAGE_SIZE) {
    const { data, error } = await fetchPage(start, start + ADMIN_QUERY_PAGE_SIZE - 1);
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < ADMIN_QUERY_PAGE_SIZE) return rows;
  }
}

// Admin-only: aggregated account and learning activity for the owner's dashboard.
// The email check is repeated server-side; the client cannot claim to be the admin.
export async function GET() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  if (!isAdminEmail(email)) {
    return Response.json({ error: 'Not authorized' }, { status: 403 });
  }

  const supabase = createAdminClient();
  type MetricsInput = Parameters<typeof buildAdminMetrics>[0];
  let rows: [
    MetricsInput['profiles'],
    MetricsInput['cards'],
    MetricsInput['scenarioProgress'],
    MetricsInput['studyDays'],
    MetricsInput['conversations'],
    MetricsInput['bookmarks'],
    ReviewEventRecord[],
  ];
  try {
    rows = await Promise.all([
      fetchAllPages<MetricsInput['profiles'][number]>((start, end) =>
        supabase
          .from('profiles')
          .select('id, user_name, email, created_at, last_sign_in_at')
          .order('id')
          .range(start, end),
      ),
      fetchAllPages<MetricsInput['cards'][number]>((start, end) =>
        supabase
          .from('srs_cards')
          .select(
            'user_id, scenario_slug, interval, next_review, last_review, total_reviews, correct_reviews',
          )
          .order('user_id')
          .order('phrase_id')
          .range(start, end),
      ),
      fetchAllPages<MetricsInput['scenarioProgress'][number]>((start, end) =>
        supabase
          .from('scenario_phrase_progress')
          .select('user_id, scenario_slug, phrase_id')
          .order('user_id')
          .order('phrase_id')
          .range(start, end),
      ),
      fetchAllPages<MetricsInput['studyDays'][number]>((start, end) =>
        supabase
          .from('study_activity')
          .select('user_id, day')
          .order('user_id')
          .order('day')
          .range(start, end),
      ),
      fetchAllPages<MetricsInput['conversations'][number]>((start, end) =>
        supabase
          .from('simulator_conversations')
          .select('user_id, scenario_slug, messages')
          .order('user_id')
          .order('scenario_slug')
          .range(start, end),
      ),
      fetchAllPages<MetricsInput['bookmarks'][number]>((start, end) =>
        supabase
          .from('phrase_bookmarks')
          .select('user_id')
          .order('user_id')
          .order('phrase_id')
          .range(start, end),
      ),
      fetchAllPages<ReviewEventRecord>((start, end) =>
        supabase
          .from('srs_review_events')
          .select('user_id, rating')
          .order('id')
          .range(start, end),
      ),
    ]);
  } catch (error) {
    console.error('Could not load admin learning analytics', error);
    return Response.json({ error: 'Could not load users' }, { status: 500 });
  }

  const [
    profiles,
    cards,
    scenarioProgress,
    studyRows,
    conversations,
    bookmarks,
    reviewEvents,
  ] = rows;

  const result = buildAdminMetrics({
    profiles,
    cards,
    scenarioProgress,
    studyDays: studyRows,
    conversations,
    bookmarks,
    reviewEvents,
    scenarios: phrasesRaw.scenarios.map((scenario) => ({
      slug: scenario.slug,
      label: scenario.label,
      phraseCount: scenario.phrases.length,
    })),
  });

  result.users.sort((a, b) => (b.lastSignInAt ?? '').localeCompare(a.lastSignInAt ?? ''));
  return Response.json(result);
}
