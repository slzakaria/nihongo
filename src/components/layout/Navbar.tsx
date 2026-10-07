"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { AuthMenu } from "@/components/layout/AuthMenu";
import { useAuthStore } from "@/store/auth";
import { useProgressStore } from "@/store/progress";

const links = [
  { href: "/scenarios", label: "Scenarios" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/simulator", label: "Simulator" },
  { href: "/search", label: "Search" }
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const cards = useProgressStore((s) => s.cards);
  const [now] = useState(() => Date.now());
  const dueCount = Object.values(cards).filter((c) => c.nextReview <= now).length;
  const visibleLinks = user ? [...links, { href: "/profile", label: "Progress" }] : links;

  return (
    <header className='border-b border-border bg-card print:hidden'>
      <div className='mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:px-6'>
          <Link href='/' className='shrink-0 whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg flex gap-2'>
            <span>花園 - はなぞの</span>
          </Link>
        <div className='flex min-w-0 items-center gap-0.5 sm:gap-1'>
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
                  {link.href === "/flashcards" && dueCount > 0 && (
                    <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {dueCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <AuthMenu />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
