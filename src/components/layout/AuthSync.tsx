'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { hydrateOnSignIn } from '@/lib/supabase/sync'
import { syncAccountFields } from '@/lib/supabase/profile'
import { isSessionExpired, readSignedInAt } from '@/lib/auth/session'

const SESSION_CHECK_INTERVAL_MS = 60 * 1000

// Mirrors the Supabase session into useAuthStore and pulls/merges server progress on sign-in
export function AuthSync() {
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      useAuthStore.getState().setUser(data.user)
      if (data.user) {
        void hydrateOnSignIn(data.user.id)
        void syncAccountFields(data.user)
      }
    })

    // Tabs left open past the limit get signed out here; page loads are covered by the middleware
    async function enforceSessionLimit() {
      const { data } = await supabase.auth.getSession()
      if (data.session && isSessionExpired(readSignedInAt())) {
        await supabase.auth.signOut()
      }
    }
    void enforceSessionLimit()
    const timer = setInterval(enforceSessionLimit, SESSION_CHECK_INTERVAL_MS)

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      useAuthStore.getState().setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' && session?.user) void hydrateOnSignIn(session.user.id)
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        void syncAccountFields(session.user)
      }
    })

    return () => {
      clearInterval(timer)
      sub.subscription.unsubscribe()
    }
  }, [])

  return null
}
