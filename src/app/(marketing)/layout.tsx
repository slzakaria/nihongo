import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Hanazono — Survival Japanese for Travel' },
  description:
    'Explore real-life Japanese travel scenarios, review their phrases with spaced-repetition flashcards, then practise speaking in a live AI conversation simulator. A free Japanese phrasebook app for your next trip.',
  alternates: { canonical: '/' },
};

export default function MarketingLayout({ children }: LayoutProps<'/'>) {
  return children;
}
