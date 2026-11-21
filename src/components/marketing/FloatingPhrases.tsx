import { cn } from '@/lib/utils'

// Real phrases and single words from the app's own content, used purely decoratively — grouped
// into SLOTS of 3, with only one word per slot visible at a time (the others crossfade in behind
// it, see .animate-word-cycle in globals.css). Keeps a handful of chips always on screen without
// needing dozens of them competing for space.
const SLOTS: { tone: 'primary' | 'secondary' | 'accent'; words: { japanese: string; english: string }[] }[] = [
  {
    tone: 'secondary',
    words: [
      { japanese: 'こんにちは', english: 'Hello' },
      { japanese: 'おおきい', english: 'Big' },
      { japanese: 'かんたん', english: 'Easy' },
    ],
  },
  {
    tone: 'primary',
    words: [
      { japanese: 'どこですか？', english: 'Where is it?' },
      { japanese: 'やすい', english: 'Cheap' },
      { japanese: 'きれい', english: 'Pretty' },
    ],
  },
  {
    tone: 'secondary',
    words: [
      { japanese: 'ありがとう', english: 'Thank you' },
      { japanese: 'ちいさい', english: 'Small' },
      { japanese: 'かんぱい！', english: 'Cheers!' },
    ],
  },
  {
    tone: 'accent',
    words: [
      { japanese: 'すみません', english: 'Excuse me' },
      { japanese: 'たかい', english: 'Expensive' },
      { japanese: 'おいしい！', english: 'Delicious!' },
    ],
  },
  {
    tone: 'secondary',
    words: [
      { japanese: 'いただきます', english: "Let's eat" },
      { japanese: 'これはいくらですか？', english: 'How much is this?' },
      { japanese: 'たのしい', english: 'Fun' },
    ],
  },
  {
    tone: 'primary',
    words: [
      { japanese: 'ください', english: 'Please give me' },
      { japanese: 'でぐちはどこですか？', english: 'Where is the exit?' },
      { japanese: 'かわいい', english: 'Cute' },
    ],
  },
  {
    tone: 'accent',
    words: [
      { japanese: 'だいじょうぶ', english: "It's okay" },
      { japanese: 'いたい', english: 'It hurts' },
      { japanese: 'たすけて！', english: 'Help!' },
    ],
  },
  {
    tone: 'primary',
    words: [
      { japanese: 'おげんきですか？', english: 'How are you?' },
      { japanese: 'びょういんはどこですか？', english: "Where's the hospital?" },
      { japanese: 'やっきょく', english: 'Pharmacy' },
    ],
  },
  {
    tone: 'secondary',
    words: [
      { japanese: 'たのしかった！', english: 'That was fun!' },
      { japanese: 'がんばって', english: 'Good luck' },
      { japanese: 'おつかれさま', english: 'Good work' },
    ],
  },
  {
    tone: 'accent',
    words: [
      { japanese: 'はじめまして', english: 'Nice to meet you' },
      { japanese: 'よろしくおねがいします', english: 'Please treat me well' },
      { japanese: 'おげんきで', english: 'Take care' },
    ],
  },
  {
    tone: 'secondary',
    words: [
      { japanese: 'あつい', english: 'Hot' },
      { japanese: 'さむい', english: 'Cold' },
      { japanese: 'つかれた', english: 'Tired' },
    ],
  },
  {
    tone: 'primary',
    words: [
      { japanese: 'いくらですか？', english: 'How much is it?' },
      { japanese: 'げんきんのみです', english: 'Cash only' },
      { japanese: 'すてき！', english: 'Lovely!' },
    ],
  },
]

// Stacked down the right edge of the screen (the wrapper below breaks out to the full viewport
// width, so these percentages are measured from the true right edge, not the page's own narrower
// content column) with a slight horizontal jitter per slot so they don't line up too rigidly.
const POSITIONS = [
  { top: '3%', right: '4%' },
  { top: '11%', right: '9%' },
  { top: '19%', right: '2%' },
  { top: '27%', right: '11%' },
  { top: '35%', right: '5%' },
  { top: '43%', right: '8%' },
  { top: '51%', right: '3%' },
  { top: '59%', right: '10%' },
  { top: '67%', right: '6%' },
  { top: '75%', right: '12%' },
  { top: '83%', right: '4%' },
  { top: '91%', right: '9%' },
] as const

const TONE_CLASSES: Record<'primary' | 'secondary' | 'accent', string> = {
  primary: 'bg-primary/90 text-primary-foreground border-primary-foreground/10',
  secondary: 'bg-secondary/90 text-secondary-foreground border-secondary-foreground/10',
  accent: 'bg-accent/90 text-accent-foreground border-accent-foreground/10',
}

// Per-word stagger within a slot's 27s cycle, matching .animate-word-cycle's duration in
// globals.css: each word gets an even third (9s) of the loop to itself.
const WORD_DELAYS = [0, 9, 18]

// Floating phrase chips stacked down the right edge of the landing page. Each slot quietly cycles
// through a few words instead of bobbing in place, and the whole layer sits behind every section
// (large screens only — there's no spare margin for this on mobile).
export function FloatingPhrases() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-screen -translate-x-1/2 lg:block"
    >
      {SLOTS.map((slot, slotIndex) => {
        const pos = POSITIONS[slotIndex]
        // Stagger whole slots against each other too, so they don't all turn over in sync
        const slotOffset = slotIndex * 2.2
        return (
          <div key={slotIndex} className="absolute" style={{ top: pos.top, right: pos.right }}>
            {slot.words.map((word, wordIndex) => (
              <div
                key={word.japanese}
                style={{ animationDelay: `${slotOffset + WORD_DELAYS[wordIndex]}s` }}
                className={cn(
                  'animate-word-cycle absolute right-0 top-0 rounded-lg border px-2.5 py-1 text-[11px] shadow-sm backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs',
                  TONE_CLASSES[slot.tone]
                )}
              >
                <p lang="ja" className="whitespace-nowrap font-medium">{word.japanese}</p>
                <p className="whitespace-nowrap opacity-80">{word.english}</p>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
