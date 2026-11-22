"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Languages,
  Layers,
  MessagesSquare,
  Search,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { LinkCard } from "@/components/ui/link-card";
import { ScenarioCard } from "@/components/scenarios/ScenarioCard";
import { FloatingPhrases } from "@/components/marketing/FloatingPhrases";
import { HeroBanner } from "@/components/marketing/HeroBanner";
import { KanaTeaser } from "@/components/marketing/KanaTeaser";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SimulatorTeaser } from "@/components/marketing/SimulatorTeaser";
import { useProgressStore } from "@/store/progress";
import { useAuthStore } from "@/store/auth";
import { useContentStore } from "@/lib/data/content";
import { useSearchDialogStore } from "@/store/searchDialog";
import { cn } from "@/lib/utils";

// Scenarios most travellers need first. Shown on the landing page; the full list lives on /scenarios.
const FEATURED_SLUGS = [
  "greetings",
  "restaurant",
  "shopping",
  "getting-around",
  "bar-cocktails",
  "hotel",
];

// Tiles without an `href` open the search dialog; icon tones match their card surfaces.
const EXPLORE_TILES = [
  {
    href: "/scenarios",
    label: "Scenarios",
    description: "Phrases for real situations, from bars to banks.",
    icon: MessagesSquare,
    tone: "explore-icon--pink",
    surface: "explore-card--pink",
  },
  {
    href: "/kana",
    label: "Kana",
    description: "Learn hiragana and katakana one character at a time.",
    icon: Languages,
    tone: "explore-icon--blue",
    surface: "explore-card--blue",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    description:
      "Spaced-repetition drills that bring phrases back when you need them.",
    icon: Layers,
    tone: "explore-icon--peach",
    surface: "explore-card--peach",
  },
  {
    href: "/simulator",
    label: "Simulator",
    description:
      "Practice a live conversation with a Japanese role-play partner.",
    icon: Bot,
    tone: "explore-icon--blue",
    surface: "explore-card--blue",
  },
  {
    href: undefined,
    label: "Search",
    description: "Find any phrase, word or translation in seconds.",
    icon: Search,
    tone: "explore-icon--pink",
    surface: "explore-card--pink",
  },
];

export default function Home() {
  const cards = useProgressStore((s) => s.cards);
  const user = useAuthStore((s) => s.user);
  const scenarios = useContentStore((s) => s.content.phrases);
  const showSearch = useSearchDialogStore((s) => s.show);
  const exploreCarouselRef = useRef<HTMLDivElement>(null);
  const [canScrollExploreLeft, setCanScrollExploreLeft] = useState(false);
  const [canScrollExploreRight, setCanScrollExploreRight] = useState(false);

  const totalPhrases = useMemo(
    () => scenarios.reduce((sum, s) => sum + s.phrases.length, 0),
    [scenarios],
  );
  const reviewedCount = useMemo(
    () => Object.values(cards).filter((c) => c.lastReview !== null).length,
    [cards],
  );
  const overallPct =
    totalPhrases === 0 ? 0 : Math.round((reviewedCount / totalPhrases) * 100);

  const featured = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) =>
        scenarios.find((s) => s.slug === slug),
      ).filter((s): s is (typeof scenarios)[number] => Boolean(s)),
    [scenarios],
  );

  const tiles = user
    ? [
        ...EXPLORE_TILES,
        {
          href: "/profile",
          label: "Progress",
          description: "See how far you have come and what to review next.",
          icon: TrendingUp,
          tone: "explore-icon--peach",
          surface: "explore-card--peach",
        },
      ]
    : EXPLORE_TILES;

  useEffect(() => {
    const carousel = exploreCarouselRef.current;
    if (!carousel) return;

    const updateScrollButtons = () => {
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      setCanScrollExploreLeft(carousel.scrollLeft > 1);
      setCanScrollExploreRight(
        maxScrollLeft > 1 && carousel.scrollLeft < maxScrollLeft - 1,
      );
    };

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(carousel);
    carousel.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    updateScrollButtons();

    return () => {
      resizeObserver.disconnect();
      carousel.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [tiles.length]);

  const scrollExplore = (direction: -1 | 1) => {
    const carousel = exploreCarouselRef.current;
    if (!carousel) return;

    const card = carousel.querySelector<HTMLElement>("[data-explore-card]");
    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    const scrollAmount = card
      ? card.getBoundingClientRect().width + gap
      : carousel.clientWidth * 0.8;
    carousel.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-4 py-10 sm:px-6">
      <FloatingPhrases />

      <HeroBanner phrasesReviewed={reviewedCount} totalPhrases={totalPhrases} />

      <section className="explore-section relative left-1/2 flex w-screen -translate-x-1/2 flex-col gap-5">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <SectionHeader
            kicker="さがす・Explore"
            title="Explore"
            description="Everything in one place, from phrases to flashcards."
          />
          <div className="flex shrink-0 gap-2">
            {canScrollExploreLeft && (
              <button
                type="button"
                className="explore-carousel-arrow"
                aria-label="Scroll Explore left"
                aria-controls="explore-carousel"
                onClick={() => scrollExplore(-1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {canScrollExploreRight && (
              <button
                type="button"
                className="explore-carousel-arrow"
                aria-label="Scroll Explore right"
                aria-controls="explore-carousel"
                onClick={() => scrollExplore(1)}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div
          ref={exploreCarouselRef}
          id="explore-carousel"
          className="explore-carousel flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6"
          role="region"
          aria-label="Explore destinations"
          tabIndex={0}
        >
          {tiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.label}
                data-explore-card
                className="w-[min(43.7vw,220px)] min-w-[152px] flex-none snap-start"
              >
                <LinkCard
                  href={tile.href}
                  onClick={tile.href ? undefined : showSearch}
                  index={i}
                  className={`explore-card ${tile.surface}`}
                >
                  <CardContent className="explore-card-content flex flex-col gap-2 p-3 sm:p-4">
                    <span
                      className={cn(
                        "explore-card-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm transition duration-300 group-hover:-rotate-6 group-hover:scale-110",
                        tile.tone,
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <h3 className="truncate text-sm font-medium">
                        {tile.label}
                      </h3>
                      <ArrowRight
                        className="explore-card-arrow hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="explore-card-description line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {tile.description}
                    </p>
                  </CardContent>
                </LinkCard>
              </div>
            );
          })}
        </div>
      </section>

      <div className="simulator-band relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <SimulatorTeaser />
        </div>
      </div>

      <section className="flex flex-col gap-5">
        <SectionHeader
          kicker="シナリオ・Scenarios"
          title="Popular scenarios"
          description="The situations travellers ask about most."
        />
        <div className="grid grid-cols-2 gap-4 min-[480px]:grid-cols-3">
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

      <div>
        <KanaTeaser />
      </div>
    </div>
  );
}
