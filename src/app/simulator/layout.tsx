import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Japanese Conversation Simulator',
  description:
    'Practise real Japanese conversations for travel situations with a live AI partner — reply by text or voice and get instant feedback.',
  alternates: { canonical: '/simulator' },
};

export default function SimulatorLayout({ children }: LayoutProps<'/simulator'>) {
  return children;
}
