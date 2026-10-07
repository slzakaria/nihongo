import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client for server-only jobs (e.g. the due-reminders cron) that must
// read across all users — bypasses RLS, so this must never be imported client-side.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
