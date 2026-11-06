'use client'

import { useEffect } from 'react'
import { fetchContent, useContentStore } from '@/lib/data/content'

// Loads the latest phrases and kana from the database after the page mounts.
// Until then, the bundled JSON is shown, so nothing is blank while loading.
export function ContentSync() {
  const setContent = useContentStore(s => s.setContent)

  useEffect(() => {
    let cancelled = false
    fetchContent().then(content => {
      if (content && !cancelled) setContent(content)
    })
    return () => {
      cancelled = true
    }
  }, [setContent])

  return null
}
