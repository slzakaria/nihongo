'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/flashcards/ProgressBar';
import { FlashcardFace } from '@/components/flashcards/FlashcardFace';
import { SyncStatus } from '@/components/flashcards/SyncStatus';
import { ReviewWaitState } from '@/components/flashcards/ReviewWaitState';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { useProgressStore } from '@/store/progress';
import { useContentStore } from '@/lib/data/content';
import { isAnswerCorrect } from '@/lib/flashcards/answer';
import { FLASHCARD_RATINGS } from '@/lib/flashcards/ratings';
import { Phrase } from '@/types';
import { BilingualText } from '@/components/layout/BilingualText';
import { FlashcardSimulatorPrompt } from '@/components/scenarios/ScenarioLearningPrompts';
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
  const scenario = useContentStore((s) => s.content.phrases.find((x) => x.slug === slug));
  const scenarioPhrases = scenario?.phrases;
  const deckPhrases = useMemo(
    () => phrases ?? scenarioPhrases ?? [],
    [phrases, scenarioPhrases],
  );
  const [force, setForce] = useState(false);

  useEffect(() => {
    if (onInit) onInit();
    else initScenario(slug);
  }, [slug, onInit, initScenario]);

  const {
    phrase,
    showBack,
    setShowBack,
    grade,
    total,
    currentIndex,
    done,
    waiting,
    remainingMs,
  } = useFlashcardSession(deckPhrases, force);

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
        <SyncStatus />
      </div>
    );
  }

  if (waiting) {
    return (
      <ReviewWaitState
        remainingMs={remainingMs}
        onPracticeAnyway={() => setForce(true)}
      />
    );
  }

  if (done || !phrase) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
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
        {scenario && (
          <FlashcardSimulatorPrompt
            complete={done}
            scenarioSlug={slug}
            scenarioLabel={scenario.label}
          />
        )}
        <SyncStatus />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
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
          <div className="rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground">
            <p className="font-semibold">When you’ll see each card again</p>
            <ul className="mt-2 grid gap-2">
              <li>
                <strong>Again:</strong> Forgot it. Returns in 30 seconds, after the other
                cards in this set.
              </li>
              <li>
                <strong>Hard:</strong> Remembered with difficulty. Returns in 10 minutes.
              </li>
              <li>
                <strong>Good:</strong> Remembered. Returns tomorrow.
              </li>
              <li>
                <strong>Easy:</strong> Knew it well. Returns in 3 days.
              </li>
            </ul>
            <p className="mt-2 text-foreground/80">
              Again and Hard cards keep looping until you choose Good or Easy. Their due
              times are saved if you leave.
            </p>
          </div>
        </>
      )}

      <SyncStatus />
    </div>
  );
}
