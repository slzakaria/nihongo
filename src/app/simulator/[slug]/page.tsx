import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getScenarioBySlug, getAllScenarios } from '@/lib/data/phrases'
import { SimulatorChat } from '@/components/simulator/SimulatorChat'
import { ScenarioPrompt } from '@/components/simulator/ScenarioPrompt'

export function generateStaticParams() {
  return getAllScenarios().map(s => ({ slug: s.slug }))
}

export default async function SimulatorSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const scenario = getScenarioBySlug(slug)
  if (!scenario) notFound()

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/simulator"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Simulator
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{scenario.label}</h1>
      </div>

      <ScenarioPrompt scenario={scenario} />
      <SimulatorChat key={scenario.slug} scenarioSlug={scenario.slug} />
    </div>
  )
}
