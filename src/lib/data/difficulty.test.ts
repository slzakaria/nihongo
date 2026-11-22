import { describe, expect, it } from 'vitest';
import hiragana from './hiragana.json';
import katakana from './katakana.json';
import phrases from './phrases.json';

const validDifficulties = new Set(['easy', 'medium', 'hard', 'expert']);

describe('content difficulty tiers', () => {
  it('uses the four supported tiers for phrase and kana content', () => {
    const records = [
      ...phrases.scenarios.flatMap((scenario) => scenario.phrases),
      ...hiragana.scenarios.flatMap((scenario) => scenario.phrases),
      ...katakana.scenarios.flatMap((scenario) => scenario.phrases),
    ];

    expect(records.filter((record) => !validDifficulties.has(record.difficulty))).toEqual(
      [],
    );
  });

  it('includes all four tiers in the phrase catalog', () => {
    const difficulties = new Set(
      phrases.scenarios.flatMap((scenario) =>
        scenario.phrases.map((phrase) => phrase.difficulty),
      ),
    );

    expect(difficulties).toEqual(new Set(['easy', 'medium', 'hard', 'expert']));
  });
});
