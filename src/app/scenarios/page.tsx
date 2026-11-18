'use client'

import { useContentStore } from '@/lib/data/content'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { PageHeader } from '@/components/layout/PageHeader'

export default function ScenariosPage() {
  const scenarios = useContentStore(s => s.content.phrases)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader title="Scenarios" description="Pick a situation to review its phrases." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s, i) => (
          <ScenarioCard key={s.slug} scenario={s} index={i} />
        ))}
      </div>
    </div>
  )
}
