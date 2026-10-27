import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SafetyBanner } from "@/components/site/safety-banner";
import { SiteChrome } from "@/components/site/site-chrome";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Découvrez les Comores`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.name,
    title: `${SITE.name} — Découvrez les Comores`,
    description: SITE.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "GoComores — guide des îles Comores" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0F9FF" },
    { media: "(prefers-color-scheme: dark)", color: "#071A2B" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#contenu"
            className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-cta px-4 py-3 text-sm font-bold text-cta-foreground transition-transform focus:translate-y-0"
          >
            Aller au contenu
          </a>
          <SiteChrome header={<Header />} footer={<Footer />} banner={<SafetyBanner />}>
            <main id="contenu" tabIndex={-1} className="focus:outline-none">
              {children}
            </main>
          </SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
