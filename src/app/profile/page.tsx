'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useProgressStore } from '@/store/progress'
import { getAllPhrases } from '@/lib/data/phrases'
import { useContentStore } from '@/lib/data/content'
import { computeStudyStats, dayKey } from '@/lib/activity/studyDays'
import { countReviewedPhrases } from '@/lib/srs/milestones'
import { GoalsCard } from '@/components/profile/GoalsCard'
import { fetchConversationSummaries, type ConversationSummary } from '@/lib/supabase/simulator'
import { fetchStudyDays } from '@/lib/supabase/activity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AccountCard } from '@/components/profile/AccountCard'
import { ProgressTabs } from '@/components/profile/ProgressTabs'
import { useOnboardingStore } from '@/store/onboarding'

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)
  const userName = useOnboardingStore(s => s.userName)
  const cards = useProgressStore(s => s.cards)
  const scenarios = useContentStore(s => s.content.phrases)
  const [now] = useState(() => Date.now())
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null)
  const [studyDays, setStudyDays] = useState<string[] | null>(null)

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    void fetchConversationSummaries(userId).then(setConversations)
    void fetchStudyDays(userId).then(setStudyDays)
  }, [userId])

  const allCards = Object.values(cards)
  const totalPhrases = getAllPhrases().length
  const reviewed = countReviewedPhrases(allCards)
  const due = allCards.filter(c => c.nextReview <= now).length
  const overallPct = totalPhrases === 0 ? 0 : Math.round((reviewed / totalPhrases) * 100)
  const study = computeStudyStats(studyDays ?? [], dayKey(new Date(now)))
  const practisedScenarios = conversations?.length ?? 0

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-2 px-4 py-20 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Sign in to view your progress</h1>
        <p className="text-sm text-muted-foreground">
          Use the account menu in the navbar to sign in and track your phrases.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader
        title={userName ? `${userName}'s profile` : 'Your profile'}
        description="Your account, and how far you have got in every scenario, flashcard deck and simulator conversation."
      />

      <AccountCard />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile label="Phrases reviewed" value={`${overallPct}%`} detail={`${reviewed} of ${totalPhrases}`} />
        <StatTile label="Due now" value={String(due)} detail="flashcards waiting" />
        <StatTile
          label="Current streak"
          value={String(study.streak)}
          detail={study.streak === 1 ? 'day in a row' : 'days in a row'}
        />
        <StatTile
          label="Days learning"
          value={String(study.total)}
          detail={study.total === 1 ? 'day studied' : 'days studied'}
        />
        <StatTile
          label="Simulator"
          value={String(practisedScenarios)}
          detail={practisedScenarios === 1 ? 'scenario practised' : 'scenarios practised'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Progress value={overallPct} />
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {reviewed} / {totalPhrases} phrases reviewed ({overallPct}%)
            </span>
            {due > 0 && <Badge variant="secondary">{due} due now</Badge>}
          </div>
        </CardContent>
      </Card>

      <GoalsCard reviewed={countReviewedPhrases(allCards)} />

      <ProgressTabs cards={allCards} scenarios={scenarios} conversations={conversations} now={now} />
    </div>
  )
}

function StatTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </CardContent>
    </Card>
  )
}
