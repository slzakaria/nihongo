import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const todayKey = () => {  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

interface GoalsStore {
  dailyGoal: number
  // Reviews counted for `day`. Resets when the local day changes.
  day: string
  reviewedToday: number
  // Highest milestone whose celebration has already been shown
  celebratedMilestone: number
  setDailyGoal: (goal: number) => void
  recordReview: () => void
  markMilestoneCelebrated: (milestone: number) => void
}

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      dailyGoal: 10,
      day: todayKey(),
      reviewedToday: 0,
      celebratedMilestone: 0,
      setDailyGoal: goal => set({ dailyGoal: Math.max(1, Math.min(200, Math.round(goal))) }),
      recordReview: () => {
        const today = todayKey()
        const { day, reviewedToday } = get()
        set({ day: today, reviewedToday: day === today ? reviewedToday + 1 : 1 })
      },
      markMilestoneCelebrated: milestone => set({ celebratedMilestone: milestone }),
    }),
    { name: 'nihongo-goals' }
  )
)

// Reviews counted for today (0 if the stored day is stale)
export function reviewsToday(state: Pick<GoalsStore, 'day' | 'reviewedToday'>): number {
  return state.day === todayKey() ? state.reviewedToday : 0
}
