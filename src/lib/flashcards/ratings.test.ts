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
      { label: 'Again', grade: 0, shortcut: '1' },
      { label: 'Hard', grade: 2, shortcut: '2' },
      { label: 'Medium', grade: 3, shortcut: '3' },
      { label: 'Easy', grade: 4, shortcut: '4' },
      { label: 'Expert', grade: 5, shortcut: '5' },
    ]);
  });
});
