'use client'

import { Loader2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AudioIconButton({
  isLoading,
  isPlaying,
  onClick,
  className,
}: {
  isLoading: boolean
  isPlaying: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Play pronunciation"
      disabled={isLoading}
      className={cn(isPlaying && 'text-primary-foreground bg-primary', className)}
      onClick={onClick}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  )
}
