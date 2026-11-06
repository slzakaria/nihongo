'use client'

import Link from 'next/link'
import { useContentStore } from '@/lib/data/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SimulatorPickerPage() {
  const scenarios = useContentStore(s => s.content.phrases)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Simulator</h1>
        <p className="text-muted-foreground">Pick a scenario and practice a live conversation.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {scenarios.map(s => (
          <Link key={s.slug} href={`/simulator/${s.slug}`}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="text-base">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">Start conversation</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
