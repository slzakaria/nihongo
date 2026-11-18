'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Mic, MicOff, RotateCcw } from 'lucide-react'
import { useContentStore } from '@/lib/data/content'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { AudioButton } from '@/components/phrases/AudioButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { trackBusy } from '@/store/busy'

interface Score {
  score: number
  words: { word: string; heard: boolean }[]
  tip: string
}

// Listening and speaking drill: hear the phrase, say it back, and see which words were missed
export default function SpeakingDrillPage() {
  const { slug } = useParams<{ slug: string }>()
  const scenario = useContentStore(s => s.content.phrases.find(x => x.slug === slug))
  const phrases = scenario?.phrases ?? []

  const [index, setIndex] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)
  const [result, setResult] = useState<Score | null>(null)
  const [heard, setHeard] = useState('')
  const [scoring, setScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isSupported, isListening, isTranscribing, error: micError, start, stop } = useSpeechRecognition()

  if (!scenario) {
    return <p className="px-4 py-10 text-sm text-muted-foreground">Scenario not found.</p>
  }

  const phrase = phrases[index]
  const done = index >= phrases.length

  async function score(transcript: string) {
    if (!phrase) return
    setHeard(transcript)
    setScoring(true)
    setError(null)
    try {
      const res = await trackBusy(fetch('/api/practice/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: { japanese: phrase.japanese, romaji: phrase.romaji, english: phrase.english },
          transcript,
        }),
      }))
      const data = (await res.json()) as Score & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Scoring failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed')
    } finally {
      setScoring(false)
    }
  }

  function next() {
    setIndex(i => i + 1)
    setShowMeaning(false)
    setResult(null)
    setHeard('')
    setError(null)
  }

  function retry() {
    setResult(null)
    setHeard('')
    setError(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <Link
          href={`/scenarios/${scenario.slug}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {scenario.label}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Speaking practice</h1>
        <p className="text-muted-foreground">Listen, say the phrase out loud, then check how you did.</p>
      </div>

      {done ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-lg font-medium">All done 🎉</p>
            <p className="text-sm text-muted-foreground">You practised {phrases.length} phrases in this scenario.</p>
            <Button type="button" variant="secondary" className="cursor-pointer" onClick={() => setIndex(0)}>
              Start again
            </Button>
          </CardContent>
        </Card>
      ) : !phrase ? null : (
        <>
          <Progress value={Math.round((index / phrases.length) * 100)} />

          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex items-center gap-3">
                <p lang="ja" className="text-2xl font-medium">{phrase.japanese}</p>
                <AudioButton text={phrase.japanese} />
              </div>
              {showMeaning ? (
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <p>{phrase.romaji}</p>
                  <p>{phrase.english}</p>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" className="cursor-pointer gap-2" onClick={() => setShowMeaning(true)}>
                  <Eye className="h-3.5 w-3.5" /> Show meaning
                </Button>
              )}
            </CardContent>
          </Card>

          {!result && (
            <div className="flex flex-col items-center gap-3">
              {isSupported ? (
                <Button
                  type="button"
                  size="lg"
                  className="cursor-pointer gap-2"
                  loading={scoring || isTranscribing}
                  disabled={scoring || isTranscribing}
                  onClick={() => (isListening ? stop() : start(text => void score(text)))}
                >
                  {!(scoring || isTranscribing) && (isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />)}
                  {isListening ? 'Stop recording' : scoring ? 'Checking…' : 'Record my reply'}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Your browser cannot record audio here.</p>
              )}
              {isListening && <p className="text-xs text-muted-foreground">Listening… say the phrase, then stop.</p>}
              {(micError || error) && (
                <p className="text-xs text-red-500">{error ?? 'We could not hear you. Please try again.'}</p>
              )}
            </div>
          )}

          {result && (
            <Card>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">You said</p>
                  <p lang="ja" className="text-sm">{heard}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className={cn('text-4xl font-semibold', result.score >= 80 ? 'text-primary' : 'text-foreground')}>
                    {result.score}%
                  </p>
                  <p className="text-xs text-muted-foreground">match with the target</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2" aria-label="Word by word">
                  {result.words.map((w, i) => (
                    <span
                      key={i}
                      lang="ja"
                      className={cn(
                        'rounded-full px-3 py-1 text-sm font-medium',
                        w.heard ? 'bg-accent text-accent-foreground' : 'border border-red-400 text-red-500 line-through'
                      )}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
                {result.tip && <p className="text-center text-sm text-muted-foreground">{result.tip}</p>}
                <div className="flex justify-center gap-2">
                  <Button type="button" variant="outline" className="cursor-pointer gap-2" onClick={retry}>
                    <RotateCcw className="h-3.5 w-3.5" /> Try again
                  </Button>
                  <Button type="button" className="cursor-pointer" onClick={next}>
                    Next phrase
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!result && (
            <div className="flex justify-center">
              <Button type="button" variant="ghost" size="sm" className="cursor-pointer gap-2" onClick={next}>
                <EyeOff className="h-3.5 w-3.5" /> Skip
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
