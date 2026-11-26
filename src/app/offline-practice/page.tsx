'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';
import { loadKana, useContentStore } from '@/lib/data/content';
import { useProgressStore } from '@/store/progress';
import { BilingualText } from '@/components/layout/BilingualText';

type PracticeMode = 'phrases' | 'kana';

export default function OfflinePracticePage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const hiragana = useContentStore((s) => s.content.hiragana);
  const katakana = useContentStore((s) => s.content.katakana);
  const initScenario = useProgressStore((s) => s.initScenario);
  const initKana = useProgressStore((s) => s.initKana);
  const [mode, setMode] = useState<PracticeMode>('phrases');
  const [scenarioSlug, setScenarioSlug] = useState('');
  const [kanaError, setKanaError] = useState(false);
  const selectedScenarioSlug = scenarios.some(
    (scenario) => scenario.slug === scenarioSlug,
  )
    ? scenarioSlug
    : (scenarios[0]?.slug ?? '');

  useEffect(() => {
    void loadKana().catch((error) => {
      console.error('Unable to load kana practice data.', error);
      setKanaError(true);
    });
  }, []);

  const kanaRows = useMemo(() => [...hiragana, ...katakana], [hiragana, katakana]);
  const kanaPhrases = useMemo(() => kanaRows.flatMap((row) => row.phrases), [kanaRows]);
  const initializeKana = useCallback(() => {
    for (const row of kanaRows)
      initKana(
        row.slug,
        row.phrases.map((phrase) => phrase.id),
      );
  }, [initKana, kanaRows]);
  const initializeScenario = useCallback(() => {
    if (selectedScenarioSlug) initScenario(selectedScenarioSlug);
  }, [initScenario, selectedScenarioSlug]);

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
        <h1 className="text-2xl font-semibold tracking-tight">
          <BilingualText english="Offline practice" japanese="オフラインれんしゅう" />
        </h1>
        <p className="text-sm text-muted-foreground">
          <BilingualText
            english="Open this page while connected once to cache its practice files. Reviews save on this device and sync when you reconnect."
            japanese="オンラインのときにこのページをひらくと、れんしゅうデータがほぞんされます。ふくしゅうはこのデバイスにきろくされ、さいせつぞくじにどうきします。"
          />
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'phrases' ? 'secondary' : 'outline'}
          onClick={() => setMode('phrases')}
        >
          Phrases
        </Button>
        <Button
          type="button"
          variant={mode === 'kana' ? 'default' : 'outline'}
          onClick={() => setMode('kana')}
        >
          Kana
        </Button>
      </div>

      {mode === 'phrases' ? (
        <>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Choose a scenario
            <select
              value={selectedScenarioSlug}
              onChange={(event) => setScenarioSlug(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.slug} value={scenario.slug}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </label>
          {selectedScenarioSlug && (
            <FlashcardDeck
              key={`phrases:${selectedScenarioSlug}`}
              slug={selectedScenarioSlug}
              onInit={initializeScenario}
            />
          )}
        </>
      ) : kanaError ? (
        <p role="alert" className="text-sm text-muted-foreground">
          Kana data is not available in this offline session. Reconnect once and reopen
          this page to cache it.
        </p>
      ) : kanaRows.length === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading kana practice data…
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Practice hiragana and katakana characters due for review.
          </p>
          <FlashcardDeck
            key="kana:offline"
            slug="kana:offline"
            phrases={kanaPhrases}
            onInit={initializeKana}
          />
        </>
      )}
    </div>
  );
}
