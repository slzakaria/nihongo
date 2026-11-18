'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Fast navigations finish before this, so the bar never flickers on them
const SHOW_AFTER_MS = 150
// Stops the bar if a navigation never completes (e.g. a click on a link to the current page)
const GIVE_UP_MS = 15000

// Thin top bar shown only while an in-app navigation is taking noticeable time
export function NavigationProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const giveUpTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null | undefined
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return

      clearTimeout(showTimer.current)
      clearTimeout(giveUpTimer.current)
      showTimer.current = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
      giveUpTimer.current = setTimeout(() => setVisible(false), GIVE_UP_MS)
    }

    // Capture phase runs before Next's Link handler, so the click is seen even though Link prevents the default
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // Runs when the route changes: the pending navigation is finished, so cancel its timers and hide the bar
  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current)
      clearTimeout(giveUpTimer.current)
      setVisible(false)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-primary/20"
    >
      <div className="h-full w-full animate-pulse bg-primary" />
    </div>
  )
}
