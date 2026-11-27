import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Japanese Flashcards (Spaced Repetition)',
  description:
    'Review Japanese travel phrases with spaced-repetition flashcards, organized by scenario, so you remember what you need before your trip.',
  alternates: { canonical: '/flashcards' },
};

export default function FlashcardsLayout({ children }: LayoutProps<'/flashcards'>) {
  return children;
}
