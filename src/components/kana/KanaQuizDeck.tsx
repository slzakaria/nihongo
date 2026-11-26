'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/flashcards/ProgressBar';
import { SyncStatus } from '@/components/flashcards/SyncStatus';
import { AudioButton } from '@/components/phrases/AudioButton';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { BilingualText } from '@/components/layout/BilingualText';
import { Phrase } from '@/types';
import { cn } from '@/lib/utils';

const CHOICE_COUNT = 4;
// Correct-on-first-try maps to the SM-2 "Medium" pass grade (schedules a normal
// review interval); a wrong pick maps to "Again" (resets the streak, due tomorrow).
const CORRECT_GRADE = 3;
const INCORRECT_GRADE = 0;

function pickChoices(phrase: Phrase, pool: Phrase[]): string[] {
  const distractors = pool
    .filter((p) => p.id !== phrase.id && p.romaji !== phrase.romaji)
    .map((p) => p.romaji);
  const unique = Array.from(new Set(distractors));
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  const choices = [phrase.romaji, ...unique.slice(0, CHOICE_COUNT - 1)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

// Multiple-choice kana recognition: show the character (with a small pronunciation
// hint), ask the user to pick the matching romaji out of 4 options, and auto-grade
// into the existing SRS session based on whether they picked correctly.
export function KanaQuizDeck({
  phrases,
  onInit,
}: {
  phrases: Phrase[];
  onInit?: () => void;
}) {
  const [force, setForce] = useState(false);

  useEffect(() => {
    onInit?.();
  }, [onInit]);

  const { phrase, grade, total, currentIndex, done } = useFlashcardSession(
    phrases,
    force,
  );

  const choices = useMemo(
    () => (phrase ? pickChoices(phrase, phrases) : []),
    [phrase, phrases],
  );

  const [picked, setPicked] = useState<{ phraseId: string; answer: string } | null>(
    null,
  );

  // Reset the picked answer whenever the card changes, then advance after a short
  // pause so the user can see the correct/incorrect feedback before the next card.
  useEffect(() => {
    if (!picked) return;
    const correct = picked.answer === phrase?.romaji;
    const timeout = setTimeout(() => grade(correct ? CORRECT_GRADE : INCORRECT_GRADE), 900);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

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

  const isAnswered = picked?.phraseId === phrase.id;
  const isCorrect = isAnswered && picked.answer === phrase.romaji;

  return (
    <div className="flex flex-col gap-4">
      <SyncStatus />
      <ProgressBar current={currentIndex} total={total} />

      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-10">
        <div className="flex items-center gap-2">
          <span className="text-6xl">{phrase.japanese}</span>
          <AudioButton text={phrase.japanese} />
        </div>
        {phrase.english && (
          <p className="max-w-xs px-4 text-center text-xs text-muted-foreground">
            {phrase.english}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {choices.map((choice) => {
          const isThisCorrect = choice === phrase.romaji;
          const isThisPicked = isAnswered && picked.answer === choice;
          return (
            <Button
              key={choice}
              type="button"
              variant="outline"
              disabled={isAnswered}
              onClick={() => setPicked({ phraseId: phrase.id, answer: choice })}
              className={cn(
                'h-12 cursor-pointer text-base',
                isAnswered && isThisCorrect && 'border-primary bg-primary/10 text-primary',
                isAnswered &&
                  isThisPicked &&
                  !isThisCorrect &&
                  'border-red-500 bg-red-500/10 text-red-500',
              )}
            >
              {choice}
            </Button>
          );
        })}
      </div>

      {isAnswered && (
        <p
          className={cn(
            'text-center text-sm',
            isCorrect ? 'text-primary' : 'text-red-500',
          )}
        >
          {isCorrect ? 'Correct!' : `Not quite — it's "${phrase.romaji}".`}
        </p>
      )}
    </div>
  );
}
