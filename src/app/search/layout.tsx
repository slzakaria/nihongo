import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Phrases',
  description: 'Search every Japanese travel phrase by English, romaji or Japanese.',
  alternates: { canonical: '/search' },
}

export default function SearchLayout({ children }: LayoutProps<'/search'>) {
  return children
}
