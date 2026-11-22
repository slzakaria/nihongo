'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/flashcards/ProgressBar';
import { FlashcardFace } from '@/components/flashcards/FlashcardFace';
import { SyncStatus } from '@/components/flashcards/SyncStatus';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { useProgressStore } from '@/store/progress';
import { useContentStore } from '@/lib/data/content';
import { isAnswerCorrect } from '@/lib/flashcards/answer';
import { FLASHCARD_RATINGS } from '@/lib/flashcards/ratings';
import { Phrase } from '@/types';
import { BilingualText } from '@/components/layout/BilingualText';
import { cn } from '@/lib/utils';

export function FlashcardDeck({
  slug,
  phrases,
  onInit,
}: {
  slug: string;
  phrases?: Phrase[];
  onInit?: () => void;
}) {
  const initScenario = useProgressStore((s) => s.initScenario);
  const scenarioPhrases = useContentStore(
    (s) => s.content.phrases.find((x) => x.slug === slug)?.phrases,
  );
  const deckPhrases = useMemo(
    () => phrases ?? scenarioPhrases ?? [],
    [phrases, scenarioPhrases],
  );
  const [force, setForce] = useState(false);

  useEffect(() => {
    if (onInit) onInit();
    else initScenario(slug);
  }, [slug, onInit, initScenario]);

  const { phrase, showBack, setShowBack, grade, total, currentIndex, done } =
    useFlashcardSession(deckPhrases, force);

  // Typed answer for the current card. Reset automatically when the card changes.
  const [attempt, setAttempt] = useState<{
    phraseId: string;
    text: string;
    correct: boolean | null;
  }>({
    phraseId: '',
    text: '',
    correct: null,
  });
  const current =
    attempt.phraseId === phrase?.id
      ? attempt
      : { phraseId: phrase?.id ?? '', text: '', correct: null };

  // Space reveals the card; 1 to 5 rate it. Ignored while typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!phrase) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      if (!showBack && e.key === ' ') {
        e.preventDefault();
        setShowBack(true);
      } else if (showBack) {
        const rating = FLASHCARD_RATINGS.find(({ shortcut }) => shortcut === e.key);
        if (rating) grade(rating.grade);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phrase, showBack, setShowBack, grade]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SyncStatus />
        <p className="text-lg font-medium">
          <BilingualText
            english="Nothing due right now"
            japanese="きょうふくしゅうするカードはありません"
          />
        </p>
        <p className="text-sm text-muted-foreground">
          <BilingualText
            english="Cards come back for review as their interval elapses — or practice them all now."
            japanese="ふくしゅうのじきがくるとカードがもどります。すべてのカードをいまれんしゅうすることもできます。"
          />
        </p>
        <Button
          className="cursor-pointer"
          variant="secondary"
          onClick={() => setForce(true)}
        >
          Practice anyway
        </Button>
      </div>
    );
  }

  if (done || !phrase) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <SyncStatus />
        <p className="text-lg font-medium">
          <BilingualText
            english="Session complete 🎉"
            japanese="れんしゅうおつかれさま！"
          />
        </p>
        <p className="text-sm text-muted-foreground">
          <BilingualText
            english={`You reviewed ${total} card(s).`}
            japanese={`${total}まいのカードをふくしゅうしました。`}
          />
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SyncStatus />
      <ProgressBar current={currentIndex} total={total} />

      {!showBack && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAttempt({
              phraseId: phrase.id,
              text: current.text,
              correct: isAnswerCorrect(current.text, phrase),
            });
            setShowBack(true);
          }}
          className="flex gap-2"
        >
          <input
            value={current.text}
            onChange={(e) =>
              setAttempt({
                phraseId: phrase.id,
                text: e.target.value,
                correct: null,
              })
            }
            placeholder="Type it in Japanese or romaji (optional)"
            aria-label="Type the phrase in Japanese or romaji"
            className="h-10 flex-1 rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" variant="secondary" className="cursor-pointer">
            Check
          </Button>
        </form>
      )}

      <FlashcardFace
        phrase={phrase}
        showBack={showBack}
        onFlip={() => setShowBack((v) => !v)}
      />

      {showBack && current.correct !== null && (
        <p
          className={cn(
            'text-center text-sm',
            current.correct ? 'text-primary' : 'text-red-500',
          )}
        >
          {current.correct
            ? 'Correct! Rate how well you remembered it.'
            : 'Not quite. Compare with the answer above, then rate your recall.'}
        </p>
      )}

      {showBack && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {FLASHCARD_RATINGS.map(({ label, shortcut, grade: score, style }) => (
              <Button
                key={label}
                className={`srs-grade-button srs-grade-button--${style} cursor-pointer`}
                variant="outline"
                onClick={() => grade(score)}
              >
                {label} <span className="ml-1 text-xs opacity-60">{shortcut}</span>
              </Button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Again and Hard both reset the review streak and schedule this card for
            tomorrow.
          </p>
        </>
      )}
    </div>
  );
}
