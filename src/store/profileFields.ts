import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfileRow } from '@/lib/supabase/profile';

// Profile-style fields that are edited locally and mirrored to the `profiles` table.
// Unlike SRS cards/bookmarks these are single values (last write wins), not a list of
// operations, so the pending queue only needs to remember the latest unsynced value per field.
export type PendingProfileFields = Partial<
  Pick<ProfileRow, 'user_name' | 'has_onboarded' | 'romaji_mode' | 'weekly_goal'>
>;

interface ProfileFieldsStore {
  // Local edits not yet confirmed written to Supabase, keyed by user id. Kept (and persisted)
  // so that a later hydrate can re-apply them instead of letting a possibly-stale server copy
  // silently overwrite a change that failed to sync, e.g. because the device was offline.
  pendingByUser: Record<string, PendingProfileFields>;
  queueFields: (userId: string, fields: PendingProfileFields) => void;
  acknowledgeFields: (userId: string, sent: PendingProfileFields) => void;
}

export const useProfileFieldsStore = create<ProfileFieldsStore>()(
  persist(
    (set) => ({
      pendingByUser: {},
      queueFields: (userId, fields) =>
        set((state) => ({
          pendingByUser: {
            ...state.pendingByUser,
            [userId]: { ...state.pendingByUser[userId], ...fields },
          },
        })),
      // Only clears a field if it still matches what was actually sent — if the user changed
      // it again while the write was in flight, that newer value stays queued.
      acknowledgeFields: (userId, sent) =>
        set((state) => {
          const pending = { ...state.pendingByUser[userId] };
          for (const key of Object.keys(sent) as (keyof PendingProfileFields)[]) {
            if (pending[key] === sent[key]) delete pending[key];
          }
          return { pendingByUser: { ...state.pendingByUser, [userId]: pending } };
        }),
    }),
    { name: 'nihongo-profile-fields' },
  ),
);
