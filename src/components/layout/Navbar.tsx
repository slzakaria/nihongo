'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SettingsMenu } from '@/components/layout/SettingsMenu'

const links = [
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/simulator', label: 'Simulator' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <Link href="/" className="shrink-0 whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg">
          にほん <span className="text-muted-foreground font-normal ml-1">trip</span>
        </Link>
        <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1">
            {links.map(link => {
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted sm:px-3 sm:text-sm',
                    active && 'bg-secondary text-secondary-foreground hover:bg-secondary'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <SettingsMenu />
        </div>
      </div>
    </header>
  )
}
