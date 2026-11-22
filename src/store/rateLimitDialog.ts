import { create } from "zustand";

// Lets any fetch call (TTS, STT, word lookup, simulator, scoring...) that gets a 429 open a
// centered dialog explaining the guest limit and nudging the user to sign in.
interface RateLimitDialogStore {
  open: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

const DEFAULT_MESSAGE = "You've reached today's guest limit for this feature.";

export const useRateLimitDialogStore = create<RateLimitDialogStore>((set) => ({
  open: false,
  message: DEFAULT_MESSAGE,
  show: (message) => set({ open: true, message: message || DEFAULT_MESSAGE }),
  hide: () => set({ open: false }),
}));

// Non-hook helper so plain modules (e.g. lib/tts/speak.ts) can trigger the dialog too.
export function showGuestLimitDialog(message?: string) {
  useRateLimitDialogStore.getState().show(message);
}
