'use client'

import { Award, Lock, Target } from 'lucide-react'
import { useGoalsStore, reviewsToday } from '@/store/goals'
import { MILESTONES } from '@/lib/srs/milestones'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Daily target, today's progress, and the milestone badges
export function GoalsCard({ reviewed }: { reviewed: number }) {
  const dailyGoal = useGoalsStore(s => s.dailyGoal)
  const setDailyGoal = useGoalsStore(s => s.setDailyGoal)
  const today = useGoalsStore(s => reviewsToday(s))
  const pct = Math.min(100, Math.round((today / dailyGoal) * 100))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" aria-hidden="true" />
          Daily goal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {today} of {dailyGoal} reviews today
              {today >= dailyGoal && <span className="ml-2 text-primary">Goal reached 🎉</span>}
            </span>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Goal
              <input
                type="number"
                min={1}
                max={200}
                value={dailyGoal}
                onChange={e => setDailyGoal(Number(e.target.value) || 1)}
                className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
              />
            </label>
          </div>
          <Progress value={pct} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Award className="h-4 w-4" aria-hidden="true" />
            Badges
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MILESTONES.map(m => {
              const unlocked = reviewed >= m
              return (
                <div
                  key={m}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center',
                    unlocked ? 'gradient-brand' : 'opacity-60'
                  )}
                >
                  {unlocked ? <Award className="h-6 w-6" aria-hidden="true" /> : <Lock className="h-6 w-6" aria-hidden="true" />}
                  <span className="text-sm font-semibold">{m} phrases</span>
                  <span className="text-xs text-muted-foreground">
                    {unlocked ? 'Unlocked' : `${reviewed} / ${m}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
