import { useBadgesStore } from '@/store/badges';
import { useBookmarkStore } from '@/store/bookmarks';
import { useGoalsStore } from '@/store/goals';
import { useOnboardingStore } from '@/store/onboarding';
import { useProfileFieldsStore } from '@/store/profileFields';
import { useProgressStore } from '@/store/progress';

export const DEVICE_OWNER_KEY = 'nihongo-owner';
export const LAST_ACTIVITY_SYNC_KEY = 'nihongo-last-active-sync';

export function clearDeviceData() {
  useProgressStore.setState({
    cards: {},
    scenarioProgress: {},
    pendingCardsByUser: {},
    pendingScenarioProgressByUser: {},
    pendingStudyDaysByUser: {},
    pendingScenarioResetsByUser: {},
    flashcardProgressResetByUser: {},
  });
  useBookmarkStore.setState({ phraseIds: [], pendingByUser: {} });
  useGoalsStore.setState({
    dailyGoal: 10,
    day: '',
    reviewedToday: 0,
    weeklyGoal: 50,
    week: '',
    reviewedThisWeek: 0,
  });
  useBadgesStore.setState({ celebrated: {}, pendingCelebrations: [] });
  useOnboardingStore.setState({
    hasOnboarded: false,
    userName: '',
    avatarUrl: null,
    synced: false,
    profileIntroSeen: false,
    featureTourSeen: false,
    featureTourVersion: 0,
  });
  useProfileFieldsStore.setState({ pendingByUser: {} });

  for (const key of [
    'nihongo-progress',
    'nihongo-bookmarks',
    'nihongo-goals',
    'nihongo-badges',
    'nihongo-onboarding',
    'nihongo-profile-fields',
    DEVICE_OWNER_KEY,
    LAST_ACTIVITY_SYNC_KEY,
  ]) {
    localStorage.removeItem(key);
  }
}
