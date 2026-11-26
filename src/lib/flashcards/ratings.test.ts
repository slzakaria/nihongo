import { describe, expect, it } from 'vitest';
import { FLASHCARD_RATINGS } from './ratings';

describe('flashcard ratings', () => {
  it('keeps the approved rating labels, grades, and shortcuts aligned', () => {
    expect(
      FLASHCARD_RATINGS.map(({ label, grade, shortcut }) => ({
        label,
        grade,
        shortcut,
      })),
    ).toEqual([
      { label: 'Again', grade: 'again', shortcut: '1' },
      { label: 'Hard', grade: 'hard', shortcut: '2' },
      { label: 'Good', grade: 'good', shortcut: '3' },
      { label: 'Easy', grade: 'easy', shortcut: '4' },
    ]);
  });
});
