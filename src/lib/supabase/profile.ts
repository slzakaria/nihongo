import { createClient } from '@/lib/supabase/client'
import { RomajiMode } from '@/types'

export interface ProfileRow {
  id: string
  user_name: string | null
  has_onboarded: boolean
  romaji_mode: RomajiMode
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) console.error(error)
  return data as ProfileRow | null
}

export async function upsertProfile(userId: string, fields: Partial<Omit<ProfileRow, 'id'>>) {
  const supabase = createClient()
  const { error } = await supabase.from('profiles').upsert({ id: userId, ...fields })
  if (error) console.error(error)
}
