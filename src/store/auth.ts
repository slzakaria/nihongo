import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  // False until the first session check finishes, so UI doesn't treat "still loading" as "signed out"
  loaded: boolean
  setUser: (user: User | null) => void
}

// Mirrors the current Supabase session; kept by AuthSync, read by stores to decide whether to sync
export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  loaded: false,
  setUser: user => set({ user, loaded: true }),
}))
