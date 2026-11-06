import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { WelcomeDialog } from "@/components/layout/WelcomeDialog";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { AuthSync } from "@/components/layout/AuthSync";
import { ContentSync } from "@/components/layout/ContentSync";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next"
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
  description: "Survival Japanese for your trip — phrases, flashcards, and a live simulator.",
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <WelcomeDialog />
        <ThemeSync />
        <AuthSync />
        <ContentSync />
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
