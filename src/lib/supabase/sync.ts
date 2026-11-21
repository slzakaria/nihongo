import { useOnboardingStore } from '@/store/onboarding'
import { useSettingsStore } from '@/store/settings'
import { useProgressStore } from '@/store/progress'
import { useGoalsStore } from '@/store/goals'
import { useBadgesStore } from '@/store/badges'
import { useStreakStore } from '@/store/streak'
import { fetchProfile, upsertProfile } from '@/lib/supabase/profile'
import { fetchServerCards, upsertCards } from '@/lib/supabase/progress'
import { mergeCards } from '@/lib/srs/merge'

// Runs once per sign-in: pulls server state, or seeds it from local (guest) data on first login
export async function hydrateOnSignIn(userId: string) {
  useOnboardingStore.setState({ synced: false })
  try {
    const [profile, serverCards] = await Promise.all([fetchProfile(userId), fetchServerCards(userId)])

    if (profile) {
      // Keep a name typed on this device if the server copy is still empty, so it isn't wiped
      const local = useOnboardingStore.getState()
      useOnboardingStore.setState({
        hasOnboarded: profile.has_onboarded,
        userName: profile.user_name || local.userName,
        avatarUrl: profile.avatar_url ?? null,
        profileIntroSeen: profile.profile_intro_seen ?? false,
        featureTourSeen: profile.feature_tour_seen ?? false,
      })
      useSettingsStore.setState({ romajiMode: profile.romaji_mode })
      useGoalsStore.setState({ weeklyGoal: profile.weekly_goal ?? 50 })
      useStreakStore.setState({ freezeUntil: profile.streak_freeze_until ?? null })

      // Badges are monotonic — a device shouldn't "lose" a badge it already celebrated locally just
      // because it signed in to an account whose server copy hasn't seen it yet, so this merges
      // rather than overwriting outright.
      const localBadges = Object.keys(useBadgesStore.getState().celebrated)
      const serverBadges = profile.celebrated_badges ?? []
      const mergedBadges = Array.from(new Set([...localBadges, ...serverBadges]))
      useBadgesStore.setState({ celebrated: Object.fromEntries(mergedBadges.map(id => [id, true])) })
      if (mergedBadges.length !== serverBadges.length) {
        await upsertProfile(userId, { celebrated_badges: mergedBadges })
      }
    } else {
      const { hasOnboarded, userName } = useOnboardingStore.getState()
      const { romajiMode } = useSettingsStore.getState()
      const { weeklyGoal } = useGoalsStore.getState()
      const celebratedBadges = Object.keys(useBadgesStore.getState().celebrated)
      await upsertProfile(userId, {
        user_name: userName,
        has_onboarded: hasOnboarded,
        romaji_mode: romajiMode,
        weekly_goal: weeklyGoal,
        celebrated_badges: celebratedBadges,
      })
    }

    const localCards = useProgressStore.getState().cards
    const { merged, localOnly } = mergeCards(serverCards, localCards)
    if (localOnly.length > 0) await upsertCards(userId, localOnly)
    useProgressStore.setState({ cards: merged })
  } finally {
    useOnboardingStore.setState({ synced: true })
  }
}
