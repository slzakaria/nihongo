'use client';

import { useState } from 'react';
import { Bookmark, ChevronDown } from 'lucide-react';
import { Phrase } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AudioButton } from '@/components/phrases/AudioButton';
import { WordLookup } from '@/components/phrases/WordLookup';
import { useSettingsStore } from '@/store/settings';
import { useProgressStore } from '@/store/progress';
import { useBookmarkStore } from '@/store/bookmarks';
import { cn } from '@/lib/utils';

export function PhraseCard({ phrase }: { phrase: Phrase }) {
  const romajiMode = useSettingsStore((s) => s.romajiMode);
  const markReviewed = useProgressStore((s) => s.markReviewed);
  const isBookmarked = useBookmarkStore((s) => s.phraseIds.includes(phrase.id));
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const [revealed, setRevealed] = useState(false);

  const showRomaji = romajiMode === 'always' || (romajiMode === 'reveal' && revealed);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="order-2 w-full truncate text-base font-semibold text-foreground sm:order-1 sm:w-auto sm:flex-1">
            {phrase.english}
          </h3>
          <div className="order-1 flex shrink-0 items-center gap-2 sm:order-2">
            <Badge
              variant={phrase.difficulty === 'easy' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {phrase.difficulty}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8 cursor-pointer', isBookmarked && 'text-primary')}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark phrase'}
              aria-pressed={isBookmarked}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark phrase'}
              onClick={() => toggleBookmark(phrase.id)}
            >
              <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </Button>
            <AudioButton text={phrase.japanese} onPlay={() => markReviewed(phrase.id)} />
          </div>
        </div>
        <div
          className="min-w-0 cursor-pointer"
          onClick={() => romajiMode === 'reveal' && setRevealed((r) => !r)}
        >
          <WordLookup context={phrase.japanese}>
            <p lang="ja" className="text-xl font-medium">
              {phrase.japanese}
            </p>
          </WordLookup>
          {romajiMode !== 'never' && (
            <p
              className={cn(
                'text-sm text-muted-foreground',
                !showRomaji && 'opacity-0 select-none',
              )}
            >
              <span className="mr-1 text-xs font-medium">Romaji:</span>
              {phrase.romaji}
            </p>
          )}
        </div>

        {phrase.notes && <p className="text-xs text-muted-foreground">{phrase.notes}</p>}

        {phrase.responses.length > 0 && (
          <details
            className="group"
            onToggle={(event) => {
              if (event.currentTarget.open) markReviewed(phrase.id);
            }}
          >
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-primary hover:underline">
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  'group-open:rotate-180',
                )}
              />
              Possible responses ({phrase.responses.length})
            </summary>
            <ul className="mt-2 flex flex-col gap-2 border-l-2 border-border pl-3">
              {phrase.responses.map((r, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p lang="ja" className="text-sm font-medium">
                      {r.japanese}
                    </p>
                    <AudioButton text={r.japanese} className="h-8 w-8 shrink-0" />
                  </div>
                  {showRomaji && (
                    <p className="text-xs text-muted-foreground">
                      <span className="mr-1 font-medium">Romaji:</span>
                      {r.romaji}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <span className="mr-1 font-medium">English:</span>
                    {r.english}
                  </p>
                  <p className="text-xs italic text-muted-foreground">{r.listen_for}</p>
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
