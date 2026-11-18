'use client'

import { useContentStore } from '@/lib/data/content'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LinkCard } from '@/components/ui/link-card'
import { PageHeader } from '@/components/layout/PageHeader'

export default function SimulatorPickerPage() {
  const scenarios = useContentStore(s => s.content.phrases)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader title="Simulator" description="Pick a scenario and practice a live conversation." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s, i) => (
          <LinkCard key={s.slug} href={`/simulator/${s.slug}`} index={i}>
            <CardHeader>
              <CardTitle className="text-base">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-xs text-muted-foreground">Start conversation</span>
            </CardContent>
          </LinkCard>
        ))}
      </div>
    </div>
  )
}
