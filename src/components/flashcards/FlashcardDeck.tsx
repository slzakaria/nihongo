'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/flashcards/ProgressBar'
import { FlashcardFace } from '@/components/flashcards/FlashcardFace'
import { useFlashcardSession } from '@/hooks/useFlashcardSession'
import { useProgressStore } from '@/store/progress'

export function FlashcardDeck({ slug }: { slug: string }) {
  const initScenario = useProgressStore(s => s.initScenario)
  const [force, setForce] = useState(false)

  useEffect(() => {
    initScenario(slug)
  }, [slug, initScenario])

  const { phrase, showBack, setShowBack, grade, total, currentIndex, done } =
    useFlashcardSession(slug, force)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-lg font-medium">Nothing due right now</p>
        <p className="text-sm text-muted-foreground">
          Cards come back for review as their interval elapses — or practice them all now.
        </p>
        <Button variant="secondary" onClick={() => setForce(true)}>
          Practice anyway
        </Button>
      </div>
    )
  }

  if (done || !phrase) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-lg font-medium">Session complete 🎉</p>
        <p className="text-sm text-muted-foreground">You reviewed {total} card(s).</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar current={currentIndex} total={total} />

      <FlashcardFace phrase={phrase} showBack={showBack} onFlip={() => setShowBack(v => !v)} />

      {showBack && (
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => grade(0)}>
            Again
          </Button>
          <Button variant="outline" onClick={() => grade(3)}>
            Hard
          </Button>
          <Button variant="secondary" onClick={() => grade(4)}>
            Good
          </Button>
          <Button onClick={() => grade(5)}>Easy</Button>
        </div>
      )}
    </div>
  )
}
