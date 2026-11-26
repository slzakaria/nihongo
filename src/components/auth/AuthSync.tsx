'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { isAdminEmail } from '@/lib/admin';
import { useAuthStore, type AppUser } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import { useBookmarkStore } from '@/store/bookmarks';
import { dayKey } from '@/lib/activity/studyDays';
import {
  clearDeviceData,
  DEVICE_OWNER_KEY,
  LAST_ACTIVITY_SYNC_KEY,
} from '@/lib/account/deviceData';

// Mirrors the Clerk session into useAuthStore, then pulls/merges server progress for the signed-in person
export function AuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const userKey = isSignedIn && user ? user.id : null;
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? null;
  const externalId = user?.externalId ?? null;
  const createdAt = user?.createdAt ? user.createdAt.toISOString() : null;
  const lastSignInAt = user?.lastSignInAt ? user.lastSignInAt.toISOString() : null;

  useEffect(() => {
    if (!isLoaded) return;
    const owner = localStorage.getItem(DEVICE_OWNER_KEY);
    if (!userKey) {
      window.Meticulous?.context.recordCustomContext('signedIn', false);
      useAuthStore.getState().setUser(null);
      if (owner) {
        clearDeviceData();
        void import('@/lib/supabase/sync').then((m) => m.forgetUser(owner));
      }
      return;
    }
    if (owner && owner !== (externalId ?? userKey)) {
      clearDeviceData();
      void import('@/lib/supabase/sync').then((m) => m.forgetUser(owner));
    }
    localStorage.setItem(DEVICE_OWNER_KEY, externalId ?? userKey);
    const appUser: AppUser = {
      id: externalId ?? userKey,
      email,
      phone,
      createdAt,
      lastSignInAt,
    };
    useAuthStore.getState().setUser(appUser);
    window.Meticulous?.context.recordUserId(appUser.id);
    if (email) window.Meticulous?.context.recordUserEmail(email);
    window.Meticulous?.context.recordCustomContext('signedIn', true);
    // Admins get the admin dashboard on /profile
    window.Meticulous?.context.recordCustomContext('userRole', isAdminEmail(email) ? 'admin' : 'user');
    // Supabase code loads only for signed-in people, so guests never download it
    void import('@/lib/supabase/sync')
      .then((m) => m.syncForUser(appUser.id))
      .catch((error) => console.error('Unable to synchronize account data.', error));
    void import('@/lib/supabase/profile').then((m) => m.syncAccountFields(appUser));
    // Only re-sync when the signed-in person or their details change
  }, [isLoaded, userKey, externalId, email, phone, createdAt, lastSignInAt]);

  useEffect(() => {
    if (!userKey) return;
    const syncUserId = externalId ?? userKey;

    const requestSync = (delay = 400) => {
      if (useAuthStore.getState().user?.id !== syncUserId) return;
      void import('@/lib/supabase/sync')
        .then((m) => m.scheduleSync(syncUserId, delay))
        .catch((error) =>
          console.error('Unable to schedule account synchronization.', error),
        );
    };

    const unsubscribeProgress = useProgressStore.subscribe((state, previous) => {
      if (
        state.pendingCardsByUser !== previous.pendingCardsByUser ||
        state.pendingScenarioProgressByUser !== previous.pendingScenarioProgressByUser ||
        state.pendingStudyDaysByUser !== previous.pendingStudyDaysByUser ||
        state.pendingScenarioResetsByUser !== previous.pendingScenarioResetsByUser
      ) {
        requestSync();
      }
    });
    const unsubscribeBookmarks = useBookmarkStore.subscribe((state, previous) => {
      if (state.pendingByUser !== previous.pendingByUser) requestSync();
    });
    const onOnline = () => requestSync(0);
    const onVisible = () => {
      if (document.visibilityState === 'visible') requestSync(0);
    };

    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      unsubscribeProgress();
      unsubscribeBookmarks();
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userKey, externalId]);

  // Clerk's own `lastSignInAt` only changes on a fresh sign-in, so it can go stale for days if the
  // session itself stays alive that long (same issue the session-lifetime cap addresses) or the tab
  // is just left open. Touch `last_sign_in_at` once per calendar day — on mount and whenever the tab
  // regains focus — so Supabase keeps reflecting genuine recent activity either way.
  useEffect(() => {
    if (!userKey) return;

    function touchActivity() {
      if (!userKey || document.visibilityState !== 'visible') return;
      const id = userKey;
      const marker = `${id}:${dayKey()}`;
      if (localStorage.getItem(LAST_ACTIVITY_SYNC_KEY) === marker) return;
      localStorage.setItem(LAST_ACTIVITY_SYNC_KEY, marker);
      void import('@/lib/supabase/profile').then((m) =>
        m.upsertProfile(id, { last_sign_in_at: new Date().toISOString() }),
      );
    }

    touchActivity();
    document.addEventListener('visibilitychange', touchActivity);
    return () => document.removeEventListener('visibilitychange', touchActivity);
  }, [userKey]);

  return null;
}
