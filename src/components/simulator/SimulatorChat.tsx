'use client'

import { useRef, useState } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SimulatorMessage } from '@/components/simulator/SimulatorMessage'
import { ChatMessage } from '@/types'
import { getScenarioStarter } from '@/lib/simulator/prompts'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

export function SimulatorChat({ scenarioSlug }: { scenarioSlug: string }) {
  const starter = getScenarioStarter(scenarioSlug)
  // `messages` is what's shown on screen (includes the opening line); `apiHistory` is
  // what's sent to Claude — the opener never counts as a turn, so history always starts on 'user'
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    starter ? [{ role: 'assistant', content: starter }] : []
  )
  const [apiHistory, setApiHistory] = useState<ChatMessage[]>([])
  const [autoPlayIndex, setAutoPlayIndex] = useState<number | null>(starter ? 0 : null)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isSupported: micSupported, isListening, start: startListening, stop: stopListening } =
    useSpeechRecognition()

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming) return

    const baseLen = messages.length
    const nextApiHistory: ChatMessage[] = [...apiHistory, { role: 'user', content: text }]
    setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextApiHistory, scenarioSlug }),
      })

      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[baseLen + 1] = { role: 'assistant', content: assistantText }
          return updated
        })
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }

      setApiHistory([...nextApiHistory, { role: 'assistant', content: assistantText }])
      setAutoPlayIndex(baseLen + 1)
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[baseLen + 1] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. [HINT: connection error]',
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  function handleMicClick() {
    if (isListening) {
      stopListening()
      return
    }
    startListening(transcript => {
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript))
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto sm:max-h-[65vh]">
        {messages.map((m, i) => (
          <SimulatorMessage key={i} message={m} autoPlay={i === autoPlayIndex} />
        ))}
        <div ref={scrollRef} />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          sendMessage()
        }}
        className="flex gap-2"
      >
        <input
          lang="ja"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="日本語で入力..."
          className="h-10 flex-1 rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {micSupported && (
          <Button
            type="button"
            variant={isListening ? 'secondary' : 'outline'}
            size="icon"
            aria-label={isListening ? 'Stop recording' : 'Record in Japanese'}
            onClick={handleMicClick}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
        <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
