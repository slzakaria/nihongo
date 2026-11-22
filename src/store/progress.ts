import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SRSCard, SRSGrade } from "@/types";
import { createCard, sm2 } from "@/lib/srs/sm2";
import { getAllPhrases, getScenarioSlugForPhrase } from "@/lib/data/phrases";
import { useAuthStore } from "@/store/auth";
import { useGoalsStore } from "@/store/goals";
import { dayKey } from "@/lib/activity/studyDays";

export interface PendingCardWrite {
  operationId: string;
  card: SRSCard;
}

function operationId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ProgressStore {
  cards: Record<string, SRSCard>; // keyed by phraseId
  pendingCardsByUser: Record<string, Record<string, PendingCardWrite>>;
  pendingStudyDaysByUser: Record<string, Record<string, true>>;
  pendingScenarioResetsByUser: Record<string, Record<string, string>>;
  initCard: (phraseId: string) => void;
  initScenario: (scenarioSlug: string) => void;
  initKana: (rowSlug: string, phraseIds: string[]) => void;
  gradeCard: (phraseId: string, grade: SRSGrade) => void;
  markReviewed: (phraseId: string) => void;
  queueCardsForSync: (userId: string, cards: SRSCard[]) => void;
  acknowledgeCards: (
    userId: string,
    sent: Array<{ phraseId: string; operationId: string }>,
  ) => void;
  acknowledgeStudyDays: (userId: string, sentDays: string[]) => void;
  acknowledgeScenarioResets: (
    userId: string,
    sent: Array<{ scenarioSlug: string; operationId: string }>,
  ) => void;
  getDueCards: (scenarioSlug?: string) => SRSCard[];
  getCompletion: (scenarioSlug: string) => number; // 0-1, share of phrases reviewed at least once
  resetScenario: (scenarioSlug: string) => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      cards: {},
      pendingCardsByUser: {},
      pendingStudyDaysByUser: {},
      pendingScenarioResetsByUser: {},

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
        const updated = sm2(card, grade);
        useGoalsStore.getState().recordReview();
        const userId = useAuthStore.getState().user?.id;
        const today = dayKey();
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

      // Marks a phrase as reviewed from passive exposure (audio played / answers opened), without affecting SRS scheduling
      markReviewed: (phraseId) => {
        const card = get().cards[phraseId];
        if (!card || card.lastReview !== null) return;
        const updated = { ...card, lastReview: Date.now() };
        useGoalsStore.getState().recordReview();
        const userId = useAuthStore.getState().user?.id;
        const today = dayKey();
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

      getCompletion: (scenarioSlug) => {
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
            if (pending.card.scenarioSlug === scenarioSlug)
              delete pendingCards[phraseId];
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
    { name: "nihongo-progress" },
  ),
);
