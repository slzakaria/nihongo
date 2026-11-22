"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Download,
  Layers,
  Mic,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useOnboardingStore } from "@/store/onboarding";
import {
  markInfoPopupShown,
  useInfoPopupCooldown,
} from "@/hooks/useInfoPopupCooldown";
import { isAdminEmail } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GUEST_TOUR_COOKIE = "nihongo-feature-tour-seen";

const SLIDES = [
  {
    icon: Sparkles,
    title: "Welcome to Hanazono",
    text: "Build practical Japanese skills with short lessons, phrase review, and speaking practice.",
  },
  {
    icon: BookOpen,
    title: "Phrases for real situations",
    text: "Browse travel scenarios, search phrases, and find quick etiquette notes. Choose whether romaji is shown.",
  },
  {
    icon: Layers,
    title: "Review your way",
    text: "Practise kana and phrases with spaced repetition. Bookmark useful phrases for a focused review queue.",
  },
  {
    icon: Mic,
    title: "Speak and listen",
    text: "Hear Japanese, practise speaking in a supported browser, or role-play a conversation with the simulator.",
  },
  {
    icon: Award,
    title: "Build a steady habit",
    text: "Set study goals, track your progress, and celebrate milestones with badges and a daily recap.",
  },
  {
    icon: UserRound,
    title: "Your profile",
    text: "Find your progress, saved phrases, conversations, and preferences together in one place.",
  },
  {
    icon: Download,
    title: "Practice offline",
    text: "Open Offline practice once while connected to cache phrase and kana practice. Your progress saves on this device and signed-in changes sync when you reconnect.",
  },
];

function guestTourWasSeen(): boolean {
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim() === `${GUEST_TOUR_COOKIE}=1`);
}

export function FeatureTour() {
  const { isLoaded, isSignedIn } = useUser();
  const user = useAuthStore((s) => s.user);
  const synced = useOnboardingStore((s) => s.synced);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const featureTourSeen = useOnboardingStore((s) => s.featureTourSeen);
  const markFeatureTourSeen = useOnboardingStore((s) => s.markFeatureTourSeen);
  const [index, setIndex] = useState(0);
  const [guestTourSeen, setGuestTourSeen] = useState<boolean | null>(null);
  const scope = isSignedIn
    ? user
      ? `user:${user.id}`
      : null
    : isLoaded
      ? "guest"
      : null;
  const cooldownAvailable = useInfoPopupCooldown(isLoaded ? "device" : null);

  useEffect(() => {
    if (!isLoaded || isSignedIn) {
      setGuestTourSeen(null);
      return;
    }
    setGuestTourSeen(guestTourWasSeen());
  }, [isLoaded, isSignedIn]);

  const eligible = Boolean(
    isLoaded &&
    cooldownAvailable &&
    (isSignedIn
      ? user && synced && hasOnboarded && !featureTourSeen
      : !user && guestTourSeen === false),
  );
  const [delayElapsed, setDelayElapsed] = useState(false);

  useEffect(() => {
    if (!eligible) {
      setDelayElapsed(false);
      return;
    }
    const timer = window.setTimeout(() => setDelayElapsed(true), 6_000);
    return () => window.clearTimeout(timer);
  }, [eligible, scope]);

  useEffect(() => {
    if (eligible) setIndex(0);
  }, [eligible, scope]);

  const finishTour = useCallback(() => {
    if (!scope) return;
    markInfoPopupShown("device");
    if (isSignedIn) {
      markFeatureTourSeen();
    } else {
      document.cookie = `${GUEST_TOUR_COOKIE}=1; max-age=31536000; path=/; samesite=lax`;
      setGuestTourSeen(true);
    }
  }, [isSignedIn, markFeatureTourSeen, scope]);

  const open = eligible && delayElapsed;
  const slides =
    user && isAdminEmail(user.email)
      ? [
          ...SLIDES,
          {
            icon: BarChart3,
            title: "Admin overview",
            text: "Open your profile’s admin section to review registered users, recent activity and study progress.",
          },
        ]
      : SLIDES;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finishTour();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finishTour]);

  if (!open) return null;

  const currentIndex = Math.min(index, slides.length - 1);
  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-tour-title"
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div
          className="flex flex-col items-center gap-4 px-6 pb-4 pt-8 text-center"
          aria-live="polite"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 id="feature-tour-title" className="text-xl font-semibold">
            {slide.title}
          </h2>
          <p className="min-h-[4.5rem] text-sm text-muted-foreground">
            {slide.text}
          </p>
        </div>

        <div className="flex justify-center gap-1.5 pb-4" aria-hidden="true">
          {slides.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === currentIndex ? "bg-foreground" : "bg-border",
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={finishTour}
          >
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={currentIndex === 0}
              onClick={() => setIndex(currentIndex - 1)}
            >
              Back
            </Button>
            {isLast ? (
              <Button className="cursor-pointer" onClick={finishTour}>
                Start learning
              </Button>
            ) : (
              <Button
                className="cursor-pointer"
                onClick={() => setIndex(currentIndex + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
