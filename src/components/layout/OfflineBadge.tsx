'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

// App-wide "you're offline" indicator, shown on every page regardless of what's on screen —
// SyncStatus already covers pending-write detail inside practice flows, but there was no signal
// at all elsewhere, so a dropped connection looked like silent/broken behaviour rather than an
// intentional offline mode.
export function OfflineBadge() {
  const online = useOnlineStatus();
  if (online !== false) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      You&apos;re offline — progress is saved on this device.
    </div>
  );
}
