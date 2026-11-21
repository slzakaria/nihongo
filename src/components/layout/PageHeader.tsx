import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Shared page header with the landing page's gradient, so every page opens the same way
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
        'animate-fade-up gradient-brand relative overflow-hidden rounded-xl p-6 sm:p-8',
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  )
}
