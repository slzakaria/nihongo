'use client'

import { useCallback, useEffect, useRef } from 'react'
import { loadAudio } from '@/lib/tts/speak'
import { useSettingsStore } from '@/store/settings'
import { useAudioStore, nextAudioId } from '@/store/audio'

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

      try {
        const url = await loadAudio(text)
        const audio = new Audio(url)
        audio.playbackRate = useSettingsStore.getState().ttsSpeed
        audioRef.current = audio
        audio.onended = audio.onerror = () => {
          // Only clear the lock if we still hold it (a later play() could have already moved on)
          if (useAudioStore.getState().activeId === id) useAudioStore.setState({ activeId: null, status: 'idle' })
        }
        useAudioStore.setState({ status: 'playing' })
        await audio.play()
      } catch {
        if (useAudioStore.getState().activeId === id) useAudioStore.setState({ activeId: null, status: 'idle' })
      }
    },
    [id]
  )

  return { play, isLoading, isPlaying, disabled }
}
