'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

// Registers the offline-caching service worker (production only, avoids dev HMR cache issues)
// and prompts a reload when a new version has been installed in the background.
export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })
      })
      .catch(err => console.error('Service worker registration failed', err))
  }, [])

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-sm shadow-lg">
      <span>A new version is available</span>
      <Button size="sm" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </div>
  )
}
