import { ClerkProvider } from '@clerk/nextjs';
import { ui } from '@clerk/ui';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist_Mono, Inter, Noto_Serif_JP } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { NavigationProgress } from '@/components/layout/NavigationProgress';
import { LoadingOverlay } from '@/components/layout/LoadingOverlay';
import { ThemeSync } from '@/components/layout/ThemeSync';
import { AuthSync } from '@/components/auth/AuthSync';
import { BackToTop } from '@/components/layout/BackToTop';
import { SignInInvite } from '@/components/layout/SignInInvite';
import { Footer } from '@/components/layout/Footer';
import { DeferredGlobals } from '@/components/layout/DeferredGlobals';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

const notoSerifJP = Noto_Serif_JP({
  variable: '--font-noto-serif-jp',
  subsets: ['latin'],
  weight: ['300', '400'],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hanazono - Survival Japanese',
    template: '%s | Hanazono',
  },
  description:
    'Hanazono - Survival Japanese for your trip — phrases, flashcards, and a live simulator.',
  applicationName: 'Hanazono',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Hanazono',
    url: SITE_URL,
    title: 'Hanazono - Survival Japanese',
    description: 'Phrases, flashcards and a live simulator for travelling in Japan.',
  },
  twitter: {
    card: 'summary',
    title: 'Hanazono - Survival Japanese',
    description: 'Phrases, flashcards and a live simulator for travelling in Japan.',
  },
};

// Applied before hydration so there's no flash of the wrong theme on load
const themeInitScript = `(function(){try{var stored=localStorage.getItem('nihongo-theme');var theme='system';if(stored){var parsed=JSON.parse(stored);theme=(parsed&&parsed.state&&parsed.state.theme)||'system';}var isDark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)document.documentElement.classList.add('dark');}catch(e){}})();`;
const serviceWorkerRegistrationScript = `if (${JSON.stringify(process.env.NODE_ENV === 'production')} && 'serviceWorker' in navigator) { var registerHanazonoServiceWorker = function () { navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(function (error) { console.error('Unable to register offline practice support.', error); }); }; if ('requestIdleCallback' in window) window.requestIdleCallback(registerHanazonoServiceWorker, { timeout: 8000 }); else window.setTimeout(registerHanazonoServiceWorker, 3000); }`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerifJP.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider ui={ui}>
          {/* beforeInteractive injects this into the server HTML, so it runs before paint without React rendering a <script> */}
          <Script
            id="theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: themeInitScript }}
          />
          <Script
            id="offline-service-worker"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: serviceWorkerRegistrationScript,
            }}
          />
          <Navbar />
          <NavigationProgress />
          <LoadingOverlay />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <DeferredGlobals />
          <BackToTop />
          <SignInInvite />
          <ThemeSync />
          <AuthSync />
          <SpeedInsights />
        </ClerkProvider>
      </body>
    </html>
  );
}
