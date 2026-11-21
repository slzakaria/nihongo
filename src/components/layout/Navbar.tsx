"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { AuthMenu } from "@/components/layout/AuthMenu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useSearchDialogStore } from "@/store/searchDialog";
import { cn } from "@/lib/utils";

export const navLinks = [
  { href: "/scenarios", label: "Scenarios" },
  { href: "/kana", label: "Kana" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/simulator", label: "Simulator" }
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const showSearch = useSearchDialogStore((s) => s.show);
  const [mobileOpen, setMobileOpen] = useState(false);
  // The navbar lives in the root layout, so it persists across pages. Close the mobile menu when the route changes.
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMobileOpen(false);
  }
  const headerRef = useRef<HTMLElement>(null);
  const visibleLinks = navLinks;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header ref={headerRef} className='relative border-b border-border bg-card print:hidden'>
      <div className='mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-6'>
        <Link href='/' className='shrink-0 whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg flex gap-2'>
          <span>花園</span> <span> - はなぞの</span>
        </Link>

        <div className='flex items-center gap-0.5 sm:hidden'>
          <AuthMenu />
          <SettingsMenu />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='cursor-pointer'
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
          </Button>
        </div>

        <nav className='hidden min-w-0 items-center justify-center gap-0.5 overflow-x-auto sm:flex sm:gap-1'>
          {visibleLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted sm:px-3 sm:text-sm align-middle items-center",
                  active && "bg-primary/15 font-semibold text-foreground hover:bg-primary/15"
                )}>
                {link.label}
              </Link>
            );
          })}
          <button
            type='button'
            onClick={showSearch}
            className='relative flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted sm:px-3 sm:text-sm'>
            <Search className='h-3.5 w-3.5' aria-hidden="true" />
            Search
          </button>
        </nav>

        <div className='hidden shrink-0 items-center gap-1 border-l border-border pl-3 sm:flex'>
          <AuthMenu />
          <SettingsMenu />
        </div>
      </div>

      {mobileOpen && (
        <nav className='absolute right-3 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-md border border-border bg-card p-2 shadow-md sm:hidden'>
          {visibleLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Button
                key={link.href}
                asChild
                variant={active ? "secondary" : "ghost"}
                size='default'
                className='w-full justify-start cursor-pointer'>
                <Link href={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              </Button>
            );
          })}
          <Button
            variant='ghost'
            size='default'
            className='w-full justify-start cursor-pointer gap-2'
            onClick={() => {
              setMobileOpen(false);
              showSearch();
            }}>
            <Search className='h-4 w-4' aria-hidden="true" />
            Search
          </Button>
        </nav>
      )}
    </header>
  );
}
