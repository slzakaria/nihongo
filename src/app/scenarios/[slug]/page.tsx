import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { getScenarioBySlug, getAllScenarios } from '@/lib/data/phrases'
import { PhraseList } from '@/components/phrases/PhraseList'
import { ScenarioSidebar } from '@/components/layout/ScenarioSidebar'

export function generateStaticParams() {
  return getAllScenarios().map(s => ({ slug: s.slug }))
}

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const scenario = getScenarioBySlug(slug)
  if (!scenario) notFound()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 gap-8 px-4 py-10 sm:px-6">
      <ScenarioSidebar currentSlug={scenario.slug} basePath="/scenarios" />

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/scenarios"
              className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Scenarios
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{scenario.label}</h1>
            <p className="text-muted-foreground">{scenario.phrases.length} phrases</p>
          </div>
          <Link
            href={`/quick-ref/${scenario.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Quick Reference
          </Link>
        </div>

        <PhraseList phrases={scenario.phrases} scenarioSlug={scenario.slug} />
      </div>
    </div>
  )
}
