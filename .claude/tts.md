// lib/tts/speak.ts
export function speakJapanese(text: string, rate = 0.85) {
  if (typeof window === 'undefined') return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = rate   // slightly slower for learning

  // Prefer a Japanese voice if available
  const voices = window.speechSynthesis.getVoices()
  const jaVoice = voices.find(v => v.lang === 'ja-JP')
  if (jaVoice) utterance.voice = jaVoice

  window.speechSynthesis.cancel()  // stop any ongoing speech
  window.speechSynthesis.speak(utterance)
}

ts
// hooks/useAudio.ts
export function useAudio() {
  const speak = useCallback((text: string) => speakJapanese(text), [])
  const [isSpeaking, setIsSpeaking] = useState(false)
  // ... wrap with speaking state
  return { speak, isSpeaking }
}