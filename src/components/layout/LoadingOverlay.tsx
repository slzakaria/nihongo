'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useBusyStore } from '@/store/busy'

// Quick navigations and requests finish before this, so the overlay doesn't flash on them
const SHOW_AFTER_MS = 150

export function LoadingOverlay() {
  const busy = useBusyStore(s => s.navigating || s.pending > 0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!busy) return
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    return () => {
      clearTimeout(timer)
      setVisible(false)
    }
  }, [busy])

  if (!busy || !visible) return null

  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[60] flex cursor-wait items-center justify-center bg-background/60 backdrop-blur-sm"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
    </div>
  )
}
