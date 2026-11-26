'use client';

import {
  BookOpenCheck,
  Languages,
  MapPinned,
  MessageSquare,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useGoalsStore, reviewsToday, reviewsThisWeek } from '@/store/goals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function GoalsCard({
  scenarioExplored,
  scenarioPhraseTotal,
  scenariosCompleted,
  scenarioTotal,
  flashcardsReviewed,
  flashcardsTotal,
  flashcardsDue,
  kanaReviewed,
  kanaTotal,
  simulatorScenarios,
  simulatorTurns,
}: {
  scenarioExplored: number;
  scenarioPhraseTotal: number;
  scenariosCompleted: number;
  scenarioTotal: number;
  flashcardsReviewed: number;
  flashcardsTotal: number;
  flashcardsDue: number;
  kanaReviewed: number;
  kanaTotal: number;
  simulatorScenarios: number;
  simulatorTurns: number;
}) {
  const dailyGoal = useGoalsStore((s) => s.dailyGoal);
  const setDailyGoal = useGoalsStore((s) => s.setDailyGoal);
  const weeklyGoal = useGoalsStore((s) => s.weeklyGoal);
  const setWeeklyGoal = useGoalsStore((s) => s.setWeeklyGoal);
  const today = useGoalsStore((s) => reviewsToday(s));
  const thisWeek = useGoalsStore((s) => reviewsThisWeek(s));
  const dailyPct = Math.min(100, Math.round((today / dailyGoal) * 100));
  const weeklyPct = Math.min(100, Math.round((thisWeek / weeklyGoal) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" aria-hidden="true" />
          Goals and progress
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <ProgressSection
            icon={MapPinned}
            label="Scenario exploration"
            value={`${scenarioExplored} / ${scenarioPhraseTotal} phrases`}
            detail={`${scenariosCompleted} of ${scenarioTotal} scenarios fully explored`}
            progress={
              scenarioPhraseTotal ? (scenarioExplored / scenarioPhraseTotal) * 100 : 0
            }
          />
          <ProgressSection
            icon={BookOpenCheck}
            label="Flashcards"
            value={`${flashcardsReviewed} / ${flashcardsTotal} phrases`}
            detail={`${flashcardsDue} due for review`}
            progress={flashcardsTotal ? (flashcardsReviewed / flashcardsTotal) * 100 : 0}
          />
          <ProgressSection
            icon={Languages}
            label="Kana practice"
            value={`${kanaReviewed} / ${kanaTotal} characters`}
            detail="Hiragana and katakana reviewed"
            progress={kanaTotal ? (kanaReviewed / kanaTotal) * 100 : 0}
          />
          <ProgressSection
            icon={MessageSquare}
            label="Simulator"
            value={`${simulatorScenarios} scenarios`}
            detail={`${simulatorTurns} user replies across role-play conversations`}
          />
        </div>

        <div className="h-px bg-border" />

        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold">Daily and weekly review goals</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              These targets count SRS reviews across flashcards and kana; progress above
              remains separated by activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <GoalProgress
              period="Daily"
              current={today}
              target={dailyGoal}
              progress={dailyPct}
              onTargetChange={setDailyGoal}
              max={200}
            />
            <GoalProgress
              period="Weekly"
              current={thisWeek}
              target={weeklyGoal}
              progress={weeklyPct}
              onTargetChange={setWeeklyGoal}
              max={1000}
            />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function ProgressSection({
  icon: Icon,
  label,
  value,
  detail,
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {label}
        </span>
        <span className="shrink-0 text-xs font-semibold">{value}</span>
      </div>
      {progress !== undefined && (
        <Progress className="profile-progress h-2" value={Math.min(100, progress)} />
      )}
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function GoalProgress({
  period,
  current,
  target,
  progress,
  onTargetChange,
  max,
}: {
  period: string;
  current: number;
  target: number;
  progress: number;
  onTargetChange: (goal: number) => void;
  max: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>
          {current} of {target} reviews {period === 'Daily' ? 'today' : 'this week'}
          {current >= target && (
            <span className="ml-2 text-primary">Goal reached 🎉</span>
          )}
        </span>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {period}
          <input
            type="number"
            min={1}
            max={max}
            value={target}
            onChange={(event) => onTargetChange(Number(event.target.value) || 1)}
            className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
          />
        </label>
      </div>
      <Progress className="profile-progress h-2.5" value={progress} />
    </div>
  );
}
