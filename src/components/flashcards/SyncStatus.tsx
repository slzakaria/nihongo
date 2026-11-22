"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useBookmarkStore } from "@/store/bookmarks";
import { useProgressStore } from "@/store/progress";

export function SyncStatus() {
  const userId = useAuthStore((s) => s.user?.id);
  const pendingCards = useProgressStore(
    (s) => Object.keys(s.pendingCardsByUser[userId ?? ""] ?? {}).length,
  );
  const pendingDays = useProgressStore(
    (s) => Object.keys(s.pendingStudyDaysByUser[userId ?? ""] ?? {}).length,
  );
  const pendingResets = useProgressStore(
    (s) =>
      Object.keys(s.pendingScenarioResetsByUser[userId ?? ""] ?? {}).length,
  );
  const pendingBookmarks = useBookmarkStore(
    (s) => Object.keys(s.pendingByUser[userId ?? ""] ?? {}).length,
  );
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const hasPending =
    pendingCards + pendingDays + pendingResets + pendingBookmarks > 0;
  if (online !== false && !hasPending) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className="text-xs text-muted-foreground"
    >
      {online === false
        ? "Offline — practice progress is saved on this device."
        : "Changes are saved on this device and waiting to sync."}
    </p>
  );
}
