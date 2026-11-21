'use client'

import Link from 'next/link'
import { navLinks } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/auth'

// Logo and nav grouped together as one row, signature line centered below — kept as a tight
// cluster rather than spread edge-to-edge, so there's no big empty gap between them.
export function Footer() {
  const user = useAuthStore(s => s.user)
  const links = navLinks
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border px-4 py-5 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Hanazono home">
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static asset, no benefit from next/image here */}
            <img src="/logohanazono.png" alt="Hanazono" width={40} height={40} className="h-10 w-10" />
          </Link>

          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {links.map(link => (
              <Link key={link.href} href={link.href} className="transition-colors duration-200 hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          ⛩️ はなぞの:flower garden - made by <Link className="underline" target="_blank" href="https://zakariaslimane.dev/">ZS</Link> so that R & Y dont always rely on him while in Japan ⛩️ - {year}
        </p>
      </div>
    </footer>
  )
}
