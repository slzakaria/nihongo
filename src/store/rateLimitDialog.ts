import { create } from 'zustand';

// Lets any fetch call that gets a 429 open the shared daily-limit dialog.
interface RateLimitDialogStore {
  open: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

const DEFAULT_MESSAGE = "You've reached today's usage limit.";

export const useRateLimitDialogStore = create<RateLimitDialogStore>((set) => ({
  open: false,
  message: DEFAULT_MESSAGE,
  show: (message) => set({ open: true, message: message || DEFAULT_MESSAGE }),
  hide: () => set({ open: false }),
}));

// Non-hook helper so plain modules (e.g. lib/tts/speak.ts) can trigger the dialog too.
export function showRateLimitDialog(message?: string) {
  useRateLimitDialogStore.getState().show(message);
}
