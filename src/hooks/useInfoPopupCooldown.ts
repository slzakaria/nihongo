'use client';

import { useCallback, useSyncExternalStore } from 'react';

const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = 'nihongo-info-popup-last-shown:';
const CHANGE_EVENT = 'nihongo:info-popup-shown';

export function isInfoPopupCooldownComplete(
  lastShownAt: number | null,
  now: number,
): boolean {
  return (
    lastShownAt === null ||
    !Number.isFinite(lastShownAt) ||
    now - lastShownAt >= COOLDOWN_MS
  );
}

export function useInfoPopupCooldown(scope: string | null): boolean {
  const key = scope ? `${STORAGE_PREFIX}${scope}` : null;
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!key) return () => {};
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) onChange();
      };
      window.addEventListener(CHANGE_EVENT, onChange);
      window.addEventListener('storage', onStorage);
      window.addEventListener('focus', onChange);
      return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('focus', onChange);
      };
    },
    [key],
  );
  const getSnapshot = useCallback(() => {
    if (!key) return false;
    const value = window.localStorage.getItem(key);
    const lastShownAt = value === null ? null : Number(value);
    return isInfoPopupCooldownComplete(lastShownAt, Date.now());
  }, [key]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function markInfoPopupShown(scope: string): void {
  window.localStorage.setItem(`${STORAGE_PREFIX}${scope}`, String(Date.now()));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
