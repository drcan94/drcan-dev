import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LoadingProvider } from "@/components/providers/loading-provider";
import Script from "next/script";

import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: {
    default: "DrCan.dev - Yazılım ve Sağlık Blogu",
    template: "%s | DrCan.dev",
  },
  description:
    "Dr. Burak Can'ın kişisel blog ve portföy web sitesi. Sağlık ve yazılım üzerine içerikler.",
  keywords: [
    "blog",
    "yazılım geliştirme",
    "web geliştirme",
    "teknoloji",
    "sağlık",
    "doktor",
    "hekim",
    "MD",
    "Dr. Burak Can",
  ],
  authors: [{ name: "Dr. Burak Can" }],
  creator: "Dr. Burak Can",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://drcan.dev",
    title: "DrCan.dev - Yazılım ve Sağlık Blogu",
    description:
      "Dr. Burak Can'ın kişisel blog ve portföy web sitesi. Sağlık ve yazılım üzerine içerikler.",
    siteName: "DrCan.dev",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "DrCan.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DrCan.dev - Yazılım ve Sağlık Blogu",
    description: "Dr. Burak Can'ın kişisel blog ve portföy web sitesi",
    images: ["/twitter-image.jpg"],
    creator: "@drcandotdev",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/icons/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/icons/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/icons/favicon-16x16.png",
    },
  ],
  manifest: "/site.webmanifest",
  other: {
    "google-adsense-account": "ca-pub-4334852497351765",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} flex min-h-screen flex-col bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4334852497351765"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DrCan.dev",
              url: "https://drcan.dev",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://drcan.dev/blog/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Dr. Burak Can",
              url: "https://drcan.dev",
              jobTitle: "Physician & Software Developer",
              sameAs: [
                "https://github.com/burakcan",
                "https://twitter.com/drcandotdev",
              ],
            }),
          }}
        />

        <LoadingProvider>
          <TRPCReactProvider>
            <SessionProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
                storageKey="drcan-dev-theme"
              >
                <Navbar />
                <main className="flex-1">
                  {children}
                  <Analytics />
                </main>
                <Footer />
                <Toaster position="bottom-right" />
              </ThemeProvider>
            </SessionProvider>
          </TRPCReactProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
