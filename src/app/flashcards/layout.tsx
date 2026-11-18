import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flashcards',
  description: 'Spaced-repetition flashcards for Japanese travel phrases, one scenario at a time.',
  alternates: { canonical: '/flashcards' },
}

export default function FlashcardsLayout({ children }: LayoutProps<'/flashcards'>) {
  return children
}
