import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { loadContent } from '@/lib/data/content';
import { SimulatorChat } from '@/components/simulator/SimulatorChat';
import { ScenarioPrompt } from '@/components/simulator/ScenarioPrompt';
import { scenarioKana } from '@/lib/data/scenarioKana';
import { BilingualText } from '@/components/layout/BilingualText';

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
    title: `${scenario.label} Conversation Practice`,
    description: `Practise a ${scenario.label.toLowerCase()} conversation in Japanese with a live AI partner.`,
    alternates: { canonical: `/simulator/${slug}` },
  };
}

export default async function SimulatorSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { phrases } = await loadContent();
  const scenario = phrases.find((s) => s.slug === slug);
  if (!scenario) notFound();

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
        <h1 className="text-2xl font-semibold tracking-tight">
          <BilingualText
            english={scenario.label}
            japanese={scenarioKana(scenario.slug) ?? 'シナリオ'}
          />
        </h1>
      </div>

      <ScenarioPrompt scenario={scenario} />
      <SimulatorChat key={scenario.slug} scenarioSlug={scenario.slug} />
    </div>
  );
}
