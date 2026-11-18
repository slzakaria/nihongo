import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { RomajiMode } from '@/types'

export interface ProfileRow {
  id: string
  user_name: string | null
  avatar_url: string | null
  email: string | null
  phone: string | null
  last_sign_in_at: string | null
  profile_intro_seen: boolean
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

// Mirrors the account details that live in Supabase Auth, so they are also visible on the profiles table
export async function syncAccountFields(user: User) {
  await upsertProfile(user.id, {
    email: user.email ?? null,
    phone: user.phone ? `+${user.phone.replace(/^\+/, '')}` : null,
    last_sign_in_at: user.last_sign_in_at ?? null,
  })
}
