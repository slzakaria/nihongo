import raw from './phrases.json'
import type { Phrase, Scenario } from '@/types'

export const scenarios: Scenario[] = raw.scenarios as Scenario[]

export function getAllScenarios(): Scenario[] {
  return scenarios
}

export function getScenarioBySlug(slug: string): Scenario | undefined {
  return scenarios.find(s => s.slug === slug)
}

export function getPhrasesBySlug(slug: string): Phrase[] {
  return getScenarioBySlug(slug)?.phrases ?? []
}

export function getAllPhrases(): Phrase[] {
  return scenarios.flatMap(s => s.phrases)
}

export function getPhraseById(id: string): Phrase | undefined {
  return getAllPhrases().find(p => p.id === id)
}

// Which scenario a phrase belongs to, used when initializing SRS cards
export function getScenarioSlugForPhrase(phraseId: string): string | undefined {
  return scenarios.find(s => s.phrases.some(p => p.id === phraseId))?.slug
}
