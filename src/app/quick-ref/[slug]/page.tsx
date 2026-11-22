import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { loadContent } from '@/lib/data/content';
import { PrintButton } from '@/components/layout/PrintButton';
import { BilingualText } from '@/components/layout/BilingualText';
import { scenarioKana } from '@/lib/data/scenarioKana';

export async function generateStaticParams() {
  const { phrases } = await loadContent();
  return phrases.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { phrases } = await loadContent();
  const scenario = phrases.find((s) => s.slug === slug);
  if (!scenario) return {};
  return {
    title: `${scenario.label} Quick Reference`,
    description: `A printable table of ${scenario.phrases.length} ${scenario.label.toLowerCase()} phrases with romaji and English.`,
    alternates: { canonical: `/quick-ref/${slug}` },
  };
}

export default async function QuickRefPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { phrases } = await loadContent();
  const scenario = phrases.find((s) => s.slug === slug);
  if (!scenario) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="min-w-0">
          <Link
            href={`/scenarios/${scenario.slug}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {scenario.label}
          </Link>
          <h1 className="min-w-0 text-xl font-semibold break-words">
            <BilingualText
              english={<>{scenario.label} — Quick Reference</>}
              japanese={`${scenarioKana(scenario.slug) ?? 'シナリオ'}・クイックリファレンス`}
            />
          </h1>
        </div>
        <PrintButton />
      </div>
      <h1 className="mb-4 hidden text-xl font-semibold print:block">
        <BilingualText
          english={scenario.label}
          japanese={scenarioKana(scenario.slug) ?? 'シナリオ'}
        />
      </h1>

      <table className="w-full border-collapse text-sm">
        <tbody>
          {scenario.phrases.map((p) => (
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
  );
}
