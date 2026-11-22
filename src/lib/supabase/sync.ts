import { useOnboardingStore } from "@/store/onboarding";
import { useSettingsStore } from "@/store/settings";
import { useProgressStore, type PendingCardWrite } from "@/store/progress";
import { useGoalsStore } from "@/store/goals";
import { useBadgesStore } from "@/store/badges";
import { useStreakStore } from "@/store/streak";
import { useBookmarkStore, type PendingBookmarkWrite } from "@/store/bookmarks";
import { fetchProfile, upsertProfile } from "@/lib/supabase/profile";
import {
  deleteScenarioCards,
  fetchServerCards,
  upsertCards,
} from "@/lib/supabase/progress";
import {
  fetchBookmarks,
  deleteBookmarks,
  upsertBookmarks,
} from "@/lib/supabase/bookmarks";
import { recordStudyDays } from "@/lib/supabase/activity";
import { mergeCards } from "@/lib/srs/merge";

const hydratedUsers = new Set<string>();
const activeSyncs = new Map<string, Promise<void>>();
const queuedSyncs = new Map<string, number>();
const retryCounts = new Map<string, number>();
const rerunAfterSync = new Set<string>();

function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

function hasPendingWrites(userId: string): boolean {
  const progress = useProgressStore.getState();
  const bookmarks = useBookmarkStore.getState();
  return Boolean(
    Object.keys(progress.pendingCardsByUser[userId] ?? {}).length ||
    Object.keys(progress.pendingStudyDaysByUser[userId] ?? {}).length ||
    Object.keys(progress.pendingScenarioResetsByUser[userId] ?? {}).length ||
    Object.keys(bookmarks.pendingByUser[userId] ?? {}).length,
  );
}

function retryDelay(userId: string): number {
  const attempt = (retryCounts.get(userId) ?? 0) + 1;
  retryCounts.set(userId, attempt);
  return Math.min(60_000, 1_000 * 2 ** Math.min(attempt - 1, 6));
}

export function scheduleSync(userId: string, delay = 400): void {
  if (typeof window === "undefined") return;
  const existing = queuedSyncs.get(userId);
  if (existing !== undefined) window.clearTimeout(existing);
  const timer = window.setTimeout(() => {
    queuedSyncs.delete(userId);
    void syncForUser(userId);
  }, delay);
  queuedSyncs.set(userId, timer);
}

export function forgetUser(userId: string): void {
  hydratedUsers.delete(userId);
  retryCounts.delete(userId);
  rerunAfterSync.delete(userId);
  const timer = queuedSyncs.get(userId);
  if (timer !== undefined && typeof window !== "undefined")
    window.clearTimeout(timer);
  queuedSyncs.delete(userId);
}

async function attempt(
  label: string,
  operation: () => Promise<void>,
  acknowledge: () => void,
): Promise<boolean> {
  try {
    await operation();
    acknowledge();
    return true;
  } catch (error) {
    console.error(`Unable to sync ${label}; the change remains queued.`, error);
    return false;
  }
}

async function flushPendingWrites(userId: string): Promise<boolean> {
  let succeeded = true;
  const progress = useProgressStore.getState();
  const resetSnapshot = Object.entries(
    progress.pendingScenarioResetsByUser[userId] ?? {},
  ).map(([scenarioSlug, operationId]) => ({ scenarioSlug, operationId }));

  if (resetSnapshot.length > 0) {
    const resetSucceeded = await attempt(
      "scenario resets",
      () =>
        deleteScenarioCards(
          userId,
          resetSnapshot.map((item) => item.scenarioSlug),
        ),
      () =>
        useProgressStore
          .getState()
          .acknowledgeScenarioResets(userId, resetSnapshot),
    );
    succeeded = resetSucceeded && succeeded;
  }

  if (resetSnapshot.length === 0 || !hasPendingResets(userId)) {
    const currentProgress = useProgressStore.getState();
    const cardSnapshot = Object.entries(
      currentProgress.pendingCardsByUser[userId] ?? {},
    ).map(([phraseId, pending]) => ({ phraseId, ...pending }));
    const daysSnapshot = Object.keys(
      currentProgress.pendingStudyDaysByUser[userId] ?? {},
    );
    const bookmarkSnapshot = Object.entries(
      useBookmarkStore.getState().pendingByUser[userId] ?? {},
    ).map(([phraseId, pending]) => ({ phraseId, ...pending }));
    const addBookmarks = bookmarkSnapshot.filter((item) => item.isBookmarked);
    const removeBookmarks = bookmarkSnapshot.filter(
      (item) => !item.isBookmarked,
    );

    if (cardSnapshot.length > 0) {
      const ok = await attempt(
        "review progress",
        () =>
          upsertCards(
            userId,
            cardSnapshot.map((item) => item.card),
          ),
        () =>
          useProgressStore.getState().acknowledgeCards(userId, cardSnapshot),
      );
      succeeded = ok && succeeded;
    }

    if (addBookmarks.length > 0) {
      const ok = await attempt(
        "saved phrases",
        () =>
          upsertBookmarks(
            userId,
            addBookmarks.map((item) => item.phraseId),
          ),
        () => useBookmarkStore.getState().acknowledge(userId, addBookmarks),
      );
      succeeded = ok && succeeded;
    }

    if (removeBookmarks.length > 0) {
      const ok = await attempt(
        "removed saved phrases",
        () =>
          deleteBookmarks(
            userId,
            removeBookmarks.map((item) => item.phraseId),
          ),
        () => useBookmarkStore.getState().acknowledge(userId, removeBookmarks),
      );
      succeeded = ok && succeeded;
    }

    if (daysSnapshot.length > 0) {
      const ok = await attempt(
        "study days",
        () => recordStudyDays(userId, daysSnapshot),
        () =>
          useProgressStore
            .getState()
            .acknowledgeStudyDays(userId, daysSnapshot),
      );
      succeeded = ok && succeeded;
    }
  }

  return succeeded;
}

function hasPendingResets(userId: string): boolean {
  return (
    Object.keys(
      useProgressStore.getState().pendingScenarioResetsByUser[userId] ?? {},
    ).length > 0
  );
}

// Runs once per sign-in, or after a failed first attempt when connectivity returns.
async function hydrateOnSignIn(userId: string): Promise<boolean> {
  useOnboardingStore.setState({ synced: false });
  try {
    const [serverCards, serverBookmarks] = await Promise.all([
      fetchServerCards(userId),
      fetchBookmarks(userId),
    ]);

    let profile: Awaited<ReturnType<typeof fetchProfile>> = null;
    let profileLoaded = false;
    try {
      profile = await fetchProfile(userId);
      profileLoaded = true;
    } catch (error) {
      console.error(
        "Unable to load the account profile; practice data will still synchronize.",
        error,
      );
    }

    if (profileLoaded && profile) {
      const local = useOnboardingStore.getState();
      useOnboardingStore.setState({
        hasOnboarded: profile.has_onboarded,
        userName: profile.user_name || local.userName,
        avatarUrl: profile.avatar_url ?? null,
        profileIntroSeen: profile.profile_intro_seen ?? false,
        featureTourSeen: profile.feature_tour_seen ?? false,
      });
      useSettingsStore.setState({ romajiMode: profile.romaji_mode });
      useGoalsStore.setState({ weeklyGoal: profile.weekly_goal ?? 50 });
      useStreakStore.setState({
        freezeUntil: profile.streak_freeze_until ?? null,
      });

      const localBadges = Object.keys(useBadgesStore.getState().celebrated);
      const serverBadges = profile.celebrated_badges ?? [];
      const mergedBadges = Array.from(
        new Set([...localBadges, ...serverBadges]),
      );
      useBadgesStore.setState({
        celebrated: Object.fromEntries(mergedBadges.map((id) => [id, true])),
      });
      if (mergedBadges.length !== serverBadges.length) {
        await upsertProfile(userId, { celebrated_badges: mergedBadges });
      }
    } else if (profileLoaded) {
      const { hasOnboarded, userName } = useOnboardingStore.getState();
      const { romajiMode } = useSettingsStore.getState();
      const { weeklyGoal } = useGoalsStore.getState();
      const celebratedBadges = Object.keys(
        useBadgesStore.getState().celebrated,
      );
      await upsertProfile(userId, {
        user_name: userName,
        has_onboarded: hasOnboarded,
        romaji_mode: romajiMode,
        weekly_goal: weeklyGoal,
        celebrated_badges: celebratedBadges,
      });
    }

    const progressStore = useProgressStore.getState();
    const localCards = progressStore.cards;
    const { merged, localOnly } = mergeCards(serverCards, localCards);
    if (localOnly.length > 0)
      progressStore.queueCardsForSync(userId, localOnly);
    const pendingResets =
      useProgressStore.getState().pendingScenarioResetsByUser[userId] ?? {};
    for (const [phraseId, card] of Object.entries(merged)) {
      if (pendingResets[card.scenarioSlug]) delete merged[phraseId];
    }
    const pendingCards =
      useProgressStore.getState().pendingCardsByUser[userId] ?? {};
    for (const [phraseId, pending] of Object.entries(pendingCards)) {
      merged[phraseId] = pending.card;
    }
    useProgressStore.setState({ cards: merged });

    const bookmarkStore = useBookmarkStore.getState();
    const serverBookmarkSet = new Set(serverBookmarks);
    const mergedBookmarks = new Set([
      ...serverBookmarks,
      ...bookmarkStore.phraseIds,
    ]);
    const pendingBookmarks = bookmarkStore.pendingByUser[userId] ?? {};
    for (const [phraseId, pending] of Object.entries(pendingBookmarks)) {
      if (pending.isBookmarked) mergedBookmarks.add(phraseId);
      else mergedBookmarks.delete(phraseId);
    }
    const localOnlyBookmarks = [...mergedBookmarks].filter(
      (id) => !serverBookmarkSet.has(id),
    );
    bookmarkStore.queueBookmarksForSync(
      userId,
      localOnlyBookmarks.filter((id) => !pendingBookmarks[id]),
    );
    useBookmarkStore.getState().setPhraseIds([...mergedBookmarks]);

    hydratedUsers.add(userId);
    return true;
  } catch (error) {
    console.error(
      "Unable to load account data; local practice data was kept.",
      error,
    );
    return false;
  } finally {
    useOnboardingStore.setState({ synced: true });
  }
}

export async function syncForUser(userId: string): Promise<void> {
  if (!isOnline()) {
    useOnboardingStore.setState({ synced: true });
    return;
  }

  const active = activeSyncs.get(userId);
  if (active) {
    rerunAfterSync.add(userId);
    return active;
  }

  const task = (async () => {
    if (!hydratedUsers.has(userId) && !(await hydrateOnSignIn(userId))) {
      scheduleSync(userId, retryDelay(userId));
      return;
    }

    const succeeded = await flushPendingWrites(userId);
    if (!succeeded) {
      scheduleSync(userId, retryDelay(userId));
      return;
    }

    retryCounts.delete(userId);
    if (hasPendingWrites(userId)) scheduleSync(userId, 100);
  })();

  activeSyncs.set(userId, task);
  try {
    await task;
  } finally {
    activeSyncs.delete(userId);
    if (rerunAfterSync.delete(userId)) scheduleSync(userId, 0);
  }
}
