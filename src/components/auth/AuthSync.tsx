'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAuthStore, type AppUser } from '@/store/auth'
import { useProgressStore } from '@/store/progress'
import { useOnboardingStore } from '@/store/onboarding'

// Records which account the device's saved data belongs to, so it can be cleared on sign-out
const OWNER_KEY = 'nihongo-owner'

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

  return null
}
