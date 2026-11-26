'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markLocalStorageFlag, useLocalStorageFlag } from '@/hooks/useLocalStorageFlag';

const DISMISSED_KEY = 'hanazono-major-progress-update-dismissed-v1';

export function MajorUpdateNotice() {
  const dismissed = useLocalStorageFlag(DISMISSED_KEY);
  const open = !dismissed;

  function dismiss() {
    markLocalStorageFlag(DISMISSED_KEY);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="major-update-title"
        className="animate-scale-in w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <h2 id="major-update-title" className="text-xl font-semibold">
            A major update to Hanazono
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          Scenarios, flashcards, and simulator practice now track progress separately.
          <br></br>
          To support this change, your previous progress was reset. You can now start
          fresh and track each area independently.
          <br></br>
          <br></br>
          Sincerely sorry for any inconvenience this may cause.
          <br></br>
          Thank you for your understanding.
        </p>
        <div className="mt-6 flex justify-end">
          <Button className="dialog-primary-button cursor-pointer" onClick={dismiss}>
            Got it, continue
          </Button>
        </div>
      </div>
    </div>
  );
}
