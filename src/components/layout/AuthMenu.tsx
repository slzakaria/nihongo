'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut, User, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useAuthStore } from '@/store/auth';
import { useOnboardingStore } from '@/store/onboarding';
import { Button } from '@/components/ui/button';
import { useSignInDialogStore } from '@/store/signInDialog';
import { Avatar } from '@/components/ui/avatar';

export function AuthMenu() {
  const user = useAuthStore((s) => s.user);
  const userName = useOnboardingStore((s) => s.userName);
  const avatarUrl = useOnboardingStore((s) => s.avatarUrl);
  const showSignIn = useSignInDialogStore((s) => s.show);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut: clerkSignOut } = useClerk();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
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
        onClick={() => (user ? setOpen((o) => !o) : showSignIn())}
        className="cursor-pointer"
      >
        {user ? (
          <Avatar
            url={avatarUrl}
            label={userName || user.email || user.phone || '?'}
            className="h-7 w-7 text-xs"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-md border border-border bg-card p-3 shadow-md">
          {user ? (
            <div className="space-y-2">
              <p className="px-1 text-xs font-medium text-muted-foreground">
                Signed in as
              </p>
              <p className="truncate px-1 text-sm">{user.email ?? user.phone}</p>
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
