'use client'

import { useEffect, useState } from 'react'
import { useProgressStore } from '@/store/progress'
import { useGoalsStore } from '@/store/goals'
import { countReviewedPhrases, newMilestone } from '@/lib/srs/milestones'

// Celebrates each milestone (50, 100 phrases) once, with confetti and a short message
export function MilestoneWatcher() {
  const cards = useProgressStore(s => s.cards)
  const celebrated = useGoalsStore(s => s.celebratedMilestone)
  const markCelebrated = useGoalsStore(s => s.markMilestoneCelebrated)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const milestone = newMilestone(countReviewedPhrases(Object.values(cards)), celebrated)
    if (milestone === null) return
    markCelebrated(milestone)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(`🎉 ${milestone} phrases reviewed!`)
    void import('canvas-confetti').then(({ default: confetti }) =>
      confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 } })
    )
  }, [cards, celebrated, markCelebrated])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div className="animate-scale-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-lg">
      {message}
    </div>
  )
}
