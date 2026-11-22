"use client";

import { useMemo, useState, type ReactNode } from "react";
import { X, Loader2 } from "lucide-react";
import { getAllPhrases } from "@/lib/data/phrases";
import { Button } from "@/components/ui/button";
import { trackBusy } from "@/store/busy";
import { showGuestLimitDialog } from "@/store/rateLimitDialog";

interface Lookup {
  reading: string;
  meaning: string;
  note: string;
}

// Session cache so the same word is only looked up once
const cache = new Map<string, Lookup>();

// Wraps Japanese text. Select a word or phrase in it to see its reading, meaning and other phrases it appears in.
export function WordLookup({
  context,
  children,
}: {
  context: string;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appearsIn = useMemo(
    () =>
      selected
        ? getAllPhrases().filter(
            (p) =>
              p.japanese.includes(selected) ||
              (p.kanji ?? "").includes(selected),
          ).length
        : 0,
    [selected],
  );

  async function lookup(term: string) {
    setSelected(term);
    setError(null);
    const cached = cache.get(term);
    if (cached) {
      setResult(cached);
      return;
    }
    setResult(null);
    setLoading(true);
    try {
      const res = await trackBusy(
        fetch("/api/word", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: term, context }),
        }),
      );
      const data = (await res.json()) as Lookup & { error?: string };
      if (res.status === 429) showGuestLimitDialog(data.error);
      if (!res.ok) throw new Error(data.error ?? "Lookup failed");
      cache.set(term, data);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function onSelectionEnd() {
    const text = window.getSelection()?.toString().trim() ?? "";
    if (!text || text === selected) return;
    void lookup(text);
  }

  return (
    <div
      className="flex flex-col gap-2"
      onMouseUp={onSelectionEnd}
      onTouchEnd={onSelectionEnd}
    >
      {children}
      {selected && (
        <div className="flex flex-col gap-1.5 rounded-md border border-border bg-background p-3 text-sm">
          <div className="flex items-start justify-between gap-2">
            <p lang="ja" className="font-medium">
              {selected}
              {result && result.reading && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {result.reading}
                </span>
              )}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-pointer"
              aria-label="Close word lookup"
              onClick={() => {
                setSelected("");
                setResult(null);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {loading && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Looking up…
            </p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {result && (
            <>
              <p>{result.meaning}</p>
              {result.note && (
                <p className="text-xs text-muted-foreground">{result.note}</p>
              )}
            </>
          )}
          <p className="text-xs text-muted-foreground">
            Appears in {appearsIn} {appearsIn === 1 ? "phrase" : "phrases"} in
            the app
          </p>
        </div>
      )}
    </div>
  );
}
