import {
  BookOpenCheck,
  CalendarCheck,
  Flame,
  Languages,
  MapPinned,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import type { Scenario, SRSCard } from '@/types';
import type { ScenarioPhraseProgress } from '@/store/progress';
import { countReviewedKana, countReviewedPhrases } from '@/lib/srs/milestones';
import { computeStudyStats } from '@/lib/activity/studyDays';

export type BadgeCategory =
  'flashcards' | 'kana' | 'streak' | 'studyDays' | 'scenarios' | 'simulator';

export interface BadgeDef {
  id: string;
  category: BadgeCategory;
  threshold: number;
  label: string;
  description: string;
}

export const CATEGORY_ICON: Record<BadgeCategory, LucideIcon> = {
  flashcards: BookOpenCheck,
  kana: Languages,
  streak: Flame,
  studyDays: CalendarCheck,
  scenarios: MapPinned,
  simulator: MessageSquare,
};

export const CATEGORY_LABEL: Record<BadgeCategory, string> = {
  flashcards: 'Flashcard phrases reviewed',
  kana: 'Kana reviewed',
  streak: 'Study streak',
  studyDays: 'Days learning',
  scenarios: 'Scenarios fully explored',
  simulator: 'Simulator conversations',
};

// Every badge in the app, across six categories. Thresholds climb gradually so there's always a
// near-term one to aim for, not just a couple of big round numbers.
export const BADGES: BadgeDef[] = [
  {
    id: 'phrases-10',
    category: 'flashcards',
    threshold: 10,
    label: 'First Steps',
    description: '10 flashcard phrases reviewed',
  },
  {
    id: 'phrases-25',
    category: 'flashcards',
    threshold: 25,
    label: 'Getting Going',
    description: '25 flashcard phrases reviewed',
  },
  {
    id: 'phrases-50',
    category: 'flashcards',
    threshold: 50,
    label: 'Half Century',
    description: '50 flashcard phrases reviewed',
  },
  {
    id: 'phrases-100',
    category: 'flashcards',
    threshold: 100,
    label: 'Centurion',
    description: '100 flashcard phrases reviewed',
  },
  {
    id: 'phrases-250',
    category: 'flashcards',
    threshold: 250,
    label: 'Dedicated',
    description: '250 flashcard phrases reviewed',
  },
  {
    id: 'phrases-500',
    category: 'flashcards',
    threshold: 500,
    label: 'Phrase Master',
    description: '500 flashcard phrases reviewed',
  },
  {
    id: 'kana-10',
    category: 'kana',
    threshold: 10,
    label: 'First Kana',
    description: '10 kana characters reviewed',
  },
  {
    id: 'kana-25',
    category: 'kana',
    threshold: 25,
    label: 'Kana Collector',
    description: '25 kana characters reviewed',
  },
  {
    id: 'kana-50',
    category: 'kana',
    threshold: 50,
    label: 'Kana Reader',
    description: '50 kana characters reviewed',
  },
  {
    id: 'kana-100',
    category: 'kana',
    threshold: 100,
    label: 'Kana Master',
    description: '100 kana characters reviewed',
  },

  {
    id: 'streak-3',
    category: 'streak',
    threshold: 3,
    label: 'Warming Up',
    description: '3-day streak',
  },
  {
    id: 'streak-7',
    category: 'streak',
    threshold: 7,
    label: 'One Week Strong',
    description: '7-day streak',
  },
  {
    id: 'streak-14',
    category: 'streak',
    threshold: 14,
    label: 'Two Weeks In',
    description: '14-day streak',
  },
  {
    id: 'streak-30',
    category: 'streak',
    threshold: 30,
    label: 'Monthly Habit',
    description: '30-day streak',
  },
  {
    id: 'streak-100',
    category: 'streak',
    threshold: 100,
    label: 'Unstoppable',
    description: '100-day streak',
  },

  {
    id: 'days-7',
    category: 'studyDays',
    threshold: 7,
    label: 'A Week of Learning',
    description: '7 days studied',
  },
  {
    id: 'days-30',
    category: 'studyDays',
    threshold: 30,
    label: 'A Month of Learning',
    description: '30 days studied',
  },
  {
    id: 'days-100',
    category: 'studyDays',
    threshold: 100,
    label: 'Seasoned Learner',
    description: '100 days studied',
  },

  {
    id: 'scenarios-1',
    category: 'scenarios',
    threshold: 1,
    label: 'First Scenario',
    description: '1 scenario fully explored',
  },
  {
    id: 'scenarios-5',
    category: 'scenarios',
    threshold: 5,
    label: 'Scenario Explorer',
    description: '5 scenarios fully explored',
  },
  {
    id: 'scenarios-10',
    category: 'scenarios',
    threshold: 10,
    label: 'Scenario Pro',
    description: '10 scenarios fully explored',
  },
  {
    id: 'scenarios-20',
    category: 'scenarios',
    threshold: 20,
    label: 'Scenario Veteran',
    description: '20 scenarios fully explored',
  },

  {
    id: 'simulator-1',
    category: 'simulator',
    threshold: 1,
    label: 'First Conversation',
    description: '1 simulator conversation',
  },
  {
    id: 'simulator-5',
    category: 'simulator',
    threshold: 5,
    label: 'Conversationalist',
    description: '5 simulator conversations',
  },
  {
    id: 'simulator-10',
    category: 'simulator',
    threshold: 10,
    label: 'Fluent Chatter',
    description: '10 simulator conversations',
  },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

export interface BadgeStats {
  flashcards: number;
  kana: number;
  streak: number;
  studyDays: number;
  scenariosCompleted: number;
  conversations: number;
}

function statFor(category: BadgeCategory, stats: BadgeStats): number {
  switch (category) {
    case 'flashcards':
      return stats.flashcards;
    case 'kana':
      return stats.kana;
    case 'streak':
      return stats.streak;
    case 'studyDays':
      return stats.studyDays;
    case 'scenarios':
      return stats.scenariosCompleted;
    case 'simulator':
      return stats.conversations;
  }
}

export function isBadgeUnlocked(badge: BadgeDef, stats: BadgeStats): boolean {
  return statFor(badge.category, stats) >= badge.threshold;
}

export function unlockedBadgeIds(stats: BadgeStats): string[] {
  return BADGES.filter((b) => isBadgeUnlocked(b, stats)).map((b) => b.id);
}

// Shared by MilestoneWatcher (to detect newly-unlocked badges) and BadgesCard (to render
// progress), so both always agree on how each separate activity is counted.
export function computeBadgeStats({
  cards,
  scenarioProgress = {},
  scenarios,
  studyDays,
  conversationCount,
  today,
}: {
  cards: SRSCard[];
  scenarioProgress?: Record<string, ScenarioPhraseProgress>;
  scenarios: Scenario[];
  studyDays: string[];
  conversationCount: number;
  today: string;
}): BadgeStats {
  const reviewed = countReviewedPhrases(cards);
  const kanaReviewed = countReviewedKana(cards);
  const study = computeStudyStats(studyDays, today);

  const scenariosCompleted = scenarios.filter(
    (s) =>
      s.phrases.length > 0 &&
      s.phrases.every((phrase) => scenarioProgress[phrase.id] !== undefined),
  ).length;

  return {
    flashcards: reviewed,
    kana: kanaReviewed,
    streak: study.streak,
    studyDays: study.total,
    scenariosCompleted,
    conversations: conversationCount,
  };
}
