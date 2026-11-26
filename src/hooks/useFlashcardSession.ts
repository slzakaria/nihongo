'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SetStateAction } from 'react';
import { Phrase, SRSGrade } from '@/types';
import { useProgressStore } from '@/store/progress';
import {
  applySessionRating,
  createSessionQueue,
  getNextLearningDueAt,
  getReadySessionCard,
} from '@/lib/flashcards/sessionQueue';

interface ActiveSession {
  key: string;
  startedAt: number;
  queue: ReturnType<typeof createSessionQueue>;
}

// Works on any list of phrases (a scenario, bookmarks, or the kana set).
export function useFlashcardSession(phrases: Phrase[], force = false) {
  const cards = useProgressStore((s) => s.cards);
  const gradeCard = useProgressStore((s) => s.gradeCard);
  const phraseKey = phrases.map((phrase) => phrase.id).join('\u0000');
  const sessionKey = `${phraseKey}:${force ? 'all' : 'due'}`;
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showBackState, setShowBackState] = useState<{
    key: string;
    value: boolean;
  } | null>(null);
  const initialSession = useMemo(() => {
    if (session?.key === sessionKey || !phrases.every((phrase) => cards[phrase.id]))
      return null;
    const startedAt = now;
    return {
      key: sessionKey,
      startedAt,
      queue: createSessionQueue(phrases, cards, force, startedAt),
    };
  }, [cards, force, now, phrases, session, sessionKey]);
  const activeSession = session?.key === sessionKey ? session : initialSession;
  const sessionNow = Math.max(now, activeSession?.startedAt ?? now);
  const showBack = showBackState?.key === sessionKey ? showBackState.value : false;
  const setShowBack = useCallback(
    (action: SetStateAction<boolean>) => {
      setShowBackState((current) => {
        const currentValue = current?.key === sessionKey ? current.value : false;
        return {
          key: sessionKey,
          value: typeof action === 'function' ? action(currentValue) : action,
        };
      });
    },
    [sessionKey],
  );

  const queue = activeSession?.queue;
  const currentItem = queue ? getReadySessionCard(queue, sessionNow) : null;
  const phrase = currentItem
    ? phrases.find((item) => item.id === currentItem.phraseId)
    : undefined;
  const total = queue?.initialTotal ?? 0;
  const remaining = queue ? queue.due.length + queue.learning.length : 0;
  const currentIndex = total - remaining;
  const done = Boolean(queue && remaining === 0);
  const waitingUntil = queue ? getNextLearningDueAt(queue, now) : null;
  const waiting = waitingUntil !== null;
  const remainingMs = waitingUntil === null ? 0 : Math.max(0, waitingUntil - sessionNow);

  useEffect(() => {
    if (waitingUntil === null) return;
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(1000, Math.max(1, waitingUntil - sessionNow)),
    );
    return () => window.clearTimeout(timer);
  }, [sessionNow, waitingUntil]);

  function grade(score: SRSGrade) {
    if (!activeSession || !currentItem) return;
    gradeCard(currentItem.phraseId, score);
    const updatedCard = useProgressStore.getState().cards[currentItem.phraseId];
    if (!updatedCard) return;

    setSession((current) => {
      const source = current?.key === sessionKey ? current : activeSession;
      if (!source) return current;
      return {
        ...source,
        queue: applySessionRating(
          source.queue,
          currentItem.phraseId,
          score,
          updatedCard.nextReview,
        ),
      };
    });
    setNow(Date.now());
    setShowBack(false);
  }

  return {
    phrase,
    showBack,
    setShowBack,
    grade,
    total,
    currentIndex,
    done,
    waiting,
    remainingMs,
  };
}
