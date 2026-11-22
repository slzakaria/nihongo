"use client";

import { useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useSignInDialogStore } from "@/store/signInDialog";
import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  SignIn,
  useUser,
} from "@clerk/nextjs";

// Clerk's card sits inside our dialog, so it drops its own card styling and heading, and uses the app's theme classes
// so it follows light and dark mode.
const clerkAppearance = {
  elements: {
    rootBox: "w-full! max-w-full",
    cardBox: "w-full! max-w-full",
    card: "w-full! max-w-full bg-transparent p-0 shadow-none border-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "border-border bg-background text-foreground hover:bg-muted shadow-none",
    socialButtonsBlockButtonText: "text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-foreground",
    formFieldInput: "bg-background text-foreground border-border shadow-none",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none",
    identityPreviewText: "text-foreground",
    footer: "bg-transparent",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-primary hover:text-primary/80",
  },
};

// Centered sign-in popup with a branded header. Closes on Escape, backdrop click, or the close button,
// and closes itself once the user is signed in.
export function SignInDialog() {
  const open = useSignInDialogStore((s) => s.open);
  const hide = useSignInDialogStore((s) => s.hide);
  const user = useAuthStore((s) => s.user);
  // Clerk confirms the session a moment before our own store (AuthSync) catches up and closes
  // this dialog — show a spinner for that gap instead of leaving the form sitting there inert.
  const { isSignedIn } = useUser();
  const finishingSignIn = !!isSignedIn && !user;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") hide();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hide]);

  useEffect(() => {
    if (user) hide();
  }, [user, hide]);

  if (!open || user) return null;

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
        aria-labelledby="sign-in-title"
        className="animate-scale-in relative w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="gradient-brand px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Welcome back
          </p>
          <h2 id="sign-in-title" className="text-xl font-semibold">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sync your progress across every device.
          </p>
        </div>
        <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          {finishingSignIn ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2
                className="h-8 w-8 animate-spin text-primary"
                aria-label="Finishing sign-in"
              />
              Finishing sign-in…
            </div>
          ) : (
            <>
              <ClerkLoading>
                <div className="flex min-h-48 items-center justify-center">
                  <Loader2
                    className="h-8 w-8 animate-spin text-primary"
                    aria-label="Loading sign-in"
                  />
                </div>
              </ClerkLoading>
              <ClerkFailed>
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Sign-in is unavailable right now. Please try again later.
                </p>
              </ClerkFailed>
              <ClerkLoaded>
                <SignIn routing="hash" appearance={clerkAppearance} />
              </ClerkLoaded>
            </>
          )}
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
