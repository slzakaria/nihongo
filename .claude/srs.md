// store/progress.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SRSCard } from '@/types'

interface ProgressStore {
cards: Record<string, SRSCard> // keyed by phraseId
initCard: (phraseId: string) => void
gradeCard: (phraseId: string, grade: 0 | 1 | 2 | 3 | 4 | 5) => void
getDueCards: (scenarioSlug?: string) => SRSCard[]
resetScenario: (scenarioSlug: string) => void
}

export const useProgressStore = create<ProgressStore>()(
persist(
(set, get) => ({
cards: {},
initCard: (phraseId) => { /* ... _/ },
gradeCard: (phraseId, grade) => {
const card = get().cards[phraseId]
const updated = sm2(card, grade) // see sm2.ts below
set(state => ({
cards: { ...state.cards, [phraseId]: updated }
}))
},
getDueCards: (slug) => {
const now = Date.now()
return Object.values(get().cards)
.filter(c => {
const dueNow = c.nextReview <= now
if (!slug) return dueNow
return dueNow && c.phraseId.startsWith(slug.slice(0, 2))
})
},
resetScenario: (slug) => { /_ delete cards starting with slug prefix */ }
}),
{ name: 'nihongo-progress' }
)
)
