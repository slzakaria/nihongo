'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/lib/data/content';
import { useBookmarkStore } from '@/store/bookmarks';

export function BookmarksCard() {
  const phraseIds = useBookmarkStore((s) => s.phraseIds);
  const scenarios = useContentStore((s) => s.content.phrases);
  const savedIds = new Set(phraseIds);
  const savedPhrases = scenarios.flatMap((s) =>
    s.phrases
      .filter((phrase) => savedIds.has(phrase.id))
      .map((phrase) => ({ phrase, scenario: s })),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          Saved phrases
          <span className="font-normal text-muted-foreground">
            ({savedPhrases.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {savedPhrases.length > 0 ? (
          <>
            <ul className="flex flex-col gap-3">
              {savedPhrases.slice(0, 4).map(({ phrase, scenario }) => (
                <li key={phrase.id} className="flex flex-col gap-0.5">
                  <span lang="ja" className="text-sm font-medium">
                    {phrase.japanese}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {phrase.english} · {scenario.label}
                  </span>
                </li>
              ))}
            </ul>
            {savedPhrases.length > 4 && (
              <p className="text-xs text-muted-foreground">
                And {savedPhrases.length - 4} more saved phrase
                {savedPhrases.length - 4 === 1 ? '' : 's'}.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Bookmark phrases in a scenario to build a focused review list.
          </p>
        )}

        <Button
          asChild
          variant={savedPhrases.length > 0 ? 'default' : 'outline'}
          className="w-fit cursor-pointer"
        >
          <Link href={savedPhrases.length > 0 ? '/flashcards/bookmarks' : '/scenarios'}>
            {savedPhrases.length > 0 ? 'Review saved phrases' : 'Browse scenarios'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
