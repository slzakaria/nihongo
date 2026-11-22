import { create } from "zustand";

// The signed-in person as the app sees them. `id` is the database key: the Supabase ID for migrated users,
// the Clerk ID for new ones. Clerk's session token carries the same value, so row-level security still matches.
export interface AppUser {
  id: string;
  email: string | null;
  phone: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
}

interface AuthStore {
  user: AppUser | null;
  // False until the first session check finishes, so UI doesn't treat "still loading" as "signed out"
  loaded: boolean;
  setUser: (user: AppUser | null) => void;
}

// Mirrors the current Clerk session; kept by AuthSync, read by stores to decide whether to sync
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loaded: false,
  setUser: (user) => set({ user, loaded: true }),
}));
