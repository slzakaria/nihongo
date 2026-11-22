import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/store/auth";

export interface PendingBookmarkWrite {
  operationId: string;
  isBookmarked: boolean;
}

function operationId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface BookmarkStore {
  phraseIds: string[];
  pendingByUser: Record<string, Record<string, PendingBookmarkWrite>>;
  toggleBookmark: (phraseId: string) => void;
  setPhraseIds: (phraseIds: string[]) => void;
  queueBookmarksForSync: (userId: string, phraseIds: string[]) => void;
  acknowledge: (
    userId: string,
    sent: Array<{ phraseId: string; operationId: string }>,
  ) => void;
  clear: () => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      phraseIds: [],
      pendingByUser: {},
      toggleBookmark: (phraseId) => {
        const wasBookmarked = get().phraseIds.includes(phraseId);
        const userId = useAuthStore.getState().user?.id;
        set((state) => ({
          phraseIds: wasBookmarked
            ? state.phraseIds.filter((id) => id !== phraseId)
            : [...state.phraseIds, phraseId],
          ...(userId && {
            pendingByUser: {
              ...state.pendingByUser,
              [userId]: {
                ...state.pendingByUser[userId],
                [phraseId]: {
                  operationId: operationId(),
                  isBookmarked: !wasBookmarked,
                },
              },
            },
          }),
        }));
      },
      setPhraseIds: (phraseIds) => set({ phraseIds: [...new Set(phraseIds)] }),
      queueBookmarksForSync: (userId, phraseIds) => {
        if (phraseIds.length === 0) return;
        set((state) => {
          const pending = { ...state.pendingByUser[userId] };
          for (const phraseId of phraseIds) {
            pending[phraseId] = {
              operationId: operationId(),
              isBookmarked: true,
            };
          }
          return {
            pendingByUser: {
              ...state.pendingByUser,
              [userId]: pending,
            },
          };
        });
      },
      acknowledge: (userId, sent) => {
        set((state) => {
          const pending = { ...state.pendingByUser[userId] };
          let changed = false;
          for (const item of sent) {
            if (pending[item.phraseId]?.operationId === item.operationId) {
              delete pending[item.phraseId];
              changed = true;
            }
          }
          if (!changed) return state;
          return {
            pendingByUser: {
              ...state.pendingByUser,
              [userId]: pending,
            },
          };
        });
      },
      clear: () => set({ phraseIds: [] }),
    }),
    {
      name: "nihongo-bookmarks",
      partialize: ({ phraseIds, pendingByUser }) => ({
        phraseIds,
        pendingByUser,
      }),
    },
  ),
);
