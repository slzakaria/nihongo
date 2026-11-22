'use client';

import { useState } from 'react';
import { Award, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import {
  BADGES,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  isBadgeUnlocked,
  type BadgeCategory,
  type BadgeStats,
} from '@/lib/badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CATEGORIES: BadgeCategory[] = [
  'phrases',
  'streak',
  'studyDays',
  'scenarios',
  'simulator',
];
// How many badges to show before the section is collapsed behind "See more"
const COLLAPSED_COUNT = 6;

function BadgeTile({
  badge,
  stats,
}: {
  badge: (typeof BADGES)[number];
  stats: BadgeStats;
}) {
  const unlocked = isBadgeUnlocked(badge, stats);
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center',
        unlocked ? 'gradient-brand' : 'opacity-60',
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
  );
}

// Every badge across every category, grouped and shown with its unlocked/locked state. The same
// badges are celebrated with a toast + confetti the moment they're first earned — see
// MilestoneWatcher — so this card is a browsable record of everything earned so far, and a peek
// at what's next. Collapsed to the first few badges by default, with a "See more" toggle to reveal
// the full, categorized list.
export function BadgesCard({ stats }: { stats: BadgeStats }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4" aria-hidden="true" />
          Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {expanded ? (
          CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICON[category];
            const badges = BADGES.filter((b) => b.category === category);
            const unlockedCount = badges.filter((b) => isBadgeUnlocked(b, stats)).length;
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
                  {badges.map((badge) => (
                    <BadgeTile key={badge.id} badge={badge} stats={stats} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {BADGES.slice(0, COLLAPSED_COUNT).map((badge) => (
              <BadgeTile key={badge.id} badge={badge} stats={stats} />
            ))}
          </div>
        )}

        {BADGES.length > COLLAPSED_COUNT && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <>
                See less
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                See all {BADGES.length} badges
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
