'use client';

import { useEffect, useState } from 'react';
import {
  BookOpenCheck,
  CalendarCheck,
  Clock,
  Flame,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import { loadKana, useContentStore } from '@/lib/data/content';
import { computeStudyStats, dayKey } from '@/lib/activity/studyDays';
import { countReviewedKana, countReviewedPhrases } from '@/lib/srs/milestones';
import { effectiveToday } from '@/lib/srs/streakFreeze';
import { computeBadgeStats } from '@/lib/badges';
import { GoalsCard } from '@/components/profile/GoalsCard';
import { BadgesCard } from '@/components/profile/BadgesCard';
import {
  fetchConversationSummaries,
  type ConversationSummary,
} from '@/lib/supabase/simulator';
import { fetchStudyDays } from '@/lib/supabase/activity';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { FloatingPhrases } from '@/components/marketing/FloatingPhrases';
import { AccountCard } from '@/components/profile/AccountCard';
import { PreferencesCard } from '@/components/profile/PreferencesCard';
import { StreakFreezeCard } from '@/components/profile/StreakFreezeCard';
import { DangerZoneCard } from '@/components/profile/DangerZoneCard';
import { AdminUsersCard } from '@/components/profile/AdminUsersCard';
import { BookmarksCard } from '@/components/profile/BookmarksCard';
import { useOnboardingStore } from '@/store/onboarding';
import { useStreakStore } from '@/store/streak';
import { isAdminEmail } from '@/lib/admin';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const userName = useOnboardingStore((s) => s.userName);
  const cards = useProgressStore((s) => s.cards);
  const scenarioProgress = useProgressStore((s) => s.scenarioProgress ?? {});
  const scenarios = useContentStore((s) => s.content.phrases);
  const hiragana = useContentStore((s) => s.content.hiragana);
  const katakana = useContentStore((s) => s.content.katakana);
  const freezeUntil = useStreakStore((s) => s.freezeUntil);
  const [now] = useState(() => Date.now());
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [studyDays, setStudyDays] = useState<string[] | null>(null);

  const userId = user?.id;
  useEffect(() => {
    void loadKana().catch((error) =>
      console.error('Unable to load kana progress data.', error),
    );
  }, []);

  useEffect(() => {
    if (!userId) return;
    void fetchConversationSummaries(userId).then(setConversations);
    void fetchStudyDays(userId).then(setStudyDays);
  }, [userId]);

  const allCards = Object.values(cards);
  const totalPhrases = scenarios.reduce(
    (total, scenario) => total + scenario.phrases.length,
    0,
  );
  const scenarioPhraseIds = new Set(
    scenarios.flatMap((scenario) => scenario.phrases.map((p) => p.id)),
  );
  const scenarioExplored = [...scenarioPhraseIds].filter(
    (id) => scenarioProgress[id],
  ).length;
  const scenariosCompleted = scenarios.filter(
    (scenario) =>
      scenario.phrases.length > 0 &&
      scenario.phrases.every((phrase) => scenarioProgress[phrase.id]),
  ).length;
  const reviewed = countReviewedPhrases(allCards);
  const due = allCards.filter(
    (card) => !card.scenarioSlug.startsWith('kana:') && card.nextReview <= now,
  ).length;
  const flashcardPct =
    totalPhrases === 0 ? 0 : Math.round((reviewed / totalPhrases) * 100);
  const kanaReviewed = countReviewedKana(allCards);
  const kanaTotal = [...hiragana, ...katakana].reduce(
    (total, row) => total + row.phrases.length,
    0,
  );
  const simulatorTurns = (conversations ?? []).reduce(
    (total, conversation) => total + conversation.userTurns,
    0,
  );
  const realToday = dayKey(new Date(now));
  const streakToday = effectiveToday(studyDays ?? [], realToday, freezeUntil);
  const study = computeStudyStats(studyDays ?? [], streakToday);
  const practisedScenarios = conversations?.length ?? 0;
  const badgeStats = computeBadgeStats({
    cards: allCards,
    scenarioProgress,
    scenarios,
    studyDays: studyDays ?? [],
    conversationCount: practisedScenarios,
    today: realToday,
  });

  if (!user) {
    return (
      <div className="profile-page mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-2 px-4 py-20 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Sign in to view your progress
        </h1>
        <p className="text-sm text-muted-foreground">
          Use the account menu in the navbar to sign in and track your phrases.
        </p>
      </div>
    );
  }

  return (
    <div className="profile-page relative isolate mx-auto flex w-full max-w-[67.2rem] flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:w-4/5 lg:max-w-none">
      <FloatingPhrases />
      <PageHeader
        title={userName ? `${userName}'s profile` : 'Your profile'}
        description="Your account, progress, goals and preferences, all in one place."
      />

      <AccountCard />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile
          icon={BookOpenCheck}
          label="Flashcards"
          value={`${flashcardPct}%`}
          detail={`${reviewed} of ${totalPhrases}`}
        />
        <StatTile
          icon={Clock}
          label="Due flashcards"
          value={String(due)}
          detail="waiting for review"
        />
        <StatTile
          icon={Flame}
          label="Current streak"
          value={String(study.streak)}
          detail={study.streak === 1 ? 'day in a row' : 'days in a row'}
        />
        <StatTile
          icon={CalendarCheck}
          label="Days learning"
          value={String(study.total)}
          detail={study.total === 1 ? 'day studied' : 'days studied'}
        />
        <StatTile
          icon={MessageSquare}
          label="Simulator"
          value={String(practisedScenarios)}
          detail={practisedScenarios === 1 ? 'scenario practised' : 'scenarios practised'}
        />
      </div>

      <GoalsCard
        scenarioExplored={scenarioExplored}
        scenarioPhraseTotal={scenarioPhraseIds.size}
        scenariosCompleted={scenariosCompleted}
        scenarioTotal={scenarios.length}
        flashcardsReviewed={reviewed}
        flashcardsTotal={totalPhrases}
        flashcardsDue={due}
        kanaReviewed={kanaReviewed}
        kanaTotal={kanaTotal}
        simulatorScenarios={practisedScenarios}
        simulatorTurns={simulatorTurns}
      />

      <BookmarksCard />

      <BadgesCard stats={badgeStats} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PreferencesCard />
        <StreakFreezeCard userId={user.id} />
      </div>

      {isAdminEmail(user.email) && <AdminUsersCard />}

      <DangerZoneCard />
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </span>
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </CardContent>
    </Card>
  );
}
