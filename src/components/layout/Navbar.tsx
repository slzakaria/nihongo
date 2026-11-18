"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { AuthMenu } from "@/components/layout/AuthMenu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

export const navLinks = [
  { href: "/scenarios", label: "Scenarios" },
  { href: "/kana", label: "Kana (Alphabet)" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/simulator", label: "Simulator" },
  { href: "/search", label: "Search" }
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  // The navbar lives in the root layout, so it persists across pages. Close the mobile menu when the route changes.
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMobileOpen(false);
  }
  const headerRef = useRef<HTMLElement>(null);
  const visibleLinks = user ? [...navLinks, { href: "/profile", label: "Progress" }] : navLinks;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header ref={headerRef} className='relative border-b border-border bg-card print:hidden'>
      <div className='mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:px-6'>
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

        <div className='hidden min-w-0 items-center gap-0.5 sm:flex sm:gap-1'>
          <nav className='flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1'>
            {visibleLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted sm:px-3 sm:text-sm align-middle items-center",
                    active && "bg-secondary text-secondary-foreground hover:bg-secondary"
                  )}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
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
        </nav>
      )}
    </header>
  );
}
