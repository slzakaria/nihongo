import { useOnboardingStore } from '@/store/onboarding';
import { useSettingsStore } from '@/store/settings';
import { useProgressStore, type ScenarioPhraseProgress } from '@/store/progress';
import { useGoalsStore } from '@/store/goals';
import { useBadgesStore } from '@/store/badges';
import { useStreakStore } from '@/store/streak';
import { useBookmarkStore } from '@/store/bookmarks';
import { useProfileFieldsStore } from '@/store/profileFields';
import { fetchProfile, upsertProfile } from '@/lib/supabase/profile';
import {
  deleteScenarioCards,
  fetchServerCards,
  upsertCards,
} from '@/lib/supabase/progress';
import {
  fetchBookmarks,
  deleteBookmarks,
  upsertBookmarks,
} from '@/lib/supabase/bookmarks';
import { recordStudyDays } from '@/lib/supabase/activity';
import {
  fetchServerScenarioProgress,
  upsertScenarioProgress,
} from '@/lib/supabase/scenarioProgress';
import { fetchFlashcardProgressResetState } from '@/lib/supabase/flashcardProgressState';
import { upsertSRSReviewEvents } from '@/lib/supabase/reviewEvents';
import { cardsAfterFlashcardReset, mergeCards } from '@/lib/srs/merge';

const hydratedUsers = new Set<string>();
const activeSyncs = new Map<string, Promise<void>>();
const queuedSyncs = new Map<string, number>();
const retryCounts = new Map<string, number>();
const rerunAfterSync = new Set<string>();

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine;
}

function hasPendingWrites(userId: string): boolean {
  const progress = useProgressStore.getState();
  const bookmarks = useBookmarkStore.getState();
  const profileFields = useProfileFieldsStore.getState();
  return Boolean(
    Object.keys(progress.pendingCardsByUser[userId] ?? {}).length ||
    Object.keys(progress.pendingReviewEventsByUser[userId] ?? {}).length ||
    Object.keys(progress.pendingScenarioProgressByUser?.[userId] ?? {}).length ||
    Object.keys(progress.pendingStudyDaysByUser[userId] ?? {}).length ||
    Object.keys(progress.pendingScenarioResetsByUser[userId] ?? {}).length ||
    Object.keys(bookmarks.pendingByUser[userId] ?? {}).length ||
    Object.keys(profileFields.pendingByUser[userId] ?? {}).length,
  );
}

function retryDelay(userId: string): number {
  const attempt = (retryCounts.get(userId) ?? 0) + 1;
  retryCounts.set(userId, attempt);
  return Math.min(60_000, 1_000 * 2 ** Math.min(attempt - 1, 6));
}

export function scheduleSync(userId: string, delay = 400): void {
  if (typeof window === 'undefined') return;
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
  if (timer !== undefined && typeof window !== 'undefined') window.clearTimeout(timer);
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
      'scenario resets',
      () =>
        deleteScenarioCards(
          userId,
          resetSnapshot.map((item) => item.scenarioSlug),
        ),
      () => useProgressStore.getState().acknowledgeScenarioResets(userId, resetSnapshot),
    );
    succeeded = resetSucceeded && succeeded;
  }

  if (resetSnapshot.length === 0 || !hasPendingResets(userId)) {
    const currentProgress = useProgressStore.getState();
    const cardSnapshot = Object.entries(
      currentProgress.pendingCardsByUser[userId] ?? {},
    ).map(([phraseId, pending]) => ({ phraseId, ...pending }));
    const reviewEventSnapshot = Object.entries(
      currentProgress.pendingReviewEventsByUser[userId] ?? {},
    ).map(([, event]) => event);
    const scenarioProgressSnapshot = Object.entries(
      currentProgress.pendingScenarioProgressByUser?.[userId] ?? {},
    ).map(([phraseId, pending]) => ({ phraseId, ...pending }));
    const daysSnapshot = Object.keys(
      currentProgress.pendingStudyDaysByUser[userId] ?? {},
    );
    const bookmarkSnapshot = Object.entries(
      useBookmarkStore.getState().pendingByUser[userId] ?? {},
    ).map(([phraseId, pending]) => ({ phraseId, ...pending }));
    const addBookmarks = bookmarkSnapshot.filter((item) => item.isBookmarked);
    const removeBookmarks = bookmarkSnapshot.filter((item) => !item.isBookmarked);

    if (cardSnapshot.length > 0) {
      const ok = await attempt(
        'review progress',
        () =>
          upsertCards(
            userId,
            cardSnapshot.map((item) => item.card),
          ),
        () => useProgressStore.getState().acknowledgeCards(userId, cardSnapshot),
      );
      succeeded = ok && succeeded;
    }

    if (reviewEventSnapshot.length > 0) {
      const ok = await attempt(
        'flashcard rating analytics',
        () =>
          upsertSRSReviewEvents(
            userId,
            reviewEventSnapshot.map(
              ({ operationId, phraseId, scenarioSlug, rating, reviewedAt }) => ({
                id: operationId,
                phraseId,
                scenarioSlug,
                rating,
                reviewedAt,
              }),
            ),
          ),
        () =>
          useProgressStore.getState().acknowledgeReviewEvents(
            userId,
            reviewEventSnapshot.map(({ operationId }) => ({ operationId })),
          ),
      );
      succeeded = ok && succeeded;
    }

    if (scenarioProgressSnapshot.length > 0) {
      const ok = await attempt(
        'scenario phrase progress',
        () =>
          upsertScenarioProgress(
            userId,
            scenarioProgressSnapshot.map(({ phraseId, scenarioSlug, exploredAt }) => ({
              phraseId,
              value: { scenarioSlug, exploredAt },
            })),
          ),
        () =>
          useProgressStore
            .getState()
            .acknowledgeScenarioProgress(userId, scenarioProgressSnapshot),
      );
      succeeded = ok && succeeded;
    }

    if (addBookmarks.length > 0) {
      const ok = await attempt(
        'saved phrases',
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
        'removed saved phrases',
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
        'study days',
        () => recordStudyDays(userId, daysSnapshot),
        () => useProgressStore.getState().acknowledgeStudyDays(userId, daysSnapshot),
      );
      succeeded = ok && succeeded;
    }

    const profileFieldsSnapshot = useProfileFieldsStore.getState().pendingByUser[userId];
    if (profileFieldsSnapshot && Object.keys(profileFieldsSnapshot).length > 0) {
      const ok = await attempt(
        'account settings',
        () => upsertProfile(userId, profileFieldsSnapshot),
        () =>
          useProfileFieldsStore.getState().acknowledgeFields(userId, profileFieldsSnapshot),
      );
      succeeded = ok && succeeded;
    }
  }

  return succeeded;
}

function hasPendingResets(userId: string): boolean {
  return (
    Object.keys(useProgressStore.getState().pendingScenarioResetsByUser[userId] ?? {})
      .length > 0
  );
}

// Runs once per sign-in, or after a failed first attempt when connectivity returns.
async function hydrateOnSignIn(userId: string): Promise<boolean> {
  useOnboardingStore.setState({ synced: false });
  try {
    const [serverCards, serverScenarioProgress, serverBookmarks, flashcardResetState] =
      await Promise.all([
        fetchServerCards(userId),
        fetchServerScenarioProgress(userId),
        fetchBookmarks(userId),
        fetchFlashcardProgressResetState(),
      ]);

    let profile: Awaited<ReturnType<typeof fetchProfile>> = null;
    let profileLoaded = false;
    try {
      profile = await fetchProfile(userId);
      profileLoaded = true;
    } catch (error) {
      console.error(
        'Unable to load the account profile; practice data will still synchronize.',
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
        featureTourVersion: profile.feature_tour_version ?? 0,
      });
      useSettingsStore.setState({ romajiMode: profile.romaji_mode });
      useGoalsStore.setState({ weeklyGoal: profile.weekly_goal ?? 50 });
      useStreakStore.setState({
        freezeUntil: profile.streak_freeze_until ?? null,
      });

      // Re-apply any edit that hasn't been confirmed written yet, so a stale server copy
      // (e.g. from a write that failed while offline) can't silently overwrite it.
      const pendingFields = useProfileFieldsStore.getState().pendingByUser[userId];
      if (pendingFields) {
        if (pendingFields.user_name !== undefined || pendingFields.has_onboarded !== undefined) {
          useOnboardingStore.setState({
            ...(pendingFields.user_name !== undefined && {
              userName: pendingFields.user_name ?? '',
            }),
            ...(pendingFields.has_onboarded !== undefined && {
              hasOnboarded: pendingFields.has_onboarded,
            }),
          });
        }
        if (pendingFields.romaji_mode !== undefined)
          useSettingsStore.setState({ romajiMode: pendingFields.romaji_mode });
        if (pendingFields.weekly_goal !== undefined)
          useGoalsStore.setState({ weeklyGoal: pendingFields.weekly_goal });
      }

      const localBadges = Object.keys(useBadgesStore.getState().celebrated);
      const serverBadges = profile.celebrated_badges ?? [];
      const mergedBadges = Array.from(new Set([...localBadges, ...serverBadges]));
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
      const celebratedBadges = Object.keys(useBadgesStore.getState().celebrated);
      await upsertProfile(userId, {
        user_name: userName,
        has_onboarded: hasOnboarded,
        romaji_mode: romajiMode,
        weekly_goal: weeklyGoal,
        celebrated_badges: celebratedBadges,
      });
    }

    const progressStore = useProgressStore.getState();
    const previousResetState = progressStore.flashcardProgressResetByUser?.[userId];
    const resetVersionAdvanced =
      flashcardResetState.version > (previousResetState?.version ?? 0);
    const resetAt = flashcardResetState.version > 0 ? flashcardResetState.resetAt : 0;
    const serverCardsAfterReset = cardsAfterFlashcardReset(serverCards, resetAt);
    const localCardsAfterReset = cardsAfterFlashcardReset(progressStore.cards, resetAt);
    const pendingCardWrites = progressStore.pendingCardsByUser?.[userId] ?? {};
    const pendingCardsAfterReset = Object.fromEntries(
      Object.entries(pendingCardWrites).filter(
        ([, pending]) =>
          resetAt <= 0 ||
          (pending.card.lastReview !== null && pending.card.lastReview >= resetAt),
      ),
    );
    useProgressStore.setState({
      pendingCardsByUser: {
        ...progressStore.pendingCardsByUser,
        [userId]: pendingCardsAfterReset,
      },
      ...(resetVersionAdvanced && {
        pendingScenarioResetsByUser: {
          ...progressStore.pendingScenarioResetsByUser,
          [userId]: {},
        },
      }),
      flashcardProgressResetByUser: {
        ...progressStore.flashcardProgressResetByUser,
        [userId]: flashcardResetState,
      },
    });

    const { merged, localOnly } = mergeCards(serverCardsAfterReset, localCardsAfterReset);
    if (localOnly.length > 0) progressStore.queueCardsForSync(userId, localOnly);
    const pendingResets =
      useProgressStore.getState().pendingScenarioResetsByUser[userId] ?? {};
    for (const [phraseId, card] of Object.entries(merged)) {
      if (pendingResets[card.scenarioSlug]) delete merged[phraseId];
    }
    const pendingCards = useProgressStore.getState().pendingCardsByUser[userId] ?? {};
    for (const [phraseId, pending] of Object.entries(pendingCards)) {
      merged[phraseId] = pending.card;
    }
    useProgressStore.setState({ cards: merged });

    const scenarioProgressStore = useProgressStore.getState();
    const localScenarioProgress = scenarioProgressStore.scenarioProgress ?? {};
    const mergedScenarioProgress: Record<string, ScenarioPhraseProgress> = {
      ...serverScenarioProgress,
      ...localScenarioProgress,
    };
    const localOnlyScenarioProgress = Object.entries(localScenarioProgress)
      .filter(([phraseId]) => !serverScenarioProgress[phraseId])
      .map(([phraseId, value]) => ({ phraseId, value }));
    if (localOnlyScenarioProgress.length > 0) {
      scenarioProgressStore.queueScenarioProgressForSync(
        userId,
        localOnlyScenarioProgress,
      );
    }
    const pendingScenarioProgress =
      useProgressStore.getState().pendingScenarioProgressByUser?.[userId] ?? {};
    for (const [phraseId, pending] of Object.entries(pendingScenarioProgress)) {
      mergedScenarioProgress[phraseId] = {
        scenarioSlug: pending.scenarioSlug,
        exploredAt: pending.exploredAt,
      };
    }
    useProgressStore.setState({ scenarioProgress: mergedScenarioProgress });

    const bookmarkStore = useBookmarkStore.getState();
    const serverBookmarkSet = new Set(serverBookmarks);
    const mergedBookmarks = new Set([...serverBookmarks, ...bookmarkStore.phraseIds]);
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
    console.error('Unable to load account data; local practice data was kept.', error);
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
