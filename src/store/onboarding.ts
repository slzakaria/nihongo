import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      completeOnboarding: name => set({ hasOnboarded: true, userName: name }),
    }),
    { name: 'nihongo-onboarding' }
  )
)
