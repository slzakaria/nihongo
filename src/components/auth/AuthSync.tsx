'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAuthStore, type AppUser } from '@/store/auth'
import { useProgressStore } from '@/store/progress'
import { useOnboardingStore } from '@/store/onboarding'
import { dayKey } from '@/lib/activity/studyDays'

// Records which account the device's saved data belongs to, so it can be cleared on sign-out
const OWNER_KEY = 'nihongo-owner'
// Marks the last calendar day `last_sign_in_at` was refreshed for the current account, so a tab
// left open across a day boundary (or a Clerk session that silently stays alive for days without
// a fresh sign-in) still reports a genuinely current activity date instead of a stale one.
const ACTIVITY_SYNC_KEY = 'nihongo-last-active-sync'

// Clears this person's saved progress and profile from the device, so the next visitor doesn't see or upload it
function clearDeviceData() {
  useProgressStore.setState({ cards: {} })
  useOnboardingStore.setState({ hasOnboarded: false, userName: '', avatarUrl: null })
  localStorage.removeItem(OWNER_KEY)
}

// Mirrors the Clerk session into useAuthStore, then pulls/merges server progress for the signed-in person
export function AuthSync() {
  const { isLoaded, isSignedIn, user } = useUser()
  const userKey = isSignedIn && user ? user.id : null
  const email = user?.primaryEmailAddress?.emailAddress ?? null
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? null
  const externalId = user?.externalId ?? null
  const createdAt = user?.createdAt ? user.createdAt.toISOString() : null
  const lastSignInAt = user?.lastSignInAt ? user.lastSignInAt.toISOString() : null

  useEffect(() => {
    if (!isLoaded) return
    const owner = localStorage.getItem(OWNER_KEY)
    if (!userKey) {
      useAuthStore.getState().setUser(null)
      if (owner) clearDeviceData()
      return
    }
    if (owner && owner !== (externalId ?? userKey)) clearDeviceData()
    localStorage.setItem(OWNER_KEY, externalId ?? userKey)
    const appUser: AppUser = {
      id: externalId ?? userKey,
      email,
      phone,
      createdAt,
      lastSignInAt,
    }
    useAuthStore.getState().setUser(appUser)
    // Supabase code loads only for signed-in people, so guests never download it
    void import('@/lib/supabase/sync').then(m => m.hydrateOnSignIn(appUser.id))
    void import('@/lib/supabase/profile').then(m => m.syncAccountFields(appUser))
    // Only re-sync when the signed-in person or their details change
  }, [isLoaded, userKey, externalId, email, phone, createdAt, lastSignInAt])

  // Clerk's own `lastSignInAt` only changes on a fresh sign-in, so it can go stale for days if the
  // session itself stays alive that long (same issue the session-lifetime cap addresses) or the tab
  // is just left open. Touch `last_sign_in_at` once per calendar day — on mount and whenever the tab
  // regains focus — so Supabase keeps reflecting genuine recent activity either way.
  useEffect(() => {
    if (!userKey) return

    function touchActivity() {
      if (!userKey || document.visibilityState !== 'visible') return
      const id = userKey
      const marker = `${id}:${dayKey()}`
      if (localStorage.getItem(ACTIVITY_SYNC_KEY) === marker) return
      localStorage.setItem(ACTIVITY_SYNC_KEY, marker)
      void import('@/lib/supabase/profile').then(m => m.upsertProfile(id, { last_sign_in_at: new Date().toISOString() }))
    }

    touchActivity()
    document.addEventListener('visibilitychange', touchActivity)
    return () => document.removeEventListener('visibilitychange', touchActivity)
  }, [userKey])

  return null
}
