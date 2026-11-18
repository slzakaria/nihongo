import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SRSCard, SRSGrade } from '@/types'
import { createCard, sm2 } from '@/lib/srs/sm2'
import { getAllPhrases, getScenarioSlugForPhrase } from '@/lib/data/phrases'
import { useAuthStore } from '@/store/auth'
import { upsertCards, deleteScenarioCards } from '@/lib/supabase/progress'
import { recordStudyDay } from '@/lib/supabase/activity'

interface ProgressStore {
  cards: Record<string, SRSCard> // keyed by phraseId
  initCard: (phraseId: string) => void
  initScenario: (scenarioSlug: string) => void
  gradeCard: (phraseId: string, grade: SRSGrade) => void
  markReviewed: (phraseId: string) => void
  getDueCards: (scenarioSlug?: string) => SRSCard[]
  getCompletion: (scenarioSlug: string) => number // 0-1, share of phrases reviewed at least once
  resetScenario: (scenarioSlug: string) => void
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      cards: {},

      initCard: phraseId => {
        if (get().cards[phraseId]) return
        const scenarioSlug = getScenarioSlugForPhrase(phraseId)
        if (!scenarioSlug) return
        const card = createCard(phraseId, scenarioSlug)
        set(state => ({
          cards: { ...state.cards, [phraseId]: card },
        }))
        const userId = useAuthStore.getState().user?.id
        if (userId) void upsertCards(userId, [card])
      },

      initScenario: scenarioSlug => {
        const phrases = getAllPhrases().filter(
          p => getScenarioSlugForPhrase(p.id) === scenarioSlug
        )
        const newCards: SRSCard[] = []
        set(state => {
          const cards = { ...state.cards }
          for (const p of phrases) {
            if (!cards[p.id]) {
              const card = createCard(p.id, scenarioSlug)
              cards[p.id] = card
              newCards.push(card)
            }
          }
          return { cards }
        })
        const userId = useAuthStore.getState().user?.id
        if (userId && newCards.length > 0) void upsertCards(userId, newCards)
      },

      gradeCard: (phraseId, grade) => {
        const card = get().cards[phraseId]
        if (!card) return
        const updated = sm2(card, grade)
        set(state => ({
          cards: { ...state.cards, [phraseId]: updated },
        }))
        const userId = useAuthStore.getState().user?.id
        if (userId) {
          void upsertCards(userId, [updated])
          void recordStudyDay(userId)
        }
      },

      // Marks a phrase as reviewed from passive exposure (audio played / answers opened), without affecting SRS scheduling
      markReviewed: phraseId => {
        const card = get().cards[phraseId]
        if (!card || card.lastReview !== null) return
        const updated = { ...card, lastReview: Date.now() }
        set(state => ({
          cards: { ...state.cards, [phraseId]: updated },
        }))
        const userId = useAuthStore.getState().user?.id
        if (userId) {
          void upsertCards(userId, [updated])
          void recordStudyDay(userId)
        }
      },

      getDueCards: scenarioSlug => {
        const now = Date.now()
        return Object.values(get().cards).filter(c => {
          if (scenarioSlug && c.scenarioSlug !== scenarioSlug) return false
          return c.nextReview <= now
        })
      },

      getCompletion: scenarioSlug => {
        const total = getAllPhrases().filter(
          p => getScenarioSlugForPhrase(p.id) === scenarioSlug
        ).length
        if (total === 0) return 0
        const reviewed = Object.values(get().cards).filter(
          c => c.scenarioSlug === scenarioSlug && c.lastReview !== null
        ).length
        return reviewed / total
      },

      resetScenario: scenarioSlug => {
        set(state => {
          const cards = { ...state.cards }
          for (const id of Object.keys(cards)) {
            if (cards[id].scenarioSlug === scenarioSlug) delete cards[id]
          }
          return { cards }
        })
        const userId = useAuthStore.getState().user?.id
        if (userId) void deleteScenarioCards(userId, scenarioSlug)
      },
    }),
    { name: 'nihongo-progress' }
  )
)
