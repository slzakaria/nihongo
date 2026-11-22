import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/marketing/SectionHeader";

// First twenty gojuon hiragana — a representative taste of the full /kana drills
const KANA_PREVIEW = [
  { japanese: "あ", romaji: "a" },
  { japanese: "い", romaji: "i" },
  { japanese: "う", romaji: "u" },
  { japanese: "え", romaji: "e" },
  { japanese: "お", romaji: "o" },
  { japanese: "か", romaji: "ka" },
  { japanese: "き", romaji: "ki" },
  { japanese: "く", romaji: "ku" },
  { japanese: "け", romaji: "ke" },
  { japanese: "こ", romaji: "ko" },
  { japanese: "さ", romaji: "sa" },
  { japanese: "し", romaji: "shi" },
  { japanese: "す", romaji: "su" },
  { japanese: "せ", romaji: "se" },
  { japanese: "そ", romaji: "so" },
  { japanese: "た", romaji: "ta" },
  { japanese: "ち", romaji: "chi" },
  { japanese: "つ", romaji: "tsu" },
  { japanese: "て", romaji: "te" },
  { japanese: "と", romaji: "to" },
];

// Landing-page teaser for the real /kana drills — plain, subtle cards (a faint border and a
// touch of brand colour on the character itself) rather than a full gradient fill, so the grid
// reads as a quiet reference strip instead of competing for attention with the rest of the page.
export function KanaTeaser() {
  return (
    <section className="flex flex-col gap-5">
      <SectionHeader
        kicker="か・Kana"
        title="Read before you land"
        description="Hiragana and katakana, one character at a time."
      />
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
        {KANA_PREVIEW.map((k) => (
          <Link
            key={k.japanese}
            href="/kana"
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-card py-3 text-center transition-colors hover:border-primary/50 hover:bg-muted"
          >
            <span lang="ja" className="text-xl font-semibold text-primary">
              {k.japanese}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {k.romaji}
            </span>
          </Link>
        ))}
      </div>
      <div className="flex justify-center">
        <Button asChild variant="outline" className="cursor-pointer gap-2">
          <Link href="/kana">
            Practise kana
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
