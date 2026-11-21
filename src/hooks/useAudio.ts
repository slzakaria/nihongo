'use client'

import { useCallback, useEffect, useRef } from 'react'
import { loadAudio } from '@/lib/tts/speak'
import { useSettingsStore } from '@/store/settings'
import { useAudioStore, nextAudioId } from '@/store/audio'

// Safety valve: if a play() never settles for any reason (network stall, a browser's autoplay
// policy silently blocking playback without rejecting the promise, etc.), the shared lock would
// otherwise disable every voice button on the page forever. Force it back to idle after this long.
const STUCK_LOCK_TIMEOUT_MS = 6000

export function useAudio() {
  const idRef = useRef<number | null>(null)
  if (idRef.current === null) idRef.current = nextAudioId()
  const id = idRef.current

  const activeId = useAudioStore(s => s.activeId)
  const status = useAudioStore(s => s.status)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const isMine = activeId === id
  const isLoading = isMine && status === 'loading'
  const isPlaying = isMine && status === 'playing'
  // True while *any* phrase is loading or playing, so every other button disables too —
  // this is what stops several voice buttons from firing overlapping TTS requests at once.
  const disabled = status !== 'idle'

  // Release the shared lock if this instance unmounts mid-playback (e.g. navigating away),
  // so a stray lock doesn't leave every voice button disabled forever.
  useEffect(() => {
    return () => {
      if (useAudioStore.getState().activeId === id) {
        audioRef.current?.pause()
        useAudioStore.setState({ activeId: null, status: 'idle' })
      }
    }
  }, [id])

  const play = useCallback(
    async (text: string) => {
      if (!text || useAudioStore.getState().status !== 'idle') return
      useAudioStore.setState({ activeId: id, status: 'loading' })

      const release = () => {
        if (useAudioStore.getState().activeId === id) useAudioStore.setState({ activeId: null, status: 'idle' })
      }
      // If this never settles, abort the underlying request and release the lock — without the
      // abort, a request that resolves late (well after its own timeout already gave up on it)
      // could still reach the `status: 'playing'` line below and re-steal the lock from whatever
      // newer play() call is using it by then.
      const controller = new AbortController()
      const stuckTimer = setTimeout(() => {
        controller.abort()
        release()
      }, STUCK_LOCK_TIMEOUT_MS)

      try {
        const url = await loadAudio(text, controller.signal)
        // Another play() may have taken over (e.g. the timeout above already fired) — don't
        // resume as this instance if we no longer hold the lock.
        if (useAudioStore.getState().activeId !== id) return

        const audio = new Audio(url)
        audio.playbackRate = useSettingsStore.getState().ttsSpeed
        audioRef.current = audio
        audio.onended = audio.onerror = () => {
          clearTimeout(stuckTimer)
          release()
        }
        useAudioStore.setState({ status: 'playing' })
        await audio.play()
      } catch {
        clearTimeout(stuckTimer)
        release()
      }
    },
    [id]
  )

  return { play, isLoading, isPlaying, disabled }
}
