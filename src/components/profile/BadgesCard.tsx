'use client'

import { Award, Lock } from 'lucide-react'
import { BADGES, CATEGORY_ICON, CATEGORY_LABEL, isBadgeUnlocked, type BadgeCategory, type BadgeStats } from '@/lib/badges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const CATEGORIES: BadgeCategory[] = ['phrases', 'streak', 'studyDays', 'scenarios', 'simulator']

// Every badge across every category, grouped and shown with its unlocked/locked state. The same
// badges are celebrated with a toast + confetti the moment they're first earned — see
// MilestoneWatcher — so this card is a browsable record of everything earned so far, and a peek
// at what's next.
export function BadgesCard({ stats }: { stats: BadgeStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4" aria-hidden="true" />
          Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {CATEGORIES.map(category => {
          const Icon = CATEGORY_ICON[category]
          const badges = BADGES.filter(b => b.category === category)
          const unlockedCount = badges.filter(b => isBadgeUnlocked(b, stats)).length
          return (
            <div key={category} className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {CATEGORY_LABEL[category]}
                <span className="font-normal text-muted-foreground">
                  ({unlockedCount}/{badges.length})
                </span>
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {badges.map(badge => {
                  const unlocked = isBadgeUnlocked(badge, stats)
                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center',
                        unlocked ? 'gradient-brand' : 'opacity-60'
                      )}
                    >
                      {unlocked ? (
                        <Award className="h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Lock className="h-6 w-6" aria-hidden="true" />
                      )}
                      <span className="text-sm font-semibold">{badge.label}</span>
                      <span className="text-xs text-muted-foreground">{badge.description}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
