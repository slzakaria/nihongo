import {
  BookOpenCheck,
  CalendarCheck,
  Flame,
  MapPinned,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import type { Scenario, SRSCard } from '@/types';
import { countReviewedPhrases } from '@/lib/srs/milestones';
import { computeStudyStats } from '@/lib/activity/studyDays';

export type BadgeCategory =
  'phrases' | 'streak' | 'studyDays' | 'scenarios' | 'simulator';

export interface BadgeDef {
  id: string;
  category: BadgeCategory;
  threshold: number;
  label: string;
  description: string;
}

export const CATEGORY_ICON: Record<BadgeCategory, LucideIcon> = {
  phrases: BookOpenCheck,
  streak: Flame,
  studyDays: CalendarCheck,
  scenarios: MapPinned,
  simulator: MessageSquare,
};

export const CATEGORY_LABEL: Record<BadgeCategory, string> = {
  phrases: 'Phrases reviewed',
  streak: 'Study streak',
  studyDays: 'Days learning',
  scenarios: 'Scenarios completed',
  simulator: 'Simulator conversations',
};

// Every badge in the app, across five categories. Thresholds climb gradually so there's always a
// near-term one to aim for, not just a couple of big round numbers.
export const BADGES: BadgeDef[] = [
  {
    id: 'phrases-10',
    category: 'phrases',
    threshold: 10,
    label: 'First Steps',
    description: '10 phrases reviewed',
  },
  {
    id: 'phrases-25',
    category: 'phrases',
    threshold: 25,
    label: 'Getting Going',
    description: '25 phrases reviewed',
  },
  {
    id: 'phrases-50',
    category: 'phrases',
    threshold: 50,
    label: 'Half Century',
    description: '50 phrases reviewed',
  },
  {
    id: 'phrases-100',
    category: 'phrases',
    threshold: 100,
    label: 'Centurion',
    description: '100 phrases reviewed',
  },
  {
    id: 'phrases-250',
    category: 'phrases',
    threshold: 250,
    label: 'Dedicated',
    description: '250 phrases reviewed',
  },
  {
    id: 'phrases-500',
    category: 'phrases',
    threshold: 500,
    label: 'Phrase Master',
    description: '500 phrases reviewed',
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
    description: '1 scenario completed',
  },
  {
    id: 'scenarios-5',
    category: 'scenarios',
    threshold: 5,
    label: 'Scenario Explorer',
    description: '5 scenarios completed',
  },
  {
    id: 'scenarios-10',
    category: 'scenarios',
    threshold: 10,
    label: 'Scenario Pro',
    description: '10 scenarios completed',
  },
  {
    id: 'scenarios-20',
    category: 'scenarios',
    threshold: 20,
    label: 'Scenario Veteran',
    description: '20 scenarios completed',
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
  phrases: number;
  streak: number;
  studyDays: number;
  scenariosCompleted: number;
  conversations: number;
}

function statFor(category: BadgeCategory, stats: BadgeStats): number {
  switch (category) {
    case 'phrases':
      return stats.phrases;
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
// progress), so both always agree on exactly how "scenarios completed" etc. are counted.
export function computeBadgeStats({
  cards,
  scenarios,
  studyDays,
  conversationCount,
  today,
}: {
  cards: SRSCard[];
  scenarios: Scenario[];
  studyDays: string[];
  conversationCount: number;
  today: string;
}): BadgeStats {
  const reviewed = countReviewedPhrases(cards);
  const study = computeStudyStats(studyDays, today);

  const reviewedByScenario = new Map<string, number>();
  for (const c of cards) {
    if (!c.lastReview || c.scenarioSlug.startsWith('kana:')) continue;
    reviewedByScenario.set(
      c.scenarioSlug,
      (reviewedByScenario.get(c.scenarioSlug) ?? 0) + 1,
    );
  }
  const scenariosCompleted = scenarios.filter(
    (s) =>
      s.phrases.length > 0 && (reviewedByScenario.get(s.slug) ?? 0) >= s.phrases.length,
  ).length;

  return {
    phrases: reviewed,
    streak: study.streak,
    studyDays: study.total,
    scenariosCompleted,
    conversations: conversationCount,
  };
}
