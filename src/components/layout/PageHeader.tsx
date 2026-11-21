import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Shared page header with the landing page's hero photo background, so every page opens with the
// same look. Text is fixed to white/light tones rather than the theme-aware foreground colours,
// since the backdrop is now a photo rather than a theme-tinted gradient.
export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'animate-fade-up hero-banner relative overflow-hidden rounded-xl p-6 sm:p-8',
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-white/80">{description}</p>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  )
}
