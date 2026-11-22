import { create } from "zustand";

// Lets the search bar on any page (or the navbar) open the shared search dialog.
interface SearchDialogStore {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useSearchDialogStore = create<SearchDialogStore>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
