'use client'

import Link from 'next/link'
import { navLinks } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/auth'

export function Footer() {
  const user = useAuthStore(s => s.user)
  const links = navLinks
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto px-4 pb-8 pt-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4">
        <div className="h-px w-3/5 origin-center animate-draw-line bg-border" aria-hidden="true" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="transition-colors duration-200 hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-sm text-muted-foreground">⛩️ はなぞの:flower garden - made by <Link className='underline' target='_blank' href='https://zakariaslimane.dev/'>ZS</Link> so that R & Y dont always rely on him while in Japan ⛩️ - {year}</p>
      </div>
    </footer>
  )
}
