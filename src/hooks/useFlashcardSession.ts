'use client'

import { useMemo, useState } from 'react'
import { Phrase, SRSGrade } from '@/types'
import { useProgressStore } from '@/store/progress'
import { useContentStore } from '@/lib/data/content'

export function useFlashcardSession(slug: string, force = false) {
  const scenario = useContentStore(s => s.content.phrases.find(x => x.slug === slug))
  const phrases = useMemo(() => scenario?.phrases ?? [], [scenario])
  const cards = useProgressStore(s => s.cards)
  const gradeCard = useProgressStore(s => s.gradeCard)

  const [now] = useState(() => Date.now())
  const dueCards = useMemo(() => {
    return phrases
      .map(p => cards[p.id])
      .filter((c): c is NonNullable<typeof c> => !!c && (force || c.nextReview <= now))
  }, [phrases, cards, now, force])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)

  const currentCard = dueCards[currentIndex]
  const currentPhrase: Phrase | undefined = currentCard
    ? phrases.find(p => p.id === currentCard.phraseId)
    : undefined

  function grade(score: SRSGrade) {
    if (!currentCard) return
    gradeCard(currentCard.phraseId, score)
    setShowBack(false)
    setCurrentIndex(i => i + 1)
  }

  return {
    phrase: currentPhrase,
    showBack,
    setShowBack,
    grade,
    total: dueCards.length,
    currentIndex,
    done: currentIndex >= dueCards.length,
  }
}
