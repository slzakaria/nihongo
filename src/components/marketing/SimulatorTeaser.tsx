import Link from 'next/link'
import { ArrowRight, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/marketing/SectionHeader'

// A static mock conversation — illustrative only, not the live simulator — just enough to show
// what a chat with a role-play partner looks like before linking through to the real thing.
const MOCK_MESSAGES = [
  {
    role: 'assistant' as const,
    japanese: 'いらっしゃいませ。何名様ですか？',
    translation: 'Irasshaimase. Nan-mei-sama desu ka? — Welcome. How many people?',
  },
  {
    role: 'user' as const,
    japanese: '二人です。',
    translation: 'Futari desu. — Two people.',
  },
  {
    role: 'assistant' as const,
    japanese: 'カウンター席でよろしいですか？',
    translation: 'Kauntaa seki de yoroshii desu ka? — Is counter seating okay?',
  },
]

// Landing-page teaser for the real /simulator conversations — a static mock, not a live chat
export function SimulatorTeaser() {
  return (
    <section className="flex flex-col gap-5">
      <SectionHeader
        kicker="シミュレーター・Simulator"
        title="Practice before the moment arrives"
        description="Chat live with a Japanese role-play partner."
      />

      <div className="gradient-brand mx-auto w-full max-w-xl rounded-lg p-1 shadow-sm">
        <div className="overflow-hidden rounded-lg bg-card">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
            <span className="ml-2 truncate text-xs text-muted-foreground">居酒屋・Izakaya scenario</span>
          </div>
          <div className="flex flex-col gap-3 p-4">
            {MOCK_MESSAGES.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[80%] rounded-lg bg-primary/15 px-3 py-2 text-sm'
                    : 'max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm'
                }
              >
                <p lang="ja" className="font-medium">{m.japanese}</p>
                <p className="text-xs text-muted-foreground">{m.translation}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <div className="flex h-9 flex-1 items-center rounded-md border border-border bg-background px-3 text-sm text-muted-foreground">
              Type your reply...
            </div>
            <Button size="icon" className="shrink-0" disabled aria-label="Send">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild variant="outline" className="cursor-pointer gap-2">
          <Link href="/simulator">
            Try the simulator
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
