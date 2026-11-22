import type { MetadataRoute } from "next";
import { loadContent } from "@/lib/data/content";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { phrases } = await loadContent();
  const staticPaths = ["", "/scenarios", "/flashcards", "/kana", "/simulator"];

  return [
    ...staticPaths.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...phrases.flatMap((s) =>
      [
        `/scenarios/${s.slug}`,
        `/quick-ref/${s.slug}`,
        `/flashcards/${s.slug}`,
        `/simulator/${s.slug}`,
      ].map((path) => ({ url: `${SITE_URL}${path}` })),
    ),
  ];
}
