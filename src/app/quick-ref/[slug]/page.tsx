import { notFound } from 'next/navigation'
import { loadContent } from '@/lib/data/content'
import { PrintButton } from '@/components/layout/PrintButton'

export async function generateStaticParams() {
  const { phrases } = await loadContent()
  return phrases.map(s => ({ slug: s.slug }))
}

export default async function QuickRefPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { phrases } = await loadContent()
  const scenario = phrases.find(s => s.slug === slug)
  if (!scenario) notFound()

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="min-w-0 text-xl font-semibold break-words">{scenario.label} — Quick Reference</h1>
        <PrintButton />
      </div>
      <h1 className="mb-4 hidden text-xl font-semibold print:block">{scenario.label}</h1>


      <table className="w-full border-collapse text-sm">
        <tbody>
          {scenario.phrases.map(p => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-2 pr-3 align-top" lang="ja">
                {p.japanese}
                {p.kanji && <div className="text-muted-foreground">{p.kanji}</div>}
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
