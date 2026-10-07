'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { hydrateOnSignIn } from '@/lib/supabase/sync'

// Mirrors the Supabase session into useAuthStore and pulls/merges server progress on sign-in
export function AuthSync() {
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      useAuthStore.getState().setUser(data.user)
      if (data.user) void hydrateOnSignIn(data.user.id)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      useAuthStore.getState().setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' && session?.user) void hydrateOnSignIn(session.user.id)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return null
}
