'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Phrase } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AudioButton } from '@/components/phrases/AudioButton'
import { useSettingsStore } from '@/store/settings'
import { useProgressStore } from '@/store/progress'
import { cn } from '@/lib/utils'

export function PhraseCard({ phrase }: { phrase: Phrase }) {
  const romajiMode = useSettingsStore(s => s.romajiMode)
  const markReviewed = useProgressStore(s => s.markReviewed)
  const [revealed, setRevealed] = useState(false)
  const [showResponses, setShowResponses] = useState(false)

  const showRomaji = romajiMode === 'always' || (romajiMode === 'reveal' && revealed)

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => romajiMode === 'reveal' && setRevealed(r => !r)}
          >
            <p lang="ja" className="text-xl font-medium">
              {phrase.japanese}
            </p>
            {romajiMode !== 'never' && (
              <p className={cn('text-sm text-muted-foreground', !showRomaji && 'opacity-0 select-none')}>
                {phrase.romaji}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{phrase.english}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={phrase.difficulty === 'core' ? 'default' : 'secondary'}>
              {phrase.difficulty}
            </Badge>
            <AudioButton text={phrase.japanese} onPlay={() => markReviewed(phrase.id)} />
          </div>
        </div>

        {phrase.notes && <p className="text-xs text-muted-foreground">{phrase.notes}</p>}

        {phrase.responses.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => {
                setShowResponses(s => !s)
                markReviewed(phrase.id)
              }}
              aria-expanded={showResponses}
              className="flex items-center gap-1 text-xs font-medium text-primary-foreground dark:text-secondary"
            >
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showResponses && 'rotate-180')} />
              Possible responses ({phrase.responses.length})
            </button>
            {showResponses && (
              <ul className="mt-2 flex flex-col gap-2 border-l-2 border-border pl-3">
                {phrase.responses.map((r, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p lang="ja" className="text-sm font-medium">
                        {r.japanese}
                      </p>
                      <AudioButton text={r.japanese} className="h-8 w-8 shrink-0" />
                    </div>
                    {showRomaji && <p className="text-xs text-muted-foreground">{r.romaji}</p>}
                    <p className="text-xs text-muted-foreground">{r.english}</p>
                    <p className="text-xs italic text-muted-foreground">{r.listen_for}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
