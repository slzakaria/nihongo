import { describe, expect, it } from 'vitest';
import { dayKey } from '@/lib/activity/studyDays';
import { buildAdminMetrics } from './adminMetrics';

describe('admin learning metrics', () => {
  it('aggregates retention, bookmarks, SRS ratings, queue state, and same-scenario flow', () => {
    const now = new Date('2026-11-26T12:00:00');
    const today = dayKey(now);
    const oldDay = dayKey(new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000));
    const result = buildAdminMetrics({
      now,
      profiles: [
        {
          id: 'user-1',
          user_name: 'One',
          email: null,
          created_at: now.toISOString(),
          last_sign_in_at: now.toISOString(),
        },
        {
          id: 'user-2',
          user_name: 'Two',
          email: null,
          created_at: null,
          last_sign_in_at: null,
        },
      ],
      scenarios: [{ slug: 'restaurant', label: 'Restaurant', phraseCount: 2 }],
      scenarioProgress: [
        { user_id: 'user-1', scenario_slug: 'restaurant', phrase_id: 'r-1' },
        { user_id: 'user-1', scenario_slug: 'restaurant', phrase_id: 'r-2' },
        { user_id: 'user-2', scenario_slug: 'restaurant', phrase_id: 'r-1' },
      ],
      cards: [
        {
          user_id: 'user-1',
          scenario_slug: 'restaurant',
          last_review: now.toISOString(),
          next_review: new Date(now.getTime() - 1_000).toISOString(),
          interval: 0,
          total_reviews: 3,
          correct_reviews: 2,
        },
        {
          user_id: 'user-2',
          scenario_slug: 'restaurant',
          last_review: null,
          next_review: new Date(now.getTime() + 60_000).toISOString(),
          interval: 0,
          total_reviews: 0,
          correct_reviews: 0,
        },
      ],
      studyDays: [
        { user_id: 'user-1', day: today },
        { user_id: 'user-2', day: oldDay },
      ],
      conversations: [
        {
          user_id: 'user-1',
          scenario_slug: 'restaurant',
          messages: [
            { role: 'user', content: 'private user text' },
            { role: 'assistant', content: 'private assistant text' },
            { role: 'user', content: 'another turn' },
          ],
        },
      ],
      bookmarks: [{ user_id: 'user-1' }, { user_id: 'user-1' }],
      reviewEvents: [
        { user_id: 'user-1', rating: 'again' },
        { user_id: 'user-1', rating: 'hard' },
        { user_id: 'user-1', rating: 'good' },
      ],
    });

    expect(result.summary).toMatchObject({
      totalUsers: 2,
      activeUsers7d: 1,
      activeUsers30d: 1,
      newUsers7d: 1,
      newUsers30d: 1,
      bookmarks: 2,
      usersWithBookmarks: 1,
      dueCards: 1,
      learningCards: 1,
      simulatorTurns: 2,
      ratings: { again: 1, hard: 1, good: 1, easy: 0 },
      flow: {
        completedScenarioPairs: 1,
        flashcardPairs: 1,
        simulatorPairs: 1,
        completedToFlashcardsPct: 100,
        flashcardsToSimulatorPct: 100,
      },
    });
    expect(result.users[0]).toMatchObject({
      id: 'user-1',
      flashcardsCompleted: 3,
      accuracyPct: 67,
      bookmarks: 2,
      dueCards: 1,
      learningCards: 1,
      simulatorTurns: 2,
      scenariosStarted: 1,
      scenarioPhrasesExplored: 2,
      completedScenarios: ['Restaurant'],
    });
    expect(result.summary.scenarios[0]).toMatchObject({
      slug: 'restaurant',
      usersStarted: 2,
      usersCompleted: 1,
      flashcardUsers: 1,
      simulatorUsers: 1,
      phrasesExplored: 3,
      reviews: 3,
      accuracyPct: 67,
    });
  });
});
