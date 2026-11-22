"use client";

import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/onboarding";
import { useAuthStore } from "@/store/auth";
import { useAudio } from "@/hooks/useAudio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Case-insensitive, trimmed match against our small VIP list
const SPECIAL_NAMES = [
  "rimane",
  "riri",
  "youssra",
  "youyou",
  "narimane",
  "youss",
  "yous",
  "zackari",
  "zachari",
  "hamza",
  "lamy",
  "lamiae",
];

// NOTE: the specific message requested for the VIP list contained profanity
const SPECIAL_MESSAGE =
  "SEYEBT LIKOM ZBEL DEBRO KRRKOM TEMA, KOLA YNECH ALA KBALTO. 👋";
const SPECIAL_VOICE_MESSAGE = (name: string) =>
  `ようこそ、${name}さん！日本語の勉強、頑張ってね！`;
const DEFAULT_MESSAGE = (name: string) =>
  `Happy learning${name ? `, ${name}` : ""}! 頑張って 🎌`;

const GREETED_KEY = "nihongo-greeted-at";

// Plays the VIP greeting once per sign-in. The sign-in timestamp is the key, so reloads don't replay it
// but the next sign-in does.
function greetSpecialUser(
  name: string,
  signedInAt: string | null,
  play: (text: string) => Promise<void>,
) {
  if (!signedInAt || localStorage.getItem(GREETED_KEY) === signedInAt) return;
  localStorage.setItem(GREETED_KEY, signedInAt);
  void play(SPECIAL_VOICE_MESSAGE(name));
  void import("canvas-confetti").then(({ default: confetti }) =>
    confetti({ particleCount: 550, spread: 150, origin: { y: 0.6 } }),
  );
}

export function WelcomeDialog() {
  const user = useAuthStore((s) => s.user);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const userName = useOnboardingStore((s) => s.userName);
  const synced = useOnboardingStore((s) => s.synced);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const { play } = useAudio();
  const [name, setName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Returning users: greet once the saved profile has loaded, so the name is the server copy
  useEffect(() => {
    if (!user || !synced || !hasOnboarded) return;
    const trimmed = userName.trim();
    if (SPECIAL_NAMES.includes(trimmed.toLowerCase()))
      greetSpecialUser(trimmed, user.lastSignInAt, play);
  }, [user, synced, hasOnboarded, userName, play]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    const isSpecial = SPECIAL_NAMES.includes(trimmed.toLowerCase());
    completeOnboarding(trimmed);
    setToastMessage(isSpecial ? SPECIAL_MESSAGE : DEFAULT_MESSAGE(trimmed));
    if (isSpecial) greetSpecialUser(trimmed, user?.lastSignInAt ?? null, play);
  }

  // Name capture only happens once signed in, so it always has a user to persist against
  if (!user) return null;

  // Wait for the saved profile first, so a late server copy can't overwrite what the user types
  if (!hasOnboarded) {
    if (!synced) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <form
          onSubmit={handleSubmit}
          className="animate-scale-in flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-lg"
        >
          <div>
            <h2 className="text-lg font-semibold">ようこそ！ Welcome</h2>
            <p className="text-sm text-muted-foreground">
              What should we call you?
            </p>
          </div>
          <input
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" disabled={!name.trim()}>
            Start learning
          </Button>
        </form>
      </div>
    );
  }

  return toastMessage ? (
    <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
  ) : null;
}

function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-md border border-border",
        "bg-card px-4 py-3 text-md shadow-lg animate-bounce",
      )}
    >
      {message}
    </div>
  );
}
