import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from '@/store/auth'
import type * as profileApi from '@/lib/supabase/profile'

// Supabase code loads on the first write, keeping it out of the first-paint bundle
const upsertProfile: typeof profileApi.upsertProfile = async (...args) =>
  (await import('@/lib/supabase/profile')).upsertProfile(...args)

// Tracks which badges have already been celebrated (toasted) so each one only fires once, ever.
// Separate from useGoalsStore since badges now span several independent categories rather than
// a single linear "highest milestone reached" number.
interface BadgesStore {
  celebrated: Record<string, true>
  markCelebrated: (id: string) => void
}

export const useBadgesStore = create<BadgesStore>()(
  persist(
    (set, get) => ({
      celebrated: {},
      markCelebrated: id => {
        if (get().celebrated[id]) return
        const celebrated = { ...get().celebrated, [id]: true }
        set({ celebrated })
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertProfile(userId, { celebrated_badges: Object.keys(celebrated) })
      },
    }),
    { name: 'nihongo-badges' }
  )
)
