import Link from 'next/link';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/marketing/SectionHeader';

const SCENARIO_CHIPS = [
  { japanese: '居酒屋', english: 'Izakaya', tone: 'pink' },
  { japanese: '駅', english: 'Station', tone: 'blue' },
  { japanese: 'コンビニ', english: 'Konbini', tone: 'peach' },
  { japanese: '薬局', english: 'Pharmacy', tone: 'pink' },
] as const;

// A static mock conversation — illustrative only, not the live simulator — just enough to show
// what a chat with a role-play partner looks like before linking through to the real thing.
const MOCK_MESSAGES = [
  {
    role: 'assistant' as const,
    japanese: 'いらっしゃいませ。何名様ですか？',
    translation: 'Welcome. How many people?',
  },
  {
    role: 'user' as const,
    japanese: '二人です。',
    translation: 'Two people.',
  },
  {
    role: 'assistant' as const,
    japanese: 'カウンター席でよろしいですか？',
    translation: 'Is counter seating okay?',
  },
];

// Landing-page teaser for the real /simulator conversations — a static mock, not a live chat
export function SimulatorTeaser() {
  return (
    <section className="simulator-teaser flex flex-col gap-5">
      <SectionHeader
        kicker="シミュレーター・Simulator"
        title="Practice before the moment arrives"
        description="Chat live with a Japanese role-play partner."
      />

      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-10">
        <div className="flex flex-col items-start">
          <p className="mb-5 max-w-lg text-sm leading-7 text-muted-foreground">
            Pick a scenario — a restaurant, an izakaya, a convenience store — and talk
            your way through it. The simulator corrects you in real time, so you build
            real confidence, not just vocabulary.
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {SCENARIO_CHIPS.map((chip) => (
              <span
                key={chip.japanese}
                className={`simulator-chip simulator-chip--${chip.tone} rounded-full border px-3 py-1.5 text-xs font-medium`}
              >
                <span lang="ja">{chip.japanese}</span> {chip.english}
              </span>
            ))}
          </div>
          <Button asChild variant="outline" className="cursor-pointer gap-2">
            <Link href="/simulator">
              Try the simulator
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="simulator-chat w-full overflow-hidden rounded-2xl border">
          <div className="simulator-chat-header flex items-center gap-1.5 border-b px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ed93b1]" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#85b7eb]" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fac775]" aria-hidden="true" />
            <span className="ml-2 truncate text-xs text-muted-foreground">
              いざかや・Izakaya scenario
            </span>
          </div>
          <div className="flex flex-col gap-3 p-4">
            {MOCK_MESSAGES.map((m, i) => (
              <div
                key={i}
                className={`simulator-bubble simulator-bubble--${m.role} ${
                  m.role === 'user' ? 'ml-auto max-w-[75%] text-right' : 'max-w-[85%]'
                } rounded-[10px] px-3 py-2.5 text-sm`}
              >
                <p lang="ja" className="font-medium">
                  {m.japanese}
                </p>
                <p className="simulator-translation text-xs">{m.translation}</p>
              </div>
            ))}
          </div>
          <div className="simulator-chat-input flex items-center gap-2 border-t p-3">
            <div className="flex h-9 flex-1 items-center rounded-lg border px-3 text-sm text-muted-foreground">
              Type your reply...
            </div>
            <Button
              size="icon"
              className="simulator-send-button h-8 w-8 shrink-0 rounded-lg"
              disabled
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
