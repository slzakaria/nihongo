import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Mic } from "lucide-react";
import { loadContent } from "@/lib/data/content";
import { PhraseList } from "@/components/phrases/PhraseList";
import { ScenarioSidebar } from "@/components/layout/ScenarioSidebar";
import { EtiquetteCard } from "@/components/scenarios/EtiquetteCard";
import { getEtiquetteTips } from "@/lib/data/etiquette";

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
    title: `${scenario.label} Phrases`,
    description: `${scenario.phrases.length} ${scenario.label.toLowerCase()} phrases in Japanese with romaji and English, plus example replies.`,
    alternates: { canonical: `/scenarios/${slug}` },
  };
}

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { phrases } = await loadContent();
  const scenario = phrases.find((s) => s.slug === slug);
  if (!scenario) notFound();

  // Escapes "<" so phrase text can't close the script tag early
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: scenario.label,
    numberOfItems: scenario.phrases.length,
    itemListElement: scenario.phrases.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.japanese,
      alternateName: p.romaji,
      description: p.english,
    })),
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 gap-8 px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ScenarioSidebar currentSlug={scenario.slug} basePath="/scenarios" />

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <Link
              href="/scenarios"
              className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Scenarios
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight break-words">
              {scenario.label}
            </h1>
            <p className="text-muted-foreground">
              {scenario.phrases.length} phrases
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
            <Link
              href={`/speaking/${scenario.slug}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              <Mic className="h-3.5 w-3.5" />
              Practise speaking
            </Link>
            <Link
              href={`/quick-ref/${scenario.slug}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Quick Reference
            </Link>
          </div>
        </div>

        <EtiquetteCard tips={getEtiquetteTips(scenario.slug)} />

        <PhraseList phrases={scenario.phrases} scenarioSlug={scenario.slug} />
      </div>
    </div>
  );
}
