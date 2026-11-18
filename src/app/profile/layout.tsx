import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: LayoutProps<'/profile'>) {
  return children
}
