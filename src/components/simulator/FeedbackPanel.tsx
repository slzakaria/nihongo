'use client'

import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import type { ChatMessage } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Feedback {
  summary: string
  mistakes: { said: string; correction: string; why: string }[]
  natural: { said: string; better: string }[]
  newPhrases: { japanese: string; romaji: string; english: string }[]
}

// Review of the learner's replies in this conversation, fetched when opened
export function FeedbackPanel({
  scenarioSlug,
  messages,
  onClose,
}: {
  scenarioSlug: string
  messages: ChatMessage[]
  onClose: () => void
}) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Review the conversation as it was when the panel opened, not after every new reply
  const [snapshot] = useState(messages)

  useEffect(() => {
    let cancelled = false
    fetch('/api/simulator/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioSlug, messages: snapshot }),
    })
      .then(async res => {
        const data = (await res.json()) as Feedback & { error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Feedback failed')
        if (!cancelled) setFeedback(data)
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Feedback failed')
      })
    return () => {
      cancelled = true
    }
  }, [scenarioSlug, snapshot])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Your conversation, reviewed</h2>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={onClose} aria-label="Close review">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!feedback && !error && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reviewing your replies…
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {feedback && (
          <>
            {feedback.summary && <p className="text-sm">{feedback.summary}</p>}

            {feedback.mistakes.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mistakes</h3>
                {feedback.mistakes.map((m, i) => (
                  <div key={i} className="rounded-md border border-border p-3 text-sm">
                    <p lang="ja" className="line-through opacity-70">{m.said}</p>
                    <p lang="ja" className="font-medium">{m.correction}</p>
                    <p className="text-xs text-muted-foreground">{m.why}</p>
                  </div>
                ))}
              </section>
            )}

            {feedback.natural.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sounds more natural as</h3>
                {feedback.natural.map((n, i) => (
                  <div key={i} className="text-sm">
                    <span lang="ja" className="opacity-70">{n.said}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span lang="ja" className="font-medium">{n.better}</span>
                  </div>
                ))}
              </section>
            )}

            {feedback.newPhrases.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Try these next</h3>
                {feedback.newPhrases.map((p, i) => (
                  <div key={i} className="text-sm">
                    <p lang="ja" className="font-medium">{p.japanese}</p>
                    <p className="text-xs text-muted-foreground">{p.romaji} · {p.english}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
