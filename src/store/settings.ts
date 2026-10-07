import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RomajiMode } from '@/types'
import { useAuthStore } from '@/store/auth'
import { upsertProfile } from '@/lib/supabase/profile'

interface SettingsStore {
  romajiMode: RomajiMode
  setRomajiMode: (mode: RomajiMode) => void
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
    }),
    { name: 'nihongo-settings' }
  )
)
