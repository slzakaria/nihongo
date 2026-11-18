import { useOnboardingStore } from '@/store/onboarding'
import { useSettingsStore } from '@/store/settings'
import { useProgressStore } from '@/store/progress'
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
      })
      useSettingsStore.setState({ romajiMode: profile.romaji_mode })
    } else {
      const { hasOnboarded, userName } = useOnboardingStore.getState()
      const { romajiMode } = useSettingsStore.getState()
      await upsertProfile(userId, { user_name: userName, has_onboarded: hasOnboarded, romaji_mode: romajiMode })
    }

    const localCards = useProgressStore.getState().cards
    const { merged, localOnly } = mergeCards(serverCards, localCards)
    if (localOnly.length > 0) await upsertCards(userId, localOnly)
    useProgressStore.setState({ cards: merged })
  } finally {
    useOnboardingStore.setState({ synced: true })
  }
}
