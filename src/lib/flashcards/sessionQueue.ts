import { Phrase, SRSCard, SRSGrade } from '@/types';

export interface SessionQueueEntry {
  phraseId: string;
  dueAt: number;
}

export interface FlashcardSessionQueue {
  initialTotal: number;
  due: SessionQueueEntry[];
  learning: SessionQueueEntry[];
}

export interface ReadySessionCard extends SessionQueueEntry {
  queue: 'due' | 'learning';
}

export function createSessionQueue(
  phrases: Phrase[],
  cards: Record<string, SRSCard>,
  force: boolean,
  now: number,
): FlashcardSessionQueue {
  const due: SessionQueueEntry[] = [];
  const learning: SessionQueueEntry[] = [];

  for (const phrase of phrases) {
    const card = cards[phrase.id];
    if (!card) continue;

    if (force || card.nextReview <= now) {
      due.push({ phraseId: card.phraseId, dueAt: now });
    } else if (card.lastReview !== null && card.interval === 0) {
      learning.push({ phraseId: card.phraseId, dueAt: card.nextReview });
    }
  }

  learning.sort((a, b) => a.dueAt - b.dueAt);
  return {
    initialTotal: due.length + learning.length,
    due,
    learning,
  };
}

export function getReadySessionCard(
  queue: FlashcardSessionQueue,
  now: number,
): ReadySessionCard | null {
  if (queue.due.length > 0) return { ...queue.due[0], queue: 'due' };
  const readyLearning = queue.learning.find((entry) => entry.dueAt <= now);
  return readyLearning ? { ...readyLearning, queue: 'learning' } : null;
}

export function getNextLearningDueAt(
  queue: FlashcardSessionQueue,
  now: number,
): number | null {
  if (queue.due.length > 0 || queue.learning.some((entry) => entry.dueAt <= now)) {
    return null;
  }
  return queue.learning[0]?.dueAt ?? null;
}

export function applySessionRating(
  queue: FlashcardSessionQueue,
  phraseId: string,
  grade: SRSGrade,
  nextReview: number,
): FlashcardSessionQueue {
  const wasDue = queue.due.some((entry) => entry.phraseId === phraseId);
  const wasLearning = queue.learning.some((entry) => entry.phraseId === phraseId);
  if (!wasDue && !wasLearning) return queue;

  const due = wasDue
    ? queue.due.filter((entry) => entry.phraseId !== phraseId)
    : queue.due;
  const learning = queue.learning.filter((entry) => entry.phraseId !== phraseId);

  if (grade === 'again' || grade === 'hard') {
    learning.push({ phraseId, dueAt: nextReview });
    learning.sort((a, b) => a.dueAt - b.dueAt);
  }

  return { ...queue, due, learning };
}
