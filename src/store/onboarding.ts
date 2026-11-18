import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from '@/store/auth'
import { upsertProfile } from '@/lib/supabase/profile'

interface OnboardingStore {
  hasOnboarded: boolean
  userName: string
  avatarUrl: string | null
  // False while the profile is being loaded after sign-in, so the name prompt waits for the server copy. Not persisted.
  synced: boolean
  // Whether the user has already seen the profile-page introduction. Loaded from the server. Not persisted.
  profileIntroSeen: boolean
  // Whether the person has seen the feature tour after signing in. Loaded from the server. Not persisted.
  featureTourSeen: boolean
  completeOnboarding: (name: string) => void
  setUserName: (name: string) => void
  setAvatarUrl: (url: string | null) => void
  markProfileIntroSeen: () => void
  markFeatureTourSeen: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    set => ({
      hasOnboarded: false,
      userName: '',
      avatarUrl: null,
      synced: false,
      profileIntroSeen: false,
      featureTourSeen: false,
      completeOnboarding: name => {
        set({ hasOnboarded: true, userName: name })
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertProfile(userId, { user_name: name, has_onboarded: true })
      },
      setUserName: name => {
        set({ userName: name })
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertProfile(userId, { user_name: name })
      },
      setAvatarUrl: url => set({ avatarUrl: url }),
      markProfileIntroSeen: () => {
        set({ profileIntroSeen: true })
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertProfile(userId, { profile_intro_seen: true })
      },
      markFeatureTourSeen: () => {
        set({ featureTourSeen: true })
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertProfile(userId, { feature_tour_seen: true })
      },
    }),
    {
      name: 'nihongo-onboarding',
      partialize: ({ hasOnboarded, userName, avatarUrl }) => ({ hasOnboarded, userName, avatarUrl }),
    }
  )
)
