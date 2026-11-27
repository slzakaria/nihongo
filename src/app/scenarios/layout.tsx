import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Japanese Travel Phrases & Scenarios',
  description:
    'Browse Japanese phrases for real travel situations — restaurants, trains, hotels, onsen, and more — with romaji, English translations, and etiquette tips.',
  alternates: { canonical: '/scenarios' },
};

export default function ScenariosLayout({ children }: LayoutProps<'/scenarios'>) {
  return children;
}
