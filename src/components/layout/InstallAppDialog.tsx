'use client';

import { useEffect } from 'react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { useInstallAppDialogStore } from '@/store/installAppDialog';
import { useInstallApp } from '@/hooks/useInstallApp';
import { Button } from '@/components/ui/button';

// Centered popup explaining how to install the app. Chrome/Edge/Android get a native
// install button; iOS Safari has no install API, so it gets the manual share-sheet steps.
export function InstallAppDialog() {
  const open = useInstallAppDialogStore((s) => s.open);
  const hide = useInstallAppDialogStore((s) => s.hide);
  const { isStandalone, isIos, canPromptInstall, promptInstall } = useInstallApp();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') hide();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hide]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) hide();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-app-title"
        className="animate-scale-in relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="gradient-brand px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Install Hanazono
          </p>
          <h2 id="install-app-title" className="text-xl font-semibold">
            Use it like a native app
          </h2>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          {isStandalone ? (
            <p className="text-sm text-muted-foreground">
              You&apos;re already using the installed app — nice! 🎉
            </p>
          ) : isIos ? (
            <>
              <p className="text-sm text-muted-foreground">
                Safari on iOS doesn&apos;t support one-tap install, but adding Hanazono to
                your Home Screen takes a few seconds:
              </p>
              <ol className="flex flex-col gap-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold">
                    1
                  </span>
                  <span className="pt-0.5">
                    Tap the <Share className="inline h-3.5 w-3.5 align-text-bottom" />{' '}
                    Share button in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold">
                    2
                  </span>
                  <span className="pt-0.5">
                    Scroll down and tap{' '}
                    <span className="inline-flex items-center gap-1 font-medium">
                      <SquarePlus className="h-3.5 w-3.5" /> Add to Home Screen
                    </span>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold">
                    3
                  </span>
                  <span className="pt-0.5">Tap Add — Hanazono now opens full-screen, no browser bar.</span>
                </li>
              </ol>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Install Hanazono to launch it from your home screen or app list, full-screen
              and even when offline.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            {!isStandalone && canPromptInstall && (
              <Button
                type="button"
                className="dialog-primary-button cursor-pointer"
                onClick={async () => {
                  await promptInstall();
                  hide();
                }}
              >
                <Download className="h-4 w-4" />
                Install app
              </Button>
            )}
            <Button type="button" variant="outline" className="cursor-pointer" onClick={hide}>
              {isStandalone ? 'Close' : 'Got it'}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={hide}
          aria-label="Close"
          className="absolute right-3 top-3 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
