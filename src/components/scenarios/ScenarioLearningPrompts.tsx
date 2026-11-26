'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Phrase, Scenario } from '@/types';
import { useProgressStore, type ScenarioPhraseProgress } from '@/store/progress';
import { markLocalStorageFlag, useLocalStorageFlag } from '@/hooks/useLocalStorageFlag';

const FLASHCARD_INTRO_KEY = 'nihongo-flashcard-scenario-intro-seen';
const SCENARIO_PROMPT_PREFIX = 'nihongo-scenario-flashcard-prompt-seen:';

function PromptDialog({
  id,
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
  onDismiss,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="flex flex-col items-center gap-4 px-6 pb-5 pt-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 id={`${id}-title`} className="text-xl font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="ghost" className="cursor-pointer" onClick={onDismiss}>
            Not now
          </Button>
          <Button asChild className="dialog-primary-button cursor-pointer">
            <Link href={actionHref} onClick={onDismiss}>
              {actionLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FlashcardScenarioIntro({
  scenarios,
  scenarioProgress,
}: {
  scenarios: Scenario[];
  scenarioProgress: Record<string, ScenarioPhraseProgress>;
}) {
  const hasUnexploredPhrases = scenarios.some((scenario) =>
    scenario.phrases.some((phrase) => !scenarioProgress[phrase.id]),
  );
  const seen = useLocalStorageFlag(FLASHCARD_INTRO_KEY);
  const open = hasUnexploredPhrases && !seen;

  useEffect(() => {
    if (open) localStorage.setItem(FLASHCARD_INTRO_KEY, '1');
  }, [open]);

  if (!open) return null;

  return (
    <PromptDialog
      id="flashcard-scenario-intro"
      icon={BookOpenCheck}
      title="Start with a scenario"
      description="Explore phrases in a real-life situation first, then use flashcards to practise remembering them."
      actionHref="/scenarios"
      actionLabel="Explore scenarios"
      onDismiss={() => markLocalStorageFlag(FLASHCARD_INTRO_KEY)}
    />
  );
}

export function ScenarioFlashcardPrompt({
  scenarioSlug,
  scenarioLabel,
  phrases,
}: {
  scenarioSlug: string;
  scenarioLabel: string;
  phrases: Phrase[];
}) {
  const scenarioProgress = useProgressStore((state) => state.scenarioProgress ?? {});
  const complete =
    phrases.length > 0 && phrases.every((phrase) => Boolean(scenarioProgress[phrase.id]));
  const storageKey = `${SCENARIO_PROMPT_PREFIX}${scenarioSlug}`;
  const seen = useLocalStorageFlag(storageKey);
  const open = complete && !seen;

  useEffect(() => {
    if (open) localStorage.setItem(storageKey, '1');
  }, [open, storageKey]);

  if (!open) return null;

  return (
    <PromptDialog
      id={`scenario-complete-${scenarioSlug}`}
      icon={Sparkles}
      title={`${scenarioLabel} complete!`}
      description={`Step 1 complete: you've explored all ${phrases.length} phrases. Review them with flashcards next.`}
      actionHref={`/flashcards/${scenarioSlug}`}
      actionLabel="Go to flashcards"
      onDismiss={() => markLocalStorageFlag(storageKey)}
    />
  );
}

const FLASHCARD_SIMULATOR_PROMPT_PREFIX = 'nihongo-flashcard-simulator-prompt-seen:';

export function FlashcardSimulatorPrompt({
  complete,
  scenarioSlug,
  scenarioLabel,
}: {
  complete: boolean;
  scenarioSlug: string;
  scenarioLabel: string;
}) {
  const storageKey = `${FLASHCARD_SIMULATOR_PROMPT_PREFIX}${scenarioSlug}`;
  const seen = useLocalStorageFlag(storageKey);
  const open = complete && !seen;

  useEffect(() => {
    if (open) localStorage.setItem(storageKey, '1');
  }, [open, storageKey]);

  if (!open) return null;

  return (
    <PromptDialog
      id={`flashcards-complete-${scenarioSlug}`}
      icon={Sparkles}
      title={`${scenarioLabel} flashcards complete!`}
      description="Step 2 complete: put the phrases to use in a live conversation with the simulator."
      actionHref={`/simulator/${scenarioSlug}`}
      actionLabel="Start simulator"
      onDismiss={() => markLocalStorageFlag(storageKey)}
    />
  );
}
