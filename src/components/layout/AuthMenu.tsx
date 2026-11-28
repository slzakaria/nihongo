'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut, Smartphone, User, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useAuthStore } from '@/store/auth';
import { useOnboardingStore } from '@/store/onboarding';
import { Button } from '@/components/ui/button';
import { useSignInDialogStore } from '@/store/signInDialog';
import { useInstallAppDialogStore } from '@/store/installAppDialog';
import { Avatar } from '@/components/ui/avatar';

export function AuthMenu({
  onOpen,
  closeSignal,
}: {
  onOpen?: () => void;
  /** Bump this value from a parent to force the menu closed, e.g. when another menu opens. */
  closeSignal?: number;
}) {
  const user = useAuthStore((s) => s.user);
  const userName = useOnboardingStore((s) => s.userName);
  const avatarUrl = useOnboardingStore((s) => s.avatarUrl);
  const showSignIn = useSignInDialogStore((s) => s.show);
  const showInstallApp = useInstallAppDialogStore((s) => s.show);
  // Tracks the closeSignal value the open state was last set for, so a bump from the
  // parent (another menu opening) forces this one closed without an effect + setState.
  const [openState, setOpenState] = useState({ signal: closeSignal, open: false });
  const open = openState.signal === closeSignal && openState.open;
  const setOpen = (value: boolean) => setOpenState({ signal: closeSignal, open: value });
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut: clerkSignOut } = useClerk();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await clerkSignOut();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Account"
        onClick={() => {
          if (!user) {
            showSignIn();
            return;
          }
          if (!open) onOpen?.();
          setOpen(!open);
        }}
        className="cursor-pointer"
      >
        {user ? (
          <Avatar
            url={avatarUrl}
            label={userName || user.email || '?'}
            className="h-5 w-5 text-[9px]"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-card p-3 shadow-md">
          {user ? (
            <div className="space-y-2">
              <p className="px-1 text-xs font-medium text-muted-foreground">
                Signed in as
              </p>
              <p className="truncate px-1 text-sm">{user.email}</p>
              <Button
                asChild
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <Link href="/profile">
                  <UserRound className="h-3.5 w-3.5" />
                  View profile
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  showInstallApp();
                }}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Install app
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 cursor-pointer"
                onClick={signOut}
                loading={signingOut}
              >
                <LogOut className="h-3.5 w-3.5" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
