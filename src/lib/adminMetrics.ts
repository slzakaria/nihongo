import { computeStudyStats, dayKey } from '@/lib/activity/studyDays';
import type { SRSGrade } from '@/types';

export type AdminRatingCounts = Record<SRSGrade, number>;

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  phrasesReviewed: number;
  flashcardsCompleted: number;
  accuracyPct: number | null;
  studyStreak: number;
  studyDays: number;
  conversations: number;
  simulatorTurns: number;
  bookmarks: number;
  dueCards: number;
  learningCards: number;
  scenarioPhrasesExplored: number;
  scenariosStarted: number;
  ratings: AdminRatingCounts;
  completedScenarios: string[];
}

export interface AdminScenarioMetrics {
  slug: string;
  label: string;
  usersStarted: number;
  usersCompleted: number;
  flashcardUsers: number;
  simulatorUsers: number;
  phrasesExplored: number;
  reviews: number;
  accuracyPct: number | null;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  activeUsers7d: number;
  activeUsers30d: number;
  newUsers7d: number;
  newUsers30d: number;
  bookmarks: number;
  usersWithBookmarks: number;
  dueCards: number;
  learningCards: number;
  simulatorTurns: number;
  ratings: AdminRatingCounts;
  flow: {
    completedScenarioPairs: number;
    flashcardPairs: number;
    simulatorPairs: number;
    completedToFlashcardsPct: number | null;
    flashcardsToSimulatorPct: number | null;
  };
  scenarios: AdminScenarioMetrics[];
}

interface ProfileRecord {
  id: string;
  user_name: string | null;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

interface CardRecord {
  user_id: string;
  scenario_slug: string;
  last_review: string | null;
  next_review: string;
  interval: number;
  total_reviews: number;
  correct_reviews: number;
}

interface ScenarioProgressRecord {
  user_id: string;
  scenario_slug: string;
  phrase_id: string;
}

interface StudyDayRecord {
  user_id: string;
  day: string;
}

interface ConversationRecord {
  user_id: string;
  scenario_slug: string;
  messages: unknown;
}

interface BookmarkRecord {
  user_id: string;
}

interface ReviewEventRecord {
  user_id: string;
  rating: SRSGrade;
}

interface ScenarioRecord {
  slug: string;
  label: string;
  phraseCount: number;
}

interface AdminMetricsInput {
  profiles: ProfileRecord[];
  cards: CardRecord[];
  scenarioProgress: ScenarioProgressRecord[];
  studyDays: StudyDayRecord[];
  conversations: ConversationRecord[];
  bookmarks: BookmarkRecord[];
  reviewEvents: ReviewEventRecord[];
  scenarios: ScenarioRecord[];
  now?: Date;
}

function emptyRatings(): AdminRatingCounts {
  return { again: 0, hard: 0, good: 0, easy: 0 };
}

function pairKey(userId: string, scenarioSlug: string): string {
  return `${userId}\u0000${scenarioSlug}`;
}

function percentage(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : Math.round((numerator / denominator) * 100);
}

function daysAgo(date: Date, count: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() - count);
  return dayKey(result);
}

function userTurnCount(messages: unknown): number {
  if (!Array.isArray(messages)) return 0;
  return messages.filter(
    (message) =>
      typeof message === 'object' &&
      message !== null &&
      'role' in message &&
      message.role === 'user',
  ).length;
}

export function buildAdminMetrics(input: AdminMetricsInput): {
  users: AdminUserRow[];
  summary: AdminDashboardSummary;
} {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const today = dayKey(now);
  const cutoff7d = daysAgo(now, 6);
  const cutoff30d = daysAgo(now, 29);
  const scenarioBySlug = new Map(
    input.scenarios.map((scenario) => [scenario.slug, scenario]),
  );

  const ratingsByUser = new Map<string, AdminRatingCounts>();
  const totalRatings = emptyRatings();
  for (const event of input.reviewEvents) {
    const userRatings = ratingsByUser.get(event.user_id) ?? emptyRatings();
    userRatings[event.rating]++;
    totalRatings[event.rating]++;
    ratingsByUser.set(event.user_id, userRatings);
  }

  const progressByUser = new Map<string, Map<string, Set<string>>>();
  for (const row of input.scenarioProgress) {
    if (!scenarioBySlug.has(row.scenario_slug)) continue;
    const byScenario = progressByUser.get(row.user_id) ?? new Map();
    const phraseIds = byScenario.get(row.scenario_slug) ?? new Set<string>();
    phraseIds.add(row.phrase_id);
    byScenario.set(row.scenario_slug, phraseIds);
    progressByUser.set(row.user_id, byScenario);
  }

  const completedPairs = new Set<string>();
  const scenarioStartedUsers = new Map<string, Set<string>>();
  const scenarioCompletedUsers = new Map<string, Set<string>>();
  const scenarioPhraseCount = new Map<string, number>();
  for (const [userId, byScenario] of progressByUser) {
    for (const [slug, phraseIds] of byScenario) {
      const started = scenarioStartedUsers.get(slug) ?? new Set<string>();
      started.add(userId);
      scenarioStartedUsers.set(slug, started);
      scenarioPhraseCount.set(
        slug,
        (scenarioPhraseCount.get(slug) ?? 0) + phraseIds.size,
      );

      const scenario = scenarioBySlug.get(slug);
      if (scenario && phraseIds.size >= scenario.phraseCount) {
        completedPairs.add(pairKey(userId, slug));
        const completed = scenarioCompletedUsers.get(slug) ?? new Set<string>();
        completed.add(userId);
        scenarioCompletedUsers.set(slug, completed);
      }
    }
  }

  const reviewedPairs = new Set<string>();
  const flashcardUsersByScenario = new Map<string, Set<string>>();
  const scenarioReviews = new Map<string, { total: number; correct: number }>();
  const reviewedByUser = new Map<string, number>();
  const reviewsByUser = new Map<string, number>();
  const correctByUser = new Map<string, number>();
  const dueByUser = new Map<string, number>();
  const learningByUser = new Map<string, number>();
  let dueCards = 0;
  let learningCards = 0;

  for (const card of input.cards) {
    const reviewedCount = card.last_review ? 1 : 0;
    reviewedByUser.set(
      card.user_id,
      (reviewedByUser.get(card.user_id) ?? 0) + reviewedCount,
    );
    reviewsByUser.set(
      card.user_id,
      (reviewsByUser.get(card.user_id) ?? 0) + card.total_reviews,
    );
    correctByUser.set(
      card.user_id,
      (correctByUser.get(card.user_id) ?? 0) + card.correct_reviews,
    );

    if (Date.parse(card.next_review) <= nowMs) {
      dueCards++;
      dueByUser.set(card.user_id, (dueByUser.get(card.user_id) ?? 0) + 1);
    }
    if (card.interval === 0 && card.last_review !== null) {
      learningCards++;
      learningByUser.set(card.user_id, (learningByUser.get(card.user_id) ?? 0) + 1);
    }

    if (!scenarioBySlug.has(card.scenario_slug)) continue;
    if (card.total_reviews > 0) {
      reviewedPairs.add(pairKey(card.user_id, card.scenario_slug));
      const users = flashcardUsersByScenario.get(card.scenario_slug) ?? new Set<string>();
      users.add(card.user_id);
      flashcardUsersByScenario.set(card.scenario_slug, users);
    }
    const totals = scenarioReviews.get(card.scenario_slug) ?? { total: 0, correct: 0 };
    totals.total += card.total_reviews;
    totals.correct += card.correct_reviews;
    scenarioReviews.set(card.scenario_slug, totals);
  }

  const conversationsByUser = new Map<string, number>();
  const simulatorTurnsByUser = new Map<string, number>();
  const simulatorUsersByScenario = new Map<string, Set<string>>();
  const simulatorPairs = new Set<string>();
  let simulatorTurns = 0;
  for (const conversation of input.conversations) {
    conversationsByUser.set(
      conversation.user_id,
      (conversationsByUser.get(conversation.user_id) ?? 0) + 1,
    );
    const turns = userTurnCount(conversation.messages);
    simulatorTurns += turns;
    simulatorTurnsByUser.set(
      conversation.user_id,
      (simulatorTurnsByUser.get(conversation.user_id) ?? 0) + turns,
    );
    if (turns === 0 || !scenarioBySlug.has(conversation.scenario_slug)) continue;
    simulatorPairs.add(pairKey(conversation.user_id, conversation.scenario_slug));
    const users =
      simulatorUsersByScenario.get(conversation.scenario_slug) ?? new Set<string>();
    users.add(conversation.user_id);
    simulatorUsersByScenario.set(conversation.scenario_slug, users);
  }

  const bookmarksByUser = new Map<string, number>();
  for (const bookmark of input.bookmarks) {
    bookmarksByUser.set(
      bookmark.user_id,
      (bookmarksByUser.get(bookmark.user_id) ?? 0) + 1,
    );
  }

  const daysByUser = new Map<string, Set<string>>();
  for (const row of input.studyDays) {
    const days = daysByUser.get(row.user_id) ?? new Set<string>();
    days.add(row.day);
    daysByUser.set(row.user_id, days);
  }
  const activeUsers7d = new Set<string>();
  const activeUsers30d = new Set<string>();
  for (const [userId, days] of daysByUser) {
    if ([...days].some((day) => day >= cutoff7d && day <= today))
      activeUsers7d.add(userId);
    if ([...days].some((day) => day >= cutoff30d && day <= today))
      activeUsers30d.add(userId);
  }

  const users: AdminUserRow[] = input.profiles.map((profile) => {
    const studyDays = daysByUser.get(profile.id) ?? new Set<string>();
    const byScenario = progressByUser.get(profile.id) ?? new Map();
    const completedScenarios: string[] = [];
    for (const [slug, phraseIds] of byScenario) {
      const scenario = scenarioBySlug.get(slug);
      if (scenario && phraseIds.size >= scenario.phraseCount)
        completedScenarios.push(scenario.label);
    }
    const reviewCount = reviewsByUser.get(profile.id) ?? 0;
    return {
      id: profile.id,
      name: profile.user_name,
      email: profile.email,
      createdAt: profile.created_at,
      lastSignInAt: profile.last_sign_in_at,
      phrasesReviewed: reviewedByUser.get(profile.id) ?? 0,
      flashcardsCompleted: reviewCount,
      accuracyPct: percentage(correctByUser.get(profile.id) ?? 0, reviewCount),
      studyStreak: 0,
      studyDays: studyDays.size,
      conversations: conversationsByUser.get(profile.id) ?? 0,
      simulatorTurns: simulatorTurnsByUser.get(profile.id) ?? 0,
      bookmarks: bookmarksByUser.get(profile.id) ?? 0,
      dueCards: dueByUser.get(profile.id) ?? 0,
      learningCards: learningByUser.get(profile.id) ?? 0,
      scenarioPhrasesExplored: [...byScenario.values()].reduce(
        (total, phrases) => total + phrases.size,
        0,
      ),
      scenariosStarted: byScenario.size,
      ratings: ratingsByUser.get(profile.id) ?? emptyRatings(),
      completedScenarios,
    };
  });

  const scenarioMetrics: AdminScenarioMetrics[] = input.scenarios
    .map((scenario) => {
      const reviewStats = scenarioReviews.get(scenario.slug) ?? { total: 0, correct: 0 };
      return {
        slug: scenario.slug,
        label: scenario.label,
        usersStarted: scenarioStartedUsers.get(scenario.slug)?.size ?? 0,
        usersCompleted: scenarioCompletedUsers.get(scenario.slug)?.size ?? 0,
        flashcardUsers: flashcardUsersByScenario.get(scenario.slug)?.size ?? 0,
        simulatorUsers: simulatorUsersByScenario.get(scenario.slug)?.size ?? 0,
        phrasesExplored: scenarioPhraseCount.get(scenario.slug) ?? 0,
        reviews: reviewStats.total,
        accuracyPct: percentage(reviewStats.correct, reviewStats.total),
      };
    })
    .sort(
      (a, b) => b.usersStarted - a.usersStarted || b.usersCompleted - a.usersCompleted,
    );

  const flashcardPairs = [...completedPairs].filter((pair) => reviewedPairs.has(pair));
  const simulatorPairsInFunnel = flashcardPairs.filter((pair) =>
    simulatorPairs.has(pair),
  );
  const createdAfter = (profile: ProfileRecord, cutoffMs: number) =>
    profile.created_at !== null && Date.parse(profile.created_at) >= cutoffMs;
  const totalBookmarks = input.bookmarks.length;

  return {
    users: users.map((user) => {
      const stats = [...(daysByUser.get(user.id) ?? [])];
      return {
        ...user,
        studyStreak: computeStudyStats(stats, today).streak,
      };
    }),
    summary: {
      totalUsers: input.profiles.length,
      activeUsers7d: activeUsers7d.size,
      activeUsers30d: activeUsers30d.size,
      newUsers7d: input.profiles.filter((profile) =>
        createdAfter(profile, nowMs - 7 * 24 * 60 * 60 * 1000),
      ).length,
      newUsers30d: input.profiles.filter((profile) =>
        createdAfter(profile, nowMs - 30 * 24 * 60 * 60 * 1000),
      ).length,
      bookmarks: totalBookmarks,
      usersWithBookmarks: bookmarksByUser.size,
      dueCards,
      learningCards,
      simulatorTurns,
      ratings: totalRatings,
      flow: {
        completedScenarioPairs: completedPairs.size,
        flashcardPairs: flashcardPairs.length,
        simulatorPairs: simulatorPairsInFunnel.length,
        completedToFlashcardsPct: percentage(flashcardPairs.length, completedPairs.size),
        flashcardsToSimulatorPct: percentage(
          simulatorPairsInFunnel.length,
          flashcardPairs.length,
        ),
      },
      scenarios: scenarioMetrics,
    },
  };
}
