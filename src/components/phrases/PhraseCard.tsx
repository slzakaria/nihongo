"use client";

import { useState } from "react";
import { Bookmark, ChevronDown } from "lucide-react";
import { Phrase } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioButton } from "@/components/phrases/AudioButton";
import { WordLookup } from "@/components/phrases/WordLookup";
import { useSettingsStore } from "@/store/settings";
import { useProgressStore } from "@/store/progress";
import { useBookmarkStore } from "@/store/bookmarks";
import { cn } from "@/lib/utils";

export function PhraseCard({ phrase }: { phrase: Phrase }) {
  const romajiMode = useSettingsStore((s) => s.romajiMode);
  const markReviewed = useProgressStore((s) => s.markReviewed);
  const isBookmarked = useBookmarkStore((s) => s.phraseIds.includes(phrase.id));
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const [revealed, setRevealed] = useState(false);
  const [showResponses, setShowResponses] = useState(false);

  const showRomaji =
    romajiMode === "always" || (romajiMode === "reveal" && revealed);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => romajiMode === "reveal" && setRevealed((r) => !r)}
          >
            <WordLookup context={phrase.japanese}>
              <p lang="ja" className="text-xl font-medium">
                {phrase.japanese}
              </p>
            </WordLookup>
            {romajiMode !== "never" && (
              <>
                {phrase.kanji && (
                  <p
                    lang="ja"
                    className={cn(
                      "text-sm text-muted-foreground",
                      !showRomaji && "opacity-0 select-none",
                    )}
                  >
                    {phrase.kanji}
                  </p>
                )}
                <p
                  className={cn(
                    "text-sm text-muted-foreground",
                    !showRomaji && "opacity-0 select-none",
                  )}
                >
                  {phrase.romaji}
                </p>
              </>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {phrase.english}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant={phrase.difficulty === "core" ? "default" : "secondary"}
            >
              {phrase.difficulty}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 cursor-pointer",
                isBookmarked && "text-primary",
              )}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark phrase"}
              aria-pressed={isBookmarked}
              title={isBookmarked ? "Remove bookmark" : "Bookmark phrase"}
              onClick={() => toggleBookmark(phrase.id)}
            >
              <Bookmark
                className="h-4 w-4"
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </Button>
            <AudioButton
              text={phrase.japanese}
              onPlay={() => markReviewed(phrase.id)}
            />
          </div>
        </div>

        {phrase.notes && (
          <p className="text-xs text-muted-foreground">{phrase.notes}</p>
        )}

        {phrase.responses.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => {
                setShowResponses((s) => !s);
                markReviewed(phrase.id);
              }}
              aria-expanded={showResponses}
              className="flex items-center gap-1 text-xs font-medium text-primary-foreground dark:text-secondary-foreground"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showResponses && "rotate-180",
                )}
              />
              Possible responses ({phrase.responses.length})
            </button>
            {showResponses && (
              <ul className="mt-2 flex flex-col gap-2 border-l-2 border-border pl-3">
                {phrase.responses.map((r, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p lang="ja" className="text-sm font-medium">
                        {r.japanese}
                      </p>
                      <AudioButton
                        text={r.japanese}
                        className="h-8 w-8 shrink-0"
                      />
                    </div>
                    {showRomaji && r.kanji && (
                      <p lang="ja" className="text-xs text-muted-foreground">
                        {r.kanji}
                      </p>
                    )}
                    {showRomaji && (
                      <p className="text-xs text-muted-foreground">
                        {r.romaji}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{r.english}</p>
                    <p className="text-xs italic text-muted-foreground">
                      {r.listen_for}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
