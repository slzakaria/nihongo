import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
}

// Mirrors the current Supabase session; kept by AuthSync, read by stores to decide whether to sync
export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  setUser: user => set({ user }),
}))
