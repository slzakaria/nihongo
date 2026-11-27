import { useEffect, useState } from 'react';

// `null` until mounted, since `navigator.onLine` isn't available during SSR and assuming either
// true/false before the client checks could flash a wrong state. Shared by SyncStatus (per-page
// pending-write notices) and the global OfflineBadge, so there's one source of truth for "online".
export function useOnlineStatus(): boolean | null {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return online;
}
