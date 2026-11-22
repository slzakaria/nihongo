import { createClient } from '@/lib/supabase/client';
import { dayKey } from '@/lib/activity/studyDays';

// Adds study dates to the user's log. Duplicate days are ignored, so retries are safe.
export async function recordStudyDays(userId: string, days: string[]) {
  if (days.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.from('study_activity').upsert(
    [...new Set(days)].map((day) => ({ user_id: userId, day })),
    { onConflict: 'user_id,day', ignoreDuplicates: true },
  );
  if (error) throw error;
}

// Adds today to the user's study log. Kept for non-queue activity paths.
export async function recordStudyDay(userId: string) {
  await recordStudyDays(userId, [dayKey()]);
}

export async function fetchStudyDays(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('study_activity')
    .select('day')
    .eq('user_id', userId);
  if (error) console.error(error);
  return ((data ?? []) as { day: string }[]).map((row) => row.day);
}
