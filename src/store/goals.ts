import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/store/auth";
import type * as profileApi from "@/lib/supabase/profile";

// Supabase code loads on the first write, keeping it out of the first-paint bundle
const upsertProfile: typeof profileApi.upsertProfile = async (...args) =>
  (await import("@/lib/supabase/profile")).upsertProfile(...args);

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Monday-based ISO-ish week identifier, so "this week" always means the same calendar week
// regardless of which day it's checked on.
const weekKey = () => {
  const d = new Date();
  const mondayOffset = (d.getDay() + 6) % 7; // 0 = Monday ... 6 = Sunday
  const monday = new Date(d);
  monday.setDate(d.getDate() - mondayOffset);
  return `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
};

interface GoalsStore {
  dailyGoal: number;
  // Reviews counted for `day`. Resets when the local day changes.
  day: string;
  reviewedToday: number;
  weeklyGoal: number;
  // Reviews counted for `week`. Resets when the local Monday-based week changes.
  week: string;
  reviewedThisWeek: number;
  setDailyGoal: (goal: number) => void;
  setWeeklyGoal: (goal: number) => void;
  recordReview: () => void;
}

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      dailyGoal: 10,
      day: todayKey(),
      reviewedToday: 0,
      weeklyGoal: 50,
      week: weekKey(),
      reviewedThisWeek: 0,
      setDailyGoal: (goal) =>
        set({ dailyGoal: Math.max(1, Math.min(200, Math.round(goal))) }),
      setWeeklyGoal: (goal) => {
        const value = Math.max(1, Math.min(1000, Math.round(goal)));
        set({ weeklyGoal: value });
        const userId = useAuthStore.getState().user?.id;
        if (userId) void upsertProfile(userId, { weekly_goal: value });
      },
      recordReview: () => {
        const today = todayKey();
        const thisWeek = weekKey();
        const { day, reviewedToday, week, reviewedThisWeek } = get();
        set({
          day: today,
          reviewedToday: day === today ? reviewedToday + 1 : 1,
          week: thisWeek,
          reviewedThisWeek: week === thisWeek ? reviewedThisWeek + 1 : 1,
        });
      },
    }),
    { name: "nihongo-goals" },
  ),
);

// Reviews counted for today (0 if the stored day is stale)
export function reviewsToday(
  state: Pick<GoalsStore, "day" | "reviewedToday">,
): number {
  return state.day === todayKey() ? state.reviewedToday : 0;
}

// Reviews counted for this week (0 if the stored week is stale)
export function reviewsThisWeek(
  state: Pick<GoalsStore, "week" | "reviewedThisWeek">,
): number {
  return state.week === weekKey() ? state.reviewedThisWeek : 0;
}
