import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/store/auth';
import type * as profileApi from '@/lib/supabase/profile';

// Supabase code loads on the first write, keeping it out of the first-paint bundle
const upsertProfile: typeof profileApi.upsertProfile = async (...args) =>
  (await import('@/lib/supabase/profile')).upsertProfile(...args);

// Tracks which badges have already been celebrated (toasted) so each one only fires once, ever.
// Separate from useGoalsStore since badges now span several independent categories rather than
// a single linear "highest milestone reached" number.
interface BadgesStore {
  celebrated: Record<string, true>;
  pendingCelebrations: string[];
  enqueueCelebrations: (ids: string[]) => boolean;
  dequeueCelebration: () => void;
}

export const useBadgesStore = create<BadgesStore>()(
  persist(
    (set, get) => ({
      celebrated: {},
      pendingCelebrations: [],
      enqueueCelebrations: (ids) => {
        const state = get();
        const newIds = ids.filter((id) => !state.celebrated[id]);
        if (newIds.length === 0) return false;
        const celebrated = {
          ...state.celebrated,
          ...Object.fromEntries(newIds.map((id) => [id, true as const])),
        };
        set({
          celebrated,
          pendingCelebrations: [...state.pendingCelebrations, ...newIds],
        });
        const userId = useAuthStore.getState().user?.id;
        if (userId)
          void upsertProfile(userId, {
            celebrated_badges: Object.keys(celebrated),
          });
        return true;
      },
      dequeueCelebration: () =>
        set((state) => ({
          pendingCelebrations: state.pendingCelebrations.slice(1),
        })),
    }),
    {
      name: 'nihongo-badges',
      partialize: (state) => ({ celebrated: state.celebrated }),
    },
  ),
);
