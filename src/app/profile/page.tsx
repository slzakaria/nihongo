"use client";

import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CalendarCheck,
  Clock,
  Flame,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useProgressStore } from "@/store/progress";
import { useContentStore } from "@/lib/data/content";
import { getAllPhrases } from "@/lib/data/phrases";
import { computeStudyStats, dayKey } from "@/lib/activity/studyDays";
import { countReviewedPhrases } from "@/lib/srs/milestones";
import { effectiveToday } from "@/lib/srs/streakFreeze";
import { computeBadgeStats } from "@/lib/badges";
import { GoalsCard } from "@/components/profile/GoalsCard";
import { BadgesCard } from "@/components/profile/BadgesCard";
import {
  fetchConversationSummaries,
  type ConversationSummary,
} from "@/lib/supabase/simulator";
import { fetchStudyDays } from "@/lib/supabase/activity";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { AccountCard } from "@/components/profile/AccountCard";
import { PreferencesCard } from "@/components/profile/PreferencesCard";
import { StreakFreezeCard } from "@/components/profile/StreakFreezeCard";
import { DangerZoneCard } from "@/components/profile/DangerZoneCard";
import { AdminUsersCard } from "@/components/profile/AdminUsersCard";
import { BookmarksCard } from "@/components/profile/BookmarksCard";
import { useOnboardingStore } from "@/store/onboarding";
import { useStreakStore } from "@/store/streak";
import { isAdminEmail } from "@/lib/admin";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const userName = useOnboardingStore((s) => s.userName);
  const cards = useProgressStore((s) => s.cards);
  const scenarios = useContentStore((s) => s.content.phrases);
  const freezeUntil = useStreakStore((s) => s.freezeUntil);
  const [now] = useState(() => Date.now());
  const [conversations, setConversations] = useState<
    ConversationSummary[] | null
  >(null);
  const [studyDays, setStudyDays] = useState<string[] | null>(null);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    void fetchConversationSummaries(userId).then(setConversations);
    void fetchStudyDays(userId).then(setStudyDays);
  }, [userId]);

  const allCards = Object.values(cards);
  const totalPhrases = getAllPhrases().length;
  const reviewed = countReviewedPhrases(allCards);
  const due = allCards.filter((c) => c.nextReview <= now).length;
  const overallPct =
    totalPhrases === 0 ? 0 : Math.round((reviewed / totalPhrases) * 100);
  const realToday = dayKey(new Date(now));
  const streakToday = effectiveToday(studyDays ?? [], realToday, freezeUntil);
  const study = computeStudyStats(studyDays ?? [], streakToday);
  const practisedScenarios = conversations?.length ?? 0;
  const badgeStats = computeBadgeStats({
    cards: allCards,
    scenarios,
    studyDays: studyDays ?? [],
    conversationCount: practisedScenarios,
    today: realToday,
  });

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-2 px-4 py-20 text-center">
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
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader
        title={userName ? `${userName}'s profile` : "Your profile"}
        description="Your account, progress, goals and preferences, all in one place."
      />

      <AccountCard />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile
          icon={BookOpenCheck}
          label="Phrases reviewed"
          value={`${overallPct}%`}
          detail={`${reviewed} of ${totalPhrases}`}
        />
        <StatTile
          icon={Clock}
          label="Due now"
          value={String(due)}
          detail="flashcards waiting"
        />
        <StatTile
          icon={Flame}
          label="Current streak"
          value={String(study.streak)}
          detail={study.streak === 1 ? "day in a row" : "days in a row"}
        />
        <StatTile
          icon={CalendarCheck}
          label="Days learning"
          value={String(study.total)}
          detail={study.total === 1 ? "day studied" : "days studied"}
        />
        <StatTile
          icon={MessageSquare}
          label="Simulator"
          value={String(practisedScenarios)}
          detail={
            practisedScenarios === 1
              ? "scenario practised"
              : "scenarios practised"
          }
        />
      </div>

      <GoalsCard
        reviewed={countReviewedPhrases(allCards)}
        totalPhrases={totalPhrases}
        due={due}
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
