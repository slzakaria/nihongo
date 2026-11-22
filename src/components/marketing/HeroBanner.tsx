import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CherryBlossom } from '@/components/marketing/CherryBlossom';

export function HeroBanner({
  phrasesReviewed,
  totalPhrases,
}: {
  phrasesReviewed: number;
  totalPhrases: number;
}) {
  const progress =
    totalPhrases > 0 ? Math.min(100, (phrasesReviewed / totalPhrases) * 100) : 0;

  return (
    <section className="hero-banner relative min-h-[320px] overflow-hidden rounded-2xl px-5 py-8 sm:px-10 sm:py-12">
      <div className="relative z-10 w-full sm:max-w-[62%]">
        <p className="hero-kicker mb-4 text-[11px] font-medium tracking-[0.18em]">
          ✦ FOR YOUR NEXT TRIP
        </p>
        <h1 className="mb-3">
          <span
            lang="ja"
            className="hero-title-ja flex items-center gap-2.5 text-4xl leading-tight sm:text-[42px]"
          >
            <Image
              src="/hanazono.svg"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              priority
            />
            はなぞの
          </span>
          <span className="hero-title-en mt-1 block text-xl font-medium leading-snug sm:text-[22px]">
            Survival Japanese for your trip
          </span>
        </h1>
        <p className="hero-description mb-6 max-w-[380px] text-sm leading-relaxed sm:mb-7">
          Phrases for real situations, spaced-repetition drills, and a live chat simulator
          — everything you need for bars, shops, and small talk in Japan.
        </p>

        <div className="mb-6 flex flex-wrap gap-2.5 sm:mb-7">
          <Button asChild className="hero-primary-cta cursor-pointer rounded-[10px] px-5">
            <Link href="/flashcards">Start flashcards</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hero-secondary-cta cursor-pointer rounded-[10px] px-5"
          >
            <Link href="/scenarios">Browse scenarios</Link>
          </Button>
        </div>

        <div className="max-w-[300px]">
          <div className="hero-progress-label mb-1.5 flex justify-between text-[11px]">
            <span>Your progress</span>
            <span>
              {phrasesReviewed} / {totalPhrases} phrases
            </span>
          </div>
          <div
            className="hero-progress-track h-1 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Phrase review progress"
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
