'use client'

import { Search } from 'lucide-react'
import { useSearchDialogStore } from '@/store/searchDialog'
import { cn } from '@/lib/utils'

// Looks like a search input but just opens the shared SearchDialog — placed below the title on
// every page's header so search is reachable everywhere without a dedicated page.
export function SearchTrigger({ className }: { className?: string }) {
  const show = useSearchDialogStore(s => s.show)

  return (
    <button
      type="button"
      onClick={show}
      className={cn(
        'flex w-full max-w-sm cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-background/70 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground',
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
      Search phrases...
    </button>
  )
}
