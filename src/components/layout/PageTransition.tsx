'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// Keyed on the pathname so every route change replays the fade-in
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="flex flex-1 flex-col animate-fade-in">
      {children}
    </div>
  )
}
