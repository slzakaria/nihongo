import { create } from 'zustand';

// Lets any control (account menu, footer link) open the centered "install app" dialog
interface InstallAppDialogStore {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useInstallAppDialogStore = create<InstallAppDialogStore>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
