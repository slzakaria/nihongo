"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import { ArrowLeft, Bookmark } from "lucide-react";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";
import { Button } from "@/components/ui/button";
import { useContentStore } from "@/lib/data/content";
import { useProgressStore } from "@/store/progress";
import { useBookmarkStore } from "@/store/bookmarks";

export default function BookmarkedFlashcardsPage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const phraseIds = useBookmarkStore((s) => s.phraseIds);
  const initCard = useProgressStore((s) => s.initCard);

  const phrases = useMemo(() => {
    const savedIds = new Set(phraseIds);
    return scenarios.flatMap((s) =>
      s.phrases.filter((phrase) => savedIds.has(phrase.id)),
    );
  }, [phraseIds, scenarios]);

  const initializeCards = useCallback(() => {
    for (const phrase of phrases) initCard(phrase.id);
  }, [initCard, phrases]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/flashcards"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Flashcards
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Bookmark className="h-5 w-5" aria-hidden="true" />
          Saved phrases
        </h1>
        <p className="text-muted-foreground">
          Review your bookmarked phrases as a focused flashcard deck.
        </p>
      </div>

      {phrases.length > 0 ? (
        <FlashcardDeck
          slug="bookmarks"
          phrases={phrases}
          onInit={initializeCards}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-lg font-medium">No saved phrases yet</p>
          <p className="text-sm text-muted-foreground">
            Bookmark phrases in a scenario and they’ll appear here.
          </p>
          <Button asChild className="cursor-pointer">
            <Link href="/scenarios">Browse scenarios</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
