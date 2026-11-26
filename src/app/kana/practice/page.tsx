'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { loadKana, useContentStore } from '@/lib/data/content';
import { useProgressStore } from '@/store/progress';
import { KanaQuizDeck } from '@/components/kana/KanaQuizDeck';
import { BilingualText } from '@/components/layout/BilingualText';

// Spaced-repetition review of every hiragana and katakana character
export default function KanaPracticePage() {
  const hiragana = useContentStore((s) => s.content.hiragana);
  const katakana = useContentStore((s) => s.content.katakana);
  const initKana = useProgressStore((s) => s.initKana);

  useEffect(() => {
    loadKana();
  }, []);

  const rows = useMemo(() => [...hiragana, ...katakana], [hiragana, katakana]);
  const kanaPhrases = useMemo(() => rows.flatMap((r) => r.phrases), [rows]);

  const onInit = useCallback(() => {
    for (const row of rows)
      initKana(
        row.slug,
        row.phrases.map((p) => p.id),
      );
  }, [rows, initKana]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/kana"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kana
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          <BilingualText english="Kana practice" japanese="かなのれんしゅう" />
        </h1>
        <p className="text-muted-foreground">
          <BilingualText
            english="Characters you are due to review, from hiragana and katakana."
            japanese="ふくしゅうじきのひらがなとカタカナをれんしゅうしましょう。"
          />
        </p>
      </div>

      <KanaQuizDeck phrases={kanaPhrases} onInit={onInit} />
    </div>
  );
}
