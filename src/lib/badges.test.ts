import { describe, expect, it } from 'vitest';
import type { Scenario } from '@/types';
import { createCard } from '@/lib/srs/scheduler';
import { computeBadgeStats } from '@/lib/badges';

const scenario: Scenario = {
  slug: 'greetings',
  label: 'Greetings',
  icon: '',
  phrases: [
    {
      id: 'greeting-1',
      japanese: 'こんにちは',
      romaji: 'konnichiwa',
      english: 'Hello',
      difficulty: 'easy',
      notes: '',
      responses: [],
    },
  ],
};

describe('scenario completion badges', () => {
  it('does not count flashcard reviews as scenario exploration', () => {
    const card = { ...createCard('greeting-1', 'greetings'), lastReview: Date.now() };
    const stats = computeBadgeStats({
      cards: [card],
      scenarioProgress: {},
      scenarios: [scenario],
      studyDays: [],
      conversationCount: 0,
      today: '2026-11-26',
    });

    expect(stats.flashcards).toBe(1);
    expect(stats.kana).toBe(0);
    expect(stats.scenariosCompleted).toBe(0);
  });

  it('handles progress stores hydrated from an older persisted shape', () => {
    const card = { ...createCard('greeting-1', 'greetings'), lastReview: Date.now() };
    const stats = computeBadgeStats({
      cards: [card],
      scenarios: [scenario],
      studyDays: [],
      conversationCount: 0,
      today: '2026-11-26',
    });

    expect(stats.scenariosCompleted).toBe(0);
  });

  it('counts completed scenario phrases independently', () => {
    const stats = computeBadgeStats({
      cards: [],
      scenarioProgress: {
        'greeting-1': { scenarioSlug: 'greetings', exploredAt: Date.now() },
      },
      scenarios: [scenario],
      studyDays: [],
      conversationCount: 0,
      today: '2026-11-26',
    });

    expect(stats.flashcards).toBe(0);
    expect(stats.scenariosCompleted).toBe(1);
  });

  it('counts kana reviews separately from flashcards', () => {
    const kanaCard = {
      ...createCard('hira-001', 'kana:a-row'),
      lastReview: Date.now(),
    };
    const stats = computeBadgeStats({
      cards: [kanaCard],
      scenarioProgress: {},
      scenarios: [scenario],
      studyDays: [],
      conversationCount: 0,
      today: '2026-11-26',
    });

    expect(stats.flashcards).toBe(0);
    expect(stats.kana).toBe(1);
  });
});
