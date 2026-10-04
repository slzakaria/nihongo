'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  type SpeechRecognitionLike,
} from '@/lib/speech/recognition'

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  // Starts false on both server and first client render to avoid a hydration
  // mismatch, then flips on after mount once we know the browser supports it.
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    // Mount-only feature detection — the standard fix for SSR/hydration mismatches
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(isSpeechRecognitionSupported())
  }, [])

  const start = useCallback((onResult: (text: string) => void) => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) onResult(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isSupported, isListening, start, stop }
}
