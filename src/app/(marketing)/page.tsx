'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Bot, Languages, Layers, MessagesSquare, Search, TrendingUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { LinkCard } from '@/components/ui/link-card'
import { Progress } from '@/components/ui/progress'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { useProgressStore } from '@/store/progress'
import { useAuthStore } from '@/store/auth'
import { useContentStore } from '@/lib/data/content'
import { cn } from '@/lib/utils'

// Scenarios most travellers need first. Shown on the landing page; the full list lives on /scenarios.
const FEATURED_SLUGS = ['greetings', 'restaurant', 'shopping', 'getting-around', 'bar-cocktails', 'hotel']

const EXPLORE_TILES = [
  { href: '/scenarios', label: 'Scenarios', description: 'Phrases for real situations, from bars to banks.', icon: MessagesSquare, tone: 'bg-primary/30' },
  { href: '/kana', label: 'Kana (Alphabet)', description: 'Learn hiragana and katakana one character at a time.', icon: Languages, tone: 'bg-secondary/40' },
  { href: '/flashcards', label: 'Flashcards', description: 'Spaced-repetition drills that bring phrases back when you need them.', icon: Layers, tone: 'bg-accent' },
  { href: '/simulator', label: 'Simulator', description: 'Practice a live conversation with a Japanese role-play partner.', icon: Bot, tone: 'bg-primary/20' },
  { href: '/search', label: 'Search', description: 'Find any phrase, word or translation in seconds.', icon: Search, tone: 'bg-secondary/30' },
]

export default function Home() {
  const cards = useProgressStore(s => s.cards)
  const user = useAuthStore(s => s.user)
  const scenarios = useContentStore(s => s.content.phrases)

  const totalPhrases = useMemo(
    () => scenarios.reduce((sum, s) => sum + s.phrases.length, 0),
    [scenarios]
  )
  const reviewedCount = useMemo(
    () => Object.values(cards).filter(c => c.lastReview !== null).length,
    [cards]
  )
  const overallPct = totalPhrases === 0 ? 0 : Math.round((reviewedCount / totalPhrases) * 100)

  const featured = useMemo(
    () =>
      FEATURED_SLUGS.map(slug => scenarios.find(s => s.slug === slug)).filter(
        (s): s is (typeof scenarios)[number] => Boolean(s)
      ),
    [scenarios]
  )

  const tiles = user
    ? [...EXPLORE_TILES, { href: '/profile', label: 'Progress', description: 'See how far you have come and what to review next.', icon: TrendingUp, tone: 'bg-accent' }]
    : EXPLORE_TILES

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6">
      <section className="gradient-brand relative overflow-hidden rounded-3xl p-8 sm:p-12">
        <div className="flex max-w-2xl flex-col items-start gap-4">
          <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="text-primary-foreground dark:text-primary">はなぞの : Hanazono <br></br>
						</span> Survival Japanese for your trip
          </h1>
          <p className="animate-fade-up text-muted-foreground" style={{ animationDelay: '120ms' }}>
            Phrases for real situations, spaced-repetition drills, and a live chat simulator. Everything
            you need for bars, shops, and small talk in Japan.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button asChild className="cursor-pointer">
              <Link href="/flashcards">Start Flashcards</Link>
            </Button>
            <Button asChild className="cursor-pointer">
              <Link href="/scenarios">Browse Scenarios</Link>
            </Button>
          </div>
        </div>
        <div className="mt-8 flex max-w-md flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Your progress</span>
            <span className="text-muted-foreground">
              {reviewedCount} / {totalPhrases} phrases reviewed
            </span>
          </div>
          <Progress value={overallPct} />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Explore</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, i) => {
            const Icon = tile.icon
            return (
              <LinkCard key={tile.href} href={tile.href} index={i}>
                <CardContent className="flex flex-col gap-3 p-5">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-full transition duration-300 group-hover:-rotate-6 group-hover:scale-110', tile.tone)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{tile.label}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">{tile.description}</p>
                </CardContent>
              </LinkCard>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Popular scenarios</h2>
            <p className="text-sm text-muted-foreground">The situations travellers ask about most.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s, i) => (
            <ScenarioCard key={s.slug} scenario={s} index={i} />
          ))}
        </div>
        <div className="flex justify-center">
          <Button asChild variant="outline" className="cursor-pointer gap-2">
            <Link href="/scenarios">
              See full collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
