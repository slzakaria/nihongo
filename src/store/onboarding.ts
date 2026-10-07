import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from '@/store/auth'
import { upsertProfile } from '@/lib/supabase/profile'

interface OnboardingStore {
  hasOnboarded: boolean
  userName: string
  completeOnboarding: (name: string) => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    set => ({
      hasOnboarded: false,
      userName: '',
      completeOnboarding: name => {
        set({ hasOnboarded: true, userName: name })
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertProfile(userId, { user_name: name, has_onboarded: true })
      },
    }),
    { name: 'nihongo-onboarding' }
  )
)
