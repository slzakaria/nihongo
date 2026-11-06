import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { loadContent } from '@/lib/data/content'
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck'
import { ScenarioSidebar } from '@/components/layout/ScenarioSidebar'

export async function generateStaticParams() {
  const { phrases } = await loadContent()
  return phrases.map(s => ({ slug: s.slug }))
}

export default async function FlashcardSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { phrases } = await loadContent()
  const scenario = phrases.find(s => s.slug === slug)
  if (!scenario) notFound()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 gap-8 px-4 py-10 sm:px-6">
      <ScenarioSidebar currentSlug={scenario.slug} basePath="/flashcards" />

      <div className="flex w-full max-w-xl flex-1 flex-col gap-6">
        <div>
          <Link
            href="/flashcards"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Flashcards
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{scenario.label}</h1>
        </div>

        <FlashcardDeck key={scenario.slug} slug={scenario.slug} />
      </div>
    </div>
  )
}
