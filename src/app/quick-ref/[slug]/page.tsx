import { notFound } from 'next/navigation'
import { getScenarioBySlug, getAllScenarios } from '@/lib/data/phrases'
import { PrintButton } from '@/components/layout/PrintButton'

export function generateStaticParams() {
  return getAllScenarios().map(s => ({ slug: s.slug }))
}

export default async function QuickRefPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const scenario = getScenarioBySlug(slug)
  if (!scenario) notFound()

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold">{scenario.label} — Quick Reference</h1>
        <PrintButton />
      </div>
      <h1 className="mb-4 hidden text-xl font-semibold print:block">{scenario.label}</h1>


      <table className="w-full border-collapse text-sm">
        <tbody>
          {scenario.phrases.map(p => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-2 pr-3 align-top" lang="ja">
                {p.japanese}
              </td>
              <td className="py-2 pr-3 align-top text-muted-foreground">{p.romaji}</td>
              <td className="py-2 align-top">{p.english}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
