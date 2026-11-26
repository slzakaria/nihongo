'use client';

import { useCallback, useSyncExternalStore } from 'react';

const CHANGE_EVENT = 'nihongo:local-storage-flag-changed';

export function useLocalStorageFlag(key: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) onChange();
      };
      window.addEventListener(CHANGE_EVENT, onChange);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener('storage', onStorage);
      };
    },
    [key],
  );
  const getSnapshot = useCallback(() => window.localStorage.getItem(key) === '1', [key]);

  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}

export function markLocalStorageFlag(key: string): void {
  window.localStorage.setItem(key, '1');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
