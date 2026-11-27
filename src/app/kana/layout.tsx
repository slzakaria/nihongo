import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn Hiragana and Katakana',
  description:
    'Learn hiragana and katakana row by row with free spaced-repetition flashcard practice, right in your browser.',
  alternates: { canonical: '/kana' },
};

export default function KanaLayout({ children }: LayoutProps<'/kana'>) {
  return children;
}
