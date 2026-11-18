import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { AuthSync } from "@/components/auth/AuthSync";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { BackToTop } from "@/components/layout/BackToTop";
import { SignInInvite } from "@/components/layout/SignInInvite";
import { Footer } from "@/components/layout/Footer";
import { DeferredGlobals } from "@/components/layout/DeferredGlobals";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hanazono - Survival Japanese",
  description: "Hanazono - Survival Japanese for your trip — phrases, flashcards, and a live simulator.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

// Applied before hydration so there's no flash of the wrong theme on load
const themeInitScript = `(function(){try{var stored=localStorage.getItem('nihongo-theme');var theme='system';if(stored){var parsed=JSON.parse(stored);theme=(parsed&&parsed.state&&parsed.state.theme)||'system';}var isDark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          {/* beforeInteractive injects this into the server HTML, so it runs before paint without React rendering a <script> */}
          <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
          <Navbar />
          <NavigationProgress />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <DeferredGlobals />
          <BackToTop />
          <SignInInvite />
          <ThemeSync />
          <AuthSync />
          <ServiceWorkerRegister />
        </ClerkProvider>
      </body>
    </html>
  );
}