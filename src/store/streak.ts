import { create } from "zustand";

// Streak-freeze date, synced to the `profiles.streak_freeze_until` column (see hydrateOnSignIn)
// rather than persisted locally — it's a single small setting with no local-only history to lose,
// so there's no need for a merge step the way SRS cards have.
interface StreakStore {
  freezeUntil: string | null;
  setFreezeUntil: (date: string | null) => void;
}

export const useStreakStore = create<StreakStore>()((set) => ({
  freezeUntil: null,
  setFreezeUntil: (date) => set({ freezeUntil: date }),
}));
