export interface PhraseResponse {
  japanese: string;
  // Original kanji form, shown as a reference alongside romaji — `japanese` itself
  // is hiragana-only so the TTS API reads it with the correct pronunciation.
  kanji?: string;
  romaji: string;
  english: string;
  listen_for: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Phrase {
  id: string;
  japanese: string;
  kanji?: string;
  romaji: string;
  english: string;
  difficulty: Difficulty;
  notes: string;
  responses: PhraseResponse[];
}

export interface Scenario {
  slug: string;
  label: string;
  icon: string;
  phrases: Phrase[];
}

// SRS card wraps a phrase with scheduling metadata
export interface SRSCard {
  phraseId: string;
  scenarioSlug: string;
  interval: number; // whole days until review; zero indicates a learning step
  repetitions: number; // consecutive Good/Easy reviews
  easeFactor: number; // retained for compatibility with stored cards
  nextReview: number; // timestamp
  lastReview: number | null;
  totalReviews: number; // total graded reviews ever, pass or fail — unlike `repetitions` this never resets
  correctReviews: number; // total Good/Easy reviews — never resets, for accuracy stats
}

export type SRSGrade = 'again' | 'hard' | 'good' | 'easy';

export type RomajiMode = 'always' | 'reveal' | 'never';

export type TtsSpeed = 1 | 0.75 | 0.5;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
