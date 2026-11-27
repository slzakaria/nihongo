import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RomajiMode, TtsSpeed } from '@/types';
import { useAuthStore } from '@/store/auth';
import { useProfileFieldsStore } from '@/store/profileFields';

interface SettingsStore {
  romajiMode: RomajiMode;
  setRomajiMode: (mode: RomajiMode) => void;
  ttsSpeed: TtsSpeed;
  setTtsSpeed: (speed: TtsSpeed) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      romajiMode: 'always',
      setRomajiMode: (mode) => {
        set({ romajiMode: mode });
        const userId = useAuthStore.getState().user?.id;
        if (userId) useProfileFieldsStore.getState().queueFields(userId, { romaji_mode: mode });
      },
      ttsSpeed: 1,
      setTtsSpeed: (speed) => set({ ttsSpeed: speed }),
    }),
    { name: 'nihongo-settings' },
  ),
);
