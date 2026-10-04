'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  type SpeechRecognitionLike,
} from '@/lib/speech/recognition'

function isMediaRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  // Starts false on both server and first client render to avoid a hydration
  // mismatch, then flips on after mount once we know the browser supports it.
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    // Mount-only feature detection — the standard fix for SSR/hydration mismatches
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(isSpeechRecognitionSupported() || isMediaRecordingSupported())
  }, [])

  // Records with the mic and sends the clip to our own /api/stt (ElevenLabs) route —
  // used when the browser's built-in Web Speech API is unavailable or unreachable
  // (e.g. its direct network call to Google's speech servers gets blocked).
  const startServerRecording = useCallback(async (onResult: (text: string) => void) => {
    if (!isMediaRecordingSupported()) {
      setIsListening(false)
      setError('not-supported')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      const chunks: BlobPart[] = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        recorderRef.current = null
        setIsListening(false)
        if (chunks.length === 0) return

        setIsTranscribing(true)
        try {
          const form = new FormData()
          form.append('file', new Blob(chunks, { type: mimeType }), 'speech.webm')
          const res = await fetch('/api/stt', { method: 'POST', body: form })
          if (!res.ok) throw new Error('stt-failed')
          const data = (await res.json()) as { text?: string }
          if (data.text) onResult(data.text)
          else setError('no-speech')
        } catch {
          setError('stt-failed')
        } finally {
          setIsTranscribing(false)
        }
      }

      recorderRef.current = recorder
      setError(null)
      setIsListening(true)
      recorder.start()
    } catch {
      setIsListening(false)
      setError('not-allowed')
    }
  }, [])

  const start = useCallback(
    (onResult: (text: string) => void) => {
      // Ignore re-clicks while a session is already active instead of throwing
      // an "already started" InvalidStateError from the browser.
      if (recognitionRef.current || recorderRef.current) return

      setError(null)
      const Ctor = getSpeechRecognitionCtor()
      if (!Ctor) {
        void startServerRecording(onResult)
        return
      }

      const recognition = new Ctor()
      // No fixed lang — let the browser listen in whatever language the user speaks.
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = event => {
        const transcript = event.results[0]?.[0]?.transcript ?? ''
        if (transcript) onResult(transcript)
      }
      recognition.onend = () => {
        recognitionRef.current = null
        setIsListening(false)
      }
      recognition.onerror = event => {
        recognitionRef.current = null
        // A blocked/unreachable speech server reports as 'network' — fall back
        // to recording the clip ourselves and transcribing it server-side.
        if (event.error === 'network') {
          void startServerRecording(onResult)
          return
        }
        setIsListening(false)
        setError(event.error || 'unknown-error')
      }

      try {
        recognitionRef.current = recognition
        setIsListening(true)
        recognition.start()
      } catch {
        // Synchronous throw (e.g. called twice before the previous session tore down)
        recognitionRef.current = null
        void startServerRecording(onResult)
      }
    },
    [startServerRecording]
  )

  const stop = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop()
      return
    }
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  return { isSupported, isListening, isTranscribing, error, start, stop }
}
