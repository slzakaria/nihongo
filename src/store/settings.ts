import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RomajiMode, TtsSpeed } from '@/types'
import { useAuthStore } from '@/store/auth'
import type * as profileApi from '@/lib/supabase/profile'

// Supabase code loads on the first write, keeping it out of the first-paint bundle
const upsertProfile: typeof profileApi.upsertProfile = async (...args) =>
  (await import('@/lib/supabase/profile')).upsertProfile(...args)

interface SettingsStore {
  romajiMode: RomajiMode
  setRomajiMode: (mode: RomajiMode) => void
  ttsSpeed: TtsSpeed
  setTtsSpeed: (speed: TtsSpeed) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      romajiMode: 'always',
      setRomajiMode: mode => {
        set({ romajiMode: mode })
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertProfile(userId, { romaji_mode: mode })
      },
      ttsSpeed: 1,
      setTtsSpeed: speed => set({ ttsSpeed: speed }),
    }),
    { name: 'nihongo-settings' }
  )
)
