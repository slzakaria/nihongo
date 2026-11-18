"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { AuthMenu } from "@/components/layout/AuthMenu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useProgressStore } from "@/store/progress";

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
  const cards = useProgressStore((s) => s.cards);
  const [now] = useState(() => Date.now());
  const [mobileOpen, setMobileOpen] = useState(false);
  const dueCount = Object.values(cards).filter((c) => c.nextReview <= now).length;
  const visibleLinks = user ? [...navLinks, { href: "/profile", label: "Progress" }] : navLinks;

  return (
    <header className='border-b border-border bg-card print:hidden'>
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
        <nav className='flex flex-col gap-0.5 border-t border-border px-3 py-2 sm:hidden'>
          {visibleLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  active && "bg-secondary text-secondary-foreground hover:bg-secondary"
                )}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
