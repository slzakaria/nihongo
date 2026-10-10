'use client'

import { Phrase } from '@/types'
import { AudioButton } from '@/components/phrases/AudioButton'
import { useSettingsStore } from '@/store/settings'
import { cn } from '@/lib/utils'

export function FlashcardFace({
  phrase,
  showBack,
  onFlip,
}: {
  phrase: Phrase
  showBack: boolean
  onFlip: () => void
}) {
  const romajiMode = useSettingsStore(s => s.romajiMode)
  const showRomaji = romajiMode === 'always' || romajiMode === 'reveal'

  return (
    <div
      onClick={onFlip}
      className="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-8 text-center shadow-sm"
    >
      {!showBack ? (
        <p className="text-xl font-medium">{phrase.english}</p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <p lang="ja" className="text-2xl font-medium">
              {phrase.japanese}
            </p>
            <span onClick={e => e.stopPropagation()}>
              <AudioButton text={phrase.japanese} />
            </span>
          </div>
          {showRomaji && phrase.kanji && (
            <p lang="ja" className="text-sm text-muted-foreground">
              {phrase.kanji}
            </p>
          )}
          {showRomaji && <p className="text-sm text-muted-foreground">{phrase.romaji}</p>}
          <p className="text-sm text-muted-foreground">{phrase.english}</p>
          {phrase.notes && (
            <p className={cn('mt-2 max-w-sm text-xs text-muted-foreground')}>{phrase.notes}</p>
          )}
        </div>
      )}
      {!showBack && <p className="text-xs text-muted-foreground">Tap to reveal</p>}
    </div>
  )
}
