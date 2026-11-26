import { describe, expect, it } from 'vitest';
import type { Phrase, SRSCard } from '@/types';
import {
  applySessionRating,
  createSessionQueue,
  getNextLearningDueAt,
  getReadySessionCard,
} from './sessionQueue';

const phrases: Phrase[] = ['a', 'b'].map((id) => ({
  id,
  japanese: 'あ',
  romaji: 'a',
  english: 'a',
  difficulty: 'easy',
  notes: '',
  responses: [],
}));

function card(
  phraseId: string,
  {
    interval = 0,
    lastReview = null,
    nextReview = 0,
  }: { interval?: number; lastReview?: number | null; nextReview?: number } = {},
): SRSCard {
  return {
    phraseId,
    scenarioSlug: 'test',
    interval,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview,
    lastReview,
    totalReviews: 0,
    correctReviews: 0,
  };
}

describe('flashcard session queue', () => {
  it('starts due cards first and keeps future learning cards for their timer', () => {
    const queue = createSessionQueue(
      phrases,
      {
        a: card('a'),
        b: card('b', { lastReview: 100, nextReview: 1_000 }),
      },
      false,
      500,
    );

    expect(queue.initialTotal).toBe(2);
    expect(getReadySessionCard(queue, 500)).toMatchObject({
      phraseId: 'a',
      queue: 'due',
    });
    expect(getNextLearningDueAt(queue, 500)).toBeNull();

    const afterFirst = applySessionRating(queue, 'a', 'good', 86_400_500);
    expect(getReadySessionCard(afterFirst, 500)).toBeNull();
    expect(getNextLearningDueAt(afterFirst, 500)).toBe(1_000);
    expect(getReadySessionCard(afterFirst, 1_000)).toMatchObject({
      phraseId: 'b',
      queue: 'learning',
    });
  });

  it('holds Again and Hard cards until the rest of the set is done, then repeats them', () => {
    const queue = createSessionQueue(phrases, { a: card('a'), b: card('b') }, false, 500);
    const afterAgain = applySessionRating(queue, 'a', 'again', 30_500);

    expect(afterAgain.due.map((entry) => entry.phraseId)).toEqual(['b']);
    expect(getReadySessionCard(afterAgain, 30_500)).toMatchObject({
      phraseId: 'b',
      queue: 'due',
    });

    const afterHard = applySessionRating(afterAgain, 'b', 'hard', 600_500);
    expect(afterHard.due).toEqual([]);
    expect(getNextLearningDueAt(afterHard, 30_500)).toBeNull();
    expect(getReadySessionCard(afterHard, 30_500)).toMatchObject({
      phraseId: 'a',
      queue: 'learning',
    });
    const afterAgainRepeats = applySessionRating(afterHard, 'a', 'again', 630_500);
    expect(getReadySessionCard(afterAgainRepeats, 600_500)).toMatchObject({
      phraseId: 'b',
      queue: 'learning',
    });
  });

  it('removes a learning card only when it is rated Good or Easy', () => {
    const queue = createSessionQueue([phrases[0]], { a: card('a') }, false, 500);
    const again = applySessionRating(queue, 'a', 'again', 30_500);
    const hard = applySessionRating(again, 'a', 'hard', 600_500);
    expect(hard.learning).toEqual([{ phraseId: 'a', dueAt: 600_500 }]);

    const good = applySessionRating(hard, 'a', 'good', 86_400_500);
    expect(good.learning).toEqual([]);
    expect(good.initialTotal).toBe(1);
  });
});
