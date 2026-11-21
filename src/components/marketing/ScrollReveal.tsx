'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Fades (and, on large screens, slides in from the side) a section once it scrolls into view —
// used to zig-zag the landing page's sections left/right as you scroll down. On mobile the
// horizontal slide is dropped (a left/right offset doesn't read well in a single narrow column),
// leaving just the fade + slight upward slide.
export function ScrollReveal({
  children,
  side = 'left',
  as: Tag = 'div',
  className,
}: {
  children: ReactNode
  side?: 'left' | 'right'
  // Lets callers keep a semantic <section> instead of downgrading it to a plain <div>
  as?: 'div' | 'section'
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const revealClassName = cn(
    'transition-all duration-700 ease-out',
    visible
      ? 'translate-x-0 translate-y-0 opacity-100'
      : cn('translate-y-6 opacity-0', side === 'left' ? 'lg:-translate-x-10' : 'lg:translate-x-10'),
    className
  )

  if (Tag === 'section') {
    return (
      <section ref={ref as React.RefObject<HTMLElement>} className={revealClassName}>
        {children}
      </section>
    )
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={revealClassName}>
      {children}
    </div>
  )
}
