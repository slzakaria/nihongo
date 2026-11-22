'use client';

import { Target } from 'lucide-react';
import { useGoalsStore, reviewsToday, reviewsThisWeek } from '@/store/goals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Overall progress plus daily and weekly targets — one combined card rather than a separate
// "Overall" card above it. Badges now live in their own BadgesCard, since there are enough of
// them now to want their own dedicated section.
export function GoalsCard({
  reviewed,
  totalPhrases,
  due,
}: {
  reviewed: number;
  totalPhrases: number;
  due: number;
}) {
  const dailyGoal = useGoalsStore((s) => s.dailyGoal);
  const setDailyGoal = useGoalsStore((s) => s.setDailyGoal);
  const weeklyGoal = useGoalsStore((s) => s.weeklyGoal);
  const setWeeklyGoal = useGoalsStore((s) => s.setWeeklyGoal);
  const today = useGoalsStore((s) => reviewsToday(s));
  const thisWeek = useGoalsStore((s) => reviewsThisWeek(s));
  const dailyPct = Math.min(100, Math.round((today / dailyGoal) * 100));
  const weeklyPct = Math.min(100, Math.round((thisWeek / weeklyGoal) * 100));
  const overallPct = totalPhrases === 0 ? 0 : Math.round((reviewed / totalPhrases) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" aria-hidden="true" />
          Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall progress</span>
            {due > 0 && <Badge variant="secondary">{due} due now</Badge>}
          </div>
          <Progress className="profile-progress h-2.5" value={overallPct} />
          <p className="text-xs text-muted-foreground">
            {reviewed} / {totalPhrases} phrases reviewed ({overallPct}%)
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {today} of {dailyGoal} reviews today
              {today >= dailyGoal && (
                <span className="ml-2 text-primary">Goal reached 🎉</span>
              )}
            </span>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Daily
              <input
                type="number"
                min={1}
                max={200}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value) || 1)}
                className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
              />
            </label>
          </div>
          <Progress className="profile-progress h-2.5" value={dailyPct} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {thisWeek} of {weeklyGoal} reviews this week
              {thisWeek >= weeklyGoal && (
                <span className="ml-2 text-primary">Goal reached 🎉</span>
              )}
            </span>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Weekly
              <input
                type="number"
                min={1}
                max={1000}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value) || 1)}
                className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
              />
            </label>
          </div>
          <Progress className="profile-progress h-2.5" value={weeklyPct} />
        </div>
      </CardContent>
    </Card>
  );
}
