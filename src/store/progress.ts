import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SRSCard, SRSGrade } from '@/types';
import { createCard, scheduleCard } from '@/lib/srs/scheduler';
import { getAllPhrases, getScenarioSlugForPhrase } from '@/lib/data/phrases';
import { useAuthStore } from '@/store/auth';
import { useGoalsStore } from '@/store/goals';
import { dayKey } from '@/lib/activity/studyDays';

export interface PendingCardWrite {
  operationId: string;
  card: SRSCard;
}

export interface ScenarioPhraseProgress {
  scenarioSlug: string;
  exploredAt: number;
}

export interface PendingScenarioPhraseWrite extends ScenarioPhraseProgress {
  operationId: string;
}

export interface PendingReviewEvent {
  operationId: string;
  phraseId: string;
  scenarioSlug: string;
  rating: SRSGrade;
  reviewedAt: number;
}

export interface FlashcardProgressResetState {
  version: number;
  resetAt: number;
}

function operationId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ProgressStore {
  cards: Record<string, SRSCard>; // keyed by phraseId
  scenarioProgress: Record<string, ScenarioPhraseProgress>; // keyed by phraseId
  pendingCardsByUser: Record<string, Record<string, PendingCardWrite>>;
  pendingScenarioProgressByUser: Record<
    string,
    Record<string, PendingScenarioPhraseWrite>
  >;
  pendingReviewEventsByUser: Record<string, Record<string, PendingReviewEvent>>;
  pendingStudyDaysByUser: Record<string, Record<string, true>>;
  pendingScenarioResetsByUser: Record<string, Record<string, string>>;
  flashcardProgressResetByUser: Record<string, FlashcardProgressResetState>;
  initCard: (phraseId: string) => void;
  initScenario: (scenarioSlug: string) => void;
  initKana: (rowSlug: string, phraseIds: string[]) => void;
  gradeCard: (phraseId: string, grade: SRSGrade) => void;
  markScenarioPhraseExplored: (scenarioSlug: string, phraseId: string) => void;
  queueCardsForSync: (userId: string, cards: SRSCard[]) => void;
  queueScenarioProgressForSync: (
    userId: string,
    progress: Array<{ phraseId: string; value: ScenarioPhraseProgress }>,
  ) => void;
  acknowledgeCards: (
    userId: string,
    sent: Array<{ phraseId: string; operationId: string }>,
  ) => void;
  acknowledgeScenarioProgress: (
    userId: string,
    sent: Array<{ phraseId: string; operationId: string }>,
  ) => void;
  acknowledgeReviewEvents: (userId: string, sent: Array<{ operationId: string }>) => void;
  acknowledgeStudyDays: (userId: string, sentDays: string[]) => void;
  acknowledgeScenarioResets: (
    userId: string,
    sent: Array<{ scenarioSlug: string; operationId: string }>,
  ) => void;
  getDueCards: (scenarioSlug?: string) => SRSCard[];
  getFlashcardCompletion: (scenarioSlug: string) => number;
  resetScenario: (scenarioSlug: string) => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      cards: {},
      scenarioProgress: {},
      pendingCardsByUser: {},
      pendingScenarioProgressByUser: {},
      pendingReviewEventsByUser: {},
      pendingStudyDaysByUser: {},
      pendingScenarioResetsByUser: {},
      flashcardProgressResetByUser: {},

      initCard: (phraseId) => {
        if (get().cards[phraseId]) return;
        const scenarioSlug = getScenarioSlugForPhrase(phraseId);
        if (!scenarioSlug) return;
        const card = createCard(phraseId, scenarioSlug);
        const userId = useAuthStore.getState().user?.id;
        set((state) => ({
          cards: { ...state.cards, [phraseId]: card },
          ...(userId && {
            pendingCardsByUser: {
              ...state.pendingCardsByUser,
              [userId]: {
                ...state.pendingCardsByUser[userId],
                [phraseId]: { operationId: operationId(), card },
              },
            },
          }),
        }));
      },

      initScenario: (scenarioSlug) => {
        const phrases = getAllPhrases().filter(
          (p) => getScenarioSlugForPhrase(p.id) === scenarioSlug,
        );
        const newCards: SRSCard[] = [];
        const userId = useAuthStore.getState().user?.id;
        set((state) => {
          const cards = { ...state.cards };
          for (const p of phrases) {
            if (!cards[p.id]) {
              const card = createCard(p.id, scenarioSlug);
              cards[p.id] = card;
              newCards.push(card);
            }
          }
          if (!userId || newCards.length === 0) return { cards };
          const pending = { ...state.pendingCardsByUser[userId] };
          for (const card of newCards) {
            pending[card.phraseId] = { operationId: operationId(), card };
          }
          return {
            cards,
            pendingCardsByUser: {
              ...state.pendingCardsByUser,
              [userId]: pending,
            },
          };
        });
      },

      initKana: (rowSlug, phraseIds) => {
        const scenarioSlug = `kana:${rowSlug}`;
        const newCards: SRSCard[] = [];
        const userId = useAuthStore.getState().user?.id;
        set((state) => {
          const cards = { ...state.cards };
          for (const id of phraseIds) {
            if (!cards[id]) {
              const card = createCard(id, scenarioSlug);
              cards[id] = card;
              newCards.push(card);
            }
          }
          if (!userId || newCards.length === 0) return { cards };
          const pending = { ...state.pendingCardsByUser[userId] };
          for (const card of newCards) {
            pending[card.phraseId] = { operationId: operationId(), card };
          }
          return {
            cards,
            pendingCardsByUser: {
              ...state.pendingCardsByUser,
              [userId]: pending,
            },
          };
        });
      },

      gradeCard: (phraseId, grade) => {
        const card = get().cards[phraseId];
        if (!card) return;
        const reviewedAt = Date.now();
        const updated = scheduleCard(card, grade, reviewedAt);
        useGoalsStore.getState().recordReview();
        const userId = useAuthStore.getState().user?.id;
        const today = dayKey();
        const reviewEvent = userId
          ? {
              operationId: operationId(),
              phraseId,
              scenarioSlug: card.scenarioSlug,
              rating: grade,
              reviewedAt,
            }
          : null;
        set((state) => ({
          cards: { ...state.cards, [phraseId]: updated },
          ...(userId && {
            pendingCardsByUser: {
              ...state.pendingCardsByUser,
              [userId]: {
                ...state.pendingCardsByUser[userId],
                [phraseId]: { operationId: operationId(), card: updated },
              },
            },
            pendingReviewEventsByUser: {
              ...state.pendingReviewEventsByUser,
              [userId]: {
                ...state.pendingReviewEventsByUser[userId],
                ...(reviewEvent && {
                  [reviewEvent.operationId]: reviewEvent,
                }),
              },
            },
            pendingStudyDaysByUser: {
              ...state.pendingStudyDaysByUser,
              [userId]: {
                ...state.pendingStudyDaysByUser[userId],
                [today]: true,
              },
            },
          }),
        }));
      },

      markScenarioPhraseExplored: (scenarioSlug, phraseId) => {
        if (get().scenarioProgress?.[phraseId]) return;
        const progress = { scenarioSlug, exploredAt: Date.now() };
        const userId = useAuthStore.getState().user?.id;
        const today = dayKey();
        set((state) => ({
          scenarioProgress: {
            ...(state.scenarioProgress ?? {}),
            [phraseId]: progress,
          },
          ...(userId && {
            pendingScenarioProgressByUser: {
              ...(state.pendingScenarioProgressByUser ?? {}),
              [userId]: {
                ...state.pendingScenarioProgressByUser?.[userId],
                [phraseId]: {
                  ...progress,
                  operationId: operationId(),
                },
              },
            },
            pendingStudyDaysByUser: {
              ...state.pendingStudyDaysByUser,
              [userId]: {
                ...state.pendingStudyDaysByUser[userId],
                [today]: true,
              },
            },
          }),
        }));
      },

      queueCardsForSync: (userId, cards) => {
        if (cards.length === 0) return;
        set((state) => {
          const pending = { ...state.pendingCardsByUser[userId] };
          for (const card of cards) {
            pending[card.phraseId] = { operationId: operationId(), card };
          }
          return {
            pendingCardsByUser: {
              ...state.pendingCardsByUser,
              [userId]: pending,
            },
          };
        });
      },

      queueScenarioProgressForSync: (userId, progress) => {
        if (progress.length === 0) return;
        set((state) => {
          const pending = {
            ...state.pendingScenarioProgressByUser?.[userId],
          };
          for (const item of progress) {
            pending[item.phraseId] = {
              ...item.value,
              operationId: operationId(),
            };
          }
          return {
            pendingScenarioProgressByUser: {
              ...(state.pendingScenarioProgressByUser ?? {}),
              [userId]: pending,
            },
          };
        });
      },

      acknowledgeCards: (userId, sent) => {
        set((state) => {
          const pending = { ...state.pendingCardsByUser[userId] };
          let changed = false;
          for (const item of sent) {
            if (pending[item.phraseId]?.operationId === item.operationId) {
              delete pending[item.phraseId];
              changed = true;
            }
          }
          if (!changed) return state;
          return {
            pendingCardsByUser: {
              ...state.pendingCardsByUser,
              [userId]: pending,
            },
          };
        });
      },

      acknowledgeScenarioProgress: (userId, sent) => {
        set((state) => {
          const pending = {
            ...state.pendingScenarioProgressByUser?.[userId],
          };
          let changed = false;
          for (const item of sent) {
            if (pending[item.phraseId]?.operationId === item.operationId) {
              delete pending[item.phraseId];
              changed = true;
            }
          }
          if (!changed) return state;
          return {
            pendingScenarioProgressByUser: {
              ...(state.pendingScenarioProgressByUser ?? {}),
              [userId]: pending,
            },
          };
        });
      },

      acknowledgeReviewEvents: (userId, sent) => {
        set((state) => {
          const pending = { ...state.pendingReviewEventsByUser[userId] };
          let changed = false;
          for (const item of sent) {
            if (pending[item.operationId]) {
              delete pending[item.operationId];
              changed = true;
            }
          }
          if (!changed) return state;
          return {
            pendingReviewEventsByUser: {
              ...state.pendingReviewEventsByUser,
              [userId]: pending,
            },
          };
        });
      },

      acknowledgeStudyDays: (userId, sentDays) => {
        set((state) => {
          const pending = { ...state.pendingStudyDaysByUser[userId] };
          let changed = false;
          for (const day of sentDays) {
            if (pending[day]) {
              delete pending[day];
              changed = true;
            }
          }
          if (!changed) return state;
          return {
            pendingStudyDaysByUser: {
              ...state.pendingStudyDaysByUser,
              [userId]: pending,
            },
          };
        });
      },

      acknowledgeScenarioResets: (userId, sent) => {
        set((state) => {
          const pending = { ...state.pendingScenarioResetsByUser[userId] };
          let changed = false;
          for (const item of sent) {
            if (pending[item.scenarioSlug] === item.operationId) {
              delete pending[item.scenarioSlug];
              changed = true;
            }
          }
          if (!changed) return state;
          return {
            pendingScenarioResetsByUser: {
              ...state.pendingScenarioResetsByUser,
              [userId]: pending,
            },
          };
        });
      },

      getDueCards: (scenarioSlug) => {
        const now = Date.now();
        return Object.values(get().cards).filter((c) => {
          if (scenarioSlug && c.scenarioSlug !== scenarioSlug) return false;
          return c.nextReview <= now;
        });
      },

      getFlashcardCompletion: (scenarioSlug) => {
        const total = getAllPhrases().filter(
          (p) => getScenarioSlugForPhrase(p.id) === scenarioSlug,
        ).length;
        if (total === 0) return 0;
        const reviewed = Object.values(get().cards).filter(
          (c) => c.scenarioSlug === scenarioSlug && c.lastReview !== null,
        ).length;
        return reviewed / total;
      },

      resetScenario: (scenarioSlug) => {
        const userId = useAuthStore.getState().user?.id;
        set((state) => {
          const cards = { ...state.cards };
          for (const id of Object.keys(cards)) {
            if (cards[id].scenarioSlug === scenarioSlug) delete cards[id];
          }
          if (!userId) return { cards };
          const pendingCards = { ...state.pendingCardsByUser[userId] };
          for (const [phraseId, pending] of Object.entries(pendingCards)) {
            if (pending.card.scenarioSlug === scenarioSlug) delete pendingCards[phraseId];
          }
          return {
            cards,
            pendingCardsByUser: {
              ...state.pendingCardsByUser,
              [userId]: pendingCards,
            },
            pendingScenarioResetsByUser: {
              ...state.pendingScenarioResetsByUser,
              [userId]: {
                ...state.pendingScenarioResetsByUser[userId],
                [scenarioSlug]: operationId(),
              },
            },
          };
        });
      },
    }),
    {
      name: 'nihongo-progress',
      version: 2,
      migrate: (persistedState, version) => {
        if (typeof persistedState === 'object' && persistedState) {
          const previous = persistedState as Record<string, unknown>;
          return {
            ...previous,
            cards: version === 0 ? {} : (previous.cards ?? {}),
            scenarioProgress: previous.scenarioProgress ?? {},
            pendingCardsByUser: version === 0 ? {} : (previous.pendingCardsByUser ?? {}),
            pendingScenarioProgressByUser: previous.pendingScenarioProgressByUser ?? {},
            pendingReviewEventsByUser: previous.pendingReviewEventsByUser ?? {},
            pendingStudyDaysByUser: previous.pendingStudyDaysByUser ?? {},
            pendingScenarioResetsByUser:
              version === 0 ? {} : (previous.pendingScenarioResetsByUser ?? {}),
            flashcardProgressResetByUser: previous.flashcardProgressResetByUser ?? {},
          };
        }
        return {};
      },
    },
  ),
);
