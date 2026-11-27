import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CherryBlossom } from '@/components/marketing/CherryBlossom';

export function HeroBanner({
  phrasesExplored,
  totalPhrases,
  flashcardsCompleted,
  totalFlashcards,
}: {
  phrasesExplored: number;
  totalPhrases: number;
  flashcardsCompleted: number;
  totalFlashcards: number;
}) {
  const progress =
    totalPhrases > 0 ? Math.min(100, (phrasesExplored / totalPhrases) * 100) : 0;
  const flashcardProgress =
    totalFlashcards > 0
      ? Math.min(100, (flashcardsCompleted / totalFlashcards) * 100)
      : 0;

  return (
    <section className="hero-banner relative min-h-[320px] overflow-hidden rounded-2xl px-5 py-8 sm:px-10 sm:py-12">
      <div className="relative z-10 w-full sm:max-w-[62%]">
        <p className="hero-kicker mb-4 text-[11px] font-medium tracking-[0.18em]">
          <span className="flex flex-col items-start">
            <span><span className='mx-1 animate-pulse'>✦</span>FOR YOUR NEXT TRIP</span>
          </span>
        </p>
        <div className="mb-3 flex shrink-0 items-center">
          <Image
            src="/hanazono.svg"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
            priority
          />
        </div>
        <h1 className="mb-3 flex flex-col">
          <span className="hero-title-en text-2xl font-semibold leading-snug sm:text-3xl">
            Survival Japanese for your trip
          </span>
          <span lang="ja" className="kana-text mt-1 text-sm leading-snug sm:text-base">
            りょこうでつかえるにほんご
          </span>
        </h1>
        <p className="hero-description mb-6 max-w-[380px] md:max-w-[440px] text-sm leading-relaxed sm:mb-7">
          <span className="flex flex-col gap-1">
            <span>
              Explore real-life scenarios, review their phrases with spaced repetition,
              then use them in a live chat simulator.
            </span>
            <span lang="ja" className="kana-text text-[0.82em] leading-relaxed">
              シナリオでフレーズをまなび、カードでふくしゅうして、シミュレーターでかいわをれんしゅうしましょう。
            </span>
          </span>
        </p>

        <div className="mb-6 flex flex-col gap-2.5 sm:mb-7 sm:flex-row sm:flex-wrap md:max-w-[440px] justify-start">
          <Button
            asChild
            className="hero-primary-cta w-full cursor-pointer rounded-[10px] px-5 sm:w-auto"
          >
            <Link href="/scenarios">Start with scenarios</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hero-secondary-cta w-full cursor-pointer rounded-[10px] px-5 sm:w-auto"
          >
            <Link href="/flashcards">Go to flashcards</Link>
          </Button>
        </div>

        <div className="max-w-[380px] md:max-w-[420px]">
          <div className="hero-progress-label mb-1.5 flex justify-between text-[11px]">
            <span>Explored</span>
            <span>
              {phrasesExplored} / {totalPhrases} <span className='ml-1'>Scenario phrases</span>
            </span>
          </div>
          <div
            className="hero-progress-track h-1.5 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Scenario phrases explored progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <span
              className="hero-progress-fill block h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 max-w-[380px] md:max-w-[420px]">
          <div className="hero-progress-label mb-1.5 flex justify-between text-[11px]">
            <span>Studied</span>
            <span>
              {flashcardsCompleted} / {totalFlashcards}{' '}
              <span className="ml-1">Flashcard decks</span>
            </span>
          </div>
          <div
            className="hero-progress-track h-1.5 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Flashcards studied progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(flashcardProgress)}
          >
            <span
              className="hero-progress-fill block h-full rounded-full"
              style={{ width: `${flashcardProgress}%` }}
            />
          </div>
        </div>
      </div>

      <CherryBlossom />
      <VocabPill jp="かんたん" en="Easy" tone="pink" className="right-5 top-12" />
      <VocabPill jp="きれい" en="Pretty" tone="blue" className="bottom-20 right-5" />
      <VocabPill jp="かんぱい！" en="Cheers" tone="peach" className="bottom-8 right-32" />
      <VocabPill
        jp="おいしい"
        en="Delicious"
        tone="blue"
        className="right-44 top-[42%] hidden lg:block"
      />
      <VocabPill
        jp="ありがとう"
        en="Thank you"
        tone="pink"
        className="right-36 top-[70%] hidden lg:block"
      />
      <VocabPill
        jp="またね"
        en="See you"
        tone="peach"
        className="right-52 top-[22%] hidden lg:block"
      />
    </section>
  );
}

function VocabPill({
  jp,
  en,
  tone,
  className,
}: {
  jp: string;
  en: string;
  tone: 'pink' | 'blue' | 'peach';
  className: string;
}) {
  return (
    <div
      className={`hero-vocab-pill hero-vocab-pill--${tone} absolute z-20 rounded-full border px-3.5 py-1.5 text-xs font-medium ${className}`}
    >
      {jp}
      <span className="ml-1">· {en}</span>
    </div>
  );
}
