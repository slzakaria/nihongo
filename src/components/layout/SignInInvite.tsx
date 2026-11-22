"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useSignInDialogStore } from "@/store/signInDialog";
import { Button } from "@/components/ui/button";

const DISMISS_COUNT_KEY = "nihongo-signin-invite-dismiss-count";
// After this many "Not now" clicks (counted across all visits, not just this tab), stop showing
// the invite for good instead of nagging on every page forever.
const MAX_DISMISSALS = 6;

function readDismissCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(DISMISS_COUNT_KEY) ?? "0", 10) || 0;
}

// Invites signed-out visitors to sign in once they navigate past the homepage. Reappears on each
// new page (dismissing only hides it for the page you dismissed it on) until "Not now" has been
// clicked MAX_DISMISSALS times in total, after which it stays dismissed for good.
export function SignInInvite() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const loaded = useAuthStore((s) => s.loaded);
  const showSignIn = useSignInDialogStore((s) => s.show);
  const [dismissCount, setDismissCount] = useState(readDismissCount);
  const [hiddenForPath, setHiddenForPath] = useState<string | null>(null);

  const permanentlyDismissed = dismissCount >= MAX_DISMISSALS;
  const shouldShow =
    loaded &&
    !user &&
    !permanentlyDismissed &&
    hiddenForPath !== pathname &&
    pathname !== "/" &&
    !pathname.startsWith("/auth");
  if (!shouldShow) return null;

  function dismiss() {
    const next = dismissCount + 1;
    localStorage.setItem(DISMISS_COUNT_KEY, String(next));
    setDismissCount(next);
    setHiddenForPath(pathname);
  }

  return (
    <div
      role="dialog"
      aria-label="Sign in to save your progress"
      className="animate-scale-in fixed bottom-4 left-4 z-40 w-72 max-w-[calc(100vw-6rem)] rounded-lg border border-border bg-card p-4 shadow-lg"
    >
      <p className="text-sm font-medium">Save your progress</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Sign in to sync your flashcards and phrase progress across devices.
      </p>
      <div className="mt-3">
        <div className="flex gap-2">
          <Button size="sm" className="cursor-pointer" onClick={showSignIn}>
            Sign in
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="cursor-pointer"
            onClick={dismiss}
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
