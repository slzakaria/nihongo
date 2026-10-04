import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RomajiMode } from '@/types'

interface SettingsStore {
  romajiMode: RomajiMode
  setRomajiMode: (mode: RomajiMode) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      romajiMode: 'always',
      setRomajiMode: mode => set({ romajiMode: mode }),
    }),
    { name: 'nihongo-settings' }
  )
)
