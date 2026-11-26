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
  interval: number; // days until next review
  repetitions: number; // times answered correctly in a row
  easeFactor: number; // SM-2 ease factor (starts at 2.5)
  nextReview: number; // timestamp
  lastReview: number | null;
  totalReviews: number; // total graded reviews ever, pass or fail — unlike `repetitions` this never resets
  correctReviews: number; // total graded reviews that passed (grade >= 3) — never resets, for accuracy stats
}

export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

export type RomajiMode = 'always' | 'reveal' | 'never';

export type TtsSpeed = 1 | 0.75 | 0.5;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
