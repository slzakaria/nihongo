import { createClient } from '@/lib/supabase/client'
import { dayKey } from '@/lib/activity/studyDays'

// Adds today to the user's study log. Duplicate days are ignored, so calling this often is cheap.
export async function recordStudyDay(userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('study_activity')
    .upsert({ user_id: userId, day: dayKey() }, { onConflict: 'user_id,day', ignoreDuplicates: true })
  if (error) console.error(error)
}

export async function fetchStudyDays(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('study_activity').select('day').eq('user_id', userId)
  if (error) console.error(error)
  return ((data ?? []) as { day: string }[]).map(row => row.day)
}
