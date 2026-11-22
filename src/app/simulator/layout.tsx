import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversation Simulator',
  description:
    'Practise Japanese conversations for travel situations with a live AI partner.',
  alternates: { canonical: '/simulator' },
};

export default function SimulatorLayout({ children }: LayoutProps<'/simulator'>) {
  return children;
}
