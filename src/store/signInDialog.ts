import { create } from 'zustand'

// Lets any control (navbar icon, sign-in banner) open the centered sign-in dialog
interface SignInDialogStore {
  open: boolean
  show: () => void
  hide: () => void
}

export const useSignInDialogStore = create<SignInDialogStore>(set => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}))
