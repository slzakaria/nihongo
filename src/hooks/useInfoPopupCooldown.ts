'use client';

import { useEffect, useState } from 'react';

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
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!scope) {
      setAvailable(false);
      return;
    }

    const key = `${STORAGE_PREFIX}${scope}`;
    const update = () => {
      const value = window.localStorage.getItem(key);
      const lastShownAt = value === null ? null : Number(value);
      setAvailable(isInfoPopupCooldownComplete(lastShownAt, Date.now()));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) update();
    };

    update();
    window.addEventListener(CHANGE_EVENT, update);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', update);
    return () => {
      window.removeEventListener(CHANGE_EVENT, update);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', update);
    };
  }, [scope]);

  return available;
}

export function markInfoPopupShown(scope: string): void {
  window.localStorage.setItem(`${STORAGE_PREFIX}${scope}`, String(Date.now()));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
