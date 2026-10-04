'use client'

import { useCallback, useRef, useState } from 'react'
import { loadAudio } from '@/lib/tts/speak'

export function useAudio() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(async (text: string) => {
    if (!text) return
    audioRef.current?.pause()
    setIsLoading(true)

    try {
      const url = await loadAudio(text)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = audio.onerror = () => setIsPlaying(false)
      setIsLoading(false)
      setIsPlaying(true)
      await audio.play()
    } catch {
      setIsLoading(false)
      setIsPlaying(false)
    }
  }, [])

  return { play, isLoading, isPlaying }
}
