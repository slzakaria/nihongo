'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { SettingsMenu } from '@/components/layout/SettingsMenu';
import { AuthMenu } from '@/components/layout/AuthMenu';
import { Button } from '@/components/ui/button';
import { useSearchDialogStore } from '@/store/searchDialog';
import { cn } from '@/lib/utils';

export const navLinks = [
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/simulator', label: 'Simulator' },
  { href: '/kana', label: 'Kana' },
  { href: '/offline-practice', label: 'Offline' },
];

export function Navbar() {
  const pathname = usePathname();
  const showSearch = useSearchDialogStore((s) => s.show);
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenPath === pathname;
  const closeMobileMenu = () => setMobileOpenPath(null);
  const headerRef = useRef<HTMLElement>(null);
  const visibleLinks = navLinks;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        closeMobileMenu();
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="site-navbar relative z-50 border-b border-border bg-background shadow-none print:hidden"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <Image
            src="/hanazono.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span className="navbar-logo text-[15px]" lang="ja">
            花園 - はなぞの
          </span>
        </Link>

        <div className="header-actions flex items-center gap-1 sm:hidden">
          <AuthMenu />
          <SettingsMenu onOpen={closeMobileMenu} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpenPath((current) => (current === pathname ? null : pathname))
            }
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="hidden min-w-0 items-center justify-center gap-1 overflow-x-auto sm:flex sm:gap-3">
          {visibleLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground sm:px-1 sm:text-[13px] align-middle items-center',
                  active && 'font-semibold text-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={showSearch}
            className="relative flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground sm:px-1 sm:text-[13px]"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Search
          </button>
        </nav>

        <div className="header-actions hidden shrink-0 items-center gap-2 sm:flex">
          <AuthMenu />
          <SettingsMenu />
        </div>
      </div>

      {mobileOpen && (
        <nav className="absolute right-3 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-md border border-border bg-card p-2 shadow-md sm:hidden">
          {visibleLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                size="default"
                className={cn(
                  'w-full justify-start cursor-pointer',
                  active && 'bg-secondary/20 font-semibold hover:bg-secondary/25',
                )}
              >
                <Link href={link.href} onClick={closeMobileMenu}>
                  {link.label}
                </Link>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="default"
            className="w-full justify-start cursor-pointer gap-2"
            onClick={() => {
              closeMobileMenu();
              showSearch();
            }}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </Button>
        </nav>
      )}
    </header>
  );
}
