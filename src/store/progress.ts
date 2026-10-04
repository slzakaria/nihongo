import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SRSCard, SRSGrade } from '@/types'
import { createCard, sm2 } from '@/lib/srs/sm2'
import { getAllPhrases, getScenarioSlugForPhrase } from '@/lib/data/phrases'

interface ProgressStore {
  cards: Record<string, SRSCard> // keyed by phraseId
  initCard: (phraseId: string) => void
  initScenario: (scenarioSlug: string) => void
  gradeCard: (phraseId: string, grade: SRSGrade) => void
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
        set(state => ({
          cards: { ...state.cards, [phraseId]: createCard(phraseId, scenarioSlug) },
        }))
      },

      initScenario: scenarioSlug => {
        const phrases = getAllPhrases().filter(
          p => getScenarioSlugForPhrase(p.id) === scenarioSlug
        )
        set(state => {
          const cards = { ...state.cards }
          for (const p of phrases) {
            if (!cards[p.id]) cards[p.id] = createCard(p.id, scenarioSlug)
          }
          return { cards }
        })
      },

      gradeCard: (phraseId, grade) => {
        const card = get().cards[phraseId]
        if (!card) return
        set(state => ({
          cards: { ...state.cards, [phraseId]: sm2(card, grade) },
        }))
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
      },
    }),
    { name: 'nihongo-progress' }
  )
)
