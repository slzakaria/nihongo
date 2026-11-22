import { describe, it, expect } from 'vitest';
import { mergeCards } from './merge';
import { createCard } from './sm2';

describe('mergeCards', () => {
  it('returns server cards untouched when local has nothing new', () => {
    const server = { 'gr-01': createCard('gr-01', 'greetings') };
    const { merged, localOnly } = mergeCards(server, {});
    expect(merged).toEqual(server);
    expect(localOnly).toEqual([]);
  });

  it('adds local-only cards not present on the server', () => {
    const server = { 'gr-01': createCard('gr-01', 'greetings') };
    const local = {
      'gr-01': createCard('gr-01', 'greetings'),
      'gr-02': createCard('gr-02', 'greetings'),
    };
    const { merged, localOnly } = mergeCards(server, local);
    expect(Object.keys(merged).sort()).toEqual(['gr-01', 'gr-02']);
    expect(localOnly.map((c) => c.phraseId)).toEqual(['gr-02']);
  });

  it('keeps the server card when its review is at least as recent', () => {
    const serverCard = { ...createCard('gr-01', 'greetings'), repetitions: 5 };
    const localCard = { ...createCard('gr-01', 'greetings'), repetitions: 1 };
    const { merged } = mergeCards({ 'gr-01': serverCard }, { 'gr-01': localCard });
    expect(merged['gr-01'].repetitions).toBe(5);
  });

  it('keeps newer guest progress when merging after offline practice', () => {
    const serverCard = {
      ...createCard('gr-01', 'greetings'),
      lastReview: 1_000,
      repetitions: 2,
    };
    const localCard = {
      ...createCard('gr-01', 'greetings'),
      lastReview: 2_000,
      repetitions: 3,
    };
    const { merged, localOnly } = mergeCards(
      { 'gr-01': serverCard },
      { 'gr-01': localCard },
    );
    expect(merged['gr-01']).toEqual(localCard);
    expect(localOnly).toEqual([localCard]);
  });
});
