// types/index.ts
export interface PhraseResponse {
  japanese: string
  romaji: string
  english: string
  listen_for: string
}

export interface Phrase {
  id: string
  japanese: string
  romaji: string
  english: string
  difficulty: 'core' | 'extra'
  notes: string
  responses: PhraseResponse[]
}

export interface Scenario {
  slug: string
  label: string
  icon: string
  phrases: Phrase[]
}

// SRS card wraps a phrase with scheduling metadata
export interface SRSCard {
  phraseId: string
  interval: number       // days until next review
  repetitions: number    // times answered correctly in a row
  easeFactor: number     // SM-2 ease factor (starts at 2.5)
  nextReview: number     // timestamp
  lastReview: number | null
}

// Add to progress store or a separate settings store
interface Settings {
  showRomaji: boolean
  toggleRomaji: () => void
  romajiMode: 'always' | 'reveal' | 'never'  // reveal = tap to show
  setRomajiMode: (mode: Settings['romajiMode']) => void
}

reveal mode is actually the most useful for learning — you see the Japanese, try to read it, then tap to reveal romaji. Since you already know kana, never or reveal will serve you better than always.