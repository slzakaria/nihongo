import type { Phrase, Scenario } from '@/types'
import { getContent } from './content'

// Synchronous helpers over the current content. Client code reads the database copy once it has loaded.
export function getAllScenarios(): Scenario[] {
  return getContent().phrases
}

export function getScenarioBySlug(slug: string): Scenario | undefined {
  return getAllScenarios().find(s => s.slug === slug)
}

export function getPhrasesBySlug(slug: string): Phrase[] {
  return getScenarioBySlug(slug)?.phrases ?? []
}

export function getAllPhrases(): Phrase[] {
  return getAllScenarios().flatMap(s => s.phrases)
}

export function getPhraseById(id: string): Phrase | undefined {
  return getAllPhrases().find(p => p.id === id)
}

// Which scenario a phrase belongs to, used when initializing SRS cards
export function getScenarioSlugForPhrase(phraseId: string): string | undefined {
  return getAllScenarios().find(s => s.phrases.some(p => p.id === phraseId))?.slug
}
