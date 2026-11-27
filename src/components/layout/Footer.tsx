'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Smartphone } from 'lucide-react';
import { navLinks } from '@/components/layout/Navbar';
import { useInstallAppDialogStore } from '@/store/installAppDialog';

// Logo and nav grouped together as one row, signature line centered below — kept as a tight
// cluster rather than spread edge-to-edge, so there's no big empty gap between them.
export function Footer() {
  const links = navLinks;
  const year = new Date().getFullYear();
  const showInstallApp = useInstallAppDialogStore((s) => s.show);

  return (
    <footer className="mt-auto border-t border-border bg-background px-4 py-5 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <Image
              src="/hanazono.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="navbar-logo text-[15px]" lang="ja">
              花園 - はなぞの
            </span>
          </Link>

          <button
            type="button"
            onClick={showInstallApp}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            <Smartphone className="h-3.5 w-3.5" />
            Install app
          </button>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Made by{' '}
          <Link className="underline" target="_blank" href="https://zakariaslimane.dev/">
            ZS
          </Link>{' '}
          so that R & Y dont always rely on him while in Japan - {year}
        </p>
      </div>
    </footer>
  );
}
