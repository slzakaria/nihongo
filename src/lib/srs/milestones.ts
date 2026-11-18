import type { SRSCard } from '@/types'

export const MILESTONES = [50, 100] as const

// Phrase reviews only. Kana cards are stored with a `kana:` scenario prefix and don't count towards milestones.
export function countReviewedPhrases(cards: SRSCard[]): number {
  return cards.filter(c => c.lastReview !== null && !c.scenarioSlug.startsWith('kana:')).length
}

// The highest milestone reached that has not been celebrated yet, or null
export function newMilestone(reviewed: number, celebrated: number): number | null {
  const reached = MILESTONES.filter(m => reviewed >= m && m > celebrated)
  return reached.length > 0 ? reached[reached.length - 1] : null
}
