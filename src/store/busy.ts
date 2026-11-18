import { create } from 'zustand'

// Drives the full-screen loading overlay while a page navigation or server request is waiting
interface BusyStore {
  navigating: boolean
  pending: number
  setNavigating: (navigating: boolean) => void
  begin: () => void
  end: () => void
}

export const useBusyStore = create<BusyStore>()(set => ({
  navigating: false,
  pending: 0,
  setNavigating: navigating => set({ navigating }),
  begin: () => set(s => ({ pending: s.pending + 1 })),
  end: () => set(s => ({ pending: Math.max(0, s.pending - 1) })),
}))

// Keeps the overlay up until the request settles, whether it succeeds or fails
export async function trackBusy<T>(request: Promise<T>): Promise<T> {
  useBusyStore.getState().begin()
  try {
    return await request
  } finally {
    useBusyStore.getState().end()
  }
}
