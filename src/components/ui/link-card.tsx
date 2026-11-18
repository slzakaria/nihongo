import Link from 'next/link'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// A whole card that links somewhere, with the same hover treatment across the app.
// Pass `index` in a grid to stagger the entrance animation.
export function LinkCard({
  href,
  children,
  className,
  index = 0,
}: {
  href: string
  children: ReactNode
  className?: string
  index?: number
}) {
  return (
    <Link
      href={href}
      className="group block h-full animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
      <Card
        className={cn(
          'h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md',
          className
        )}
      >
        {children}
      </Card>
    </Link>
  )
}
