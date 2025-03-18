import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: {
    default: "DrCan.dev - Personal Blog",
    template: "%s | DrCan.dev",
  },
  description: "Personal blog and portfolio website of Dr. Can",
  keywords: ["blog", "software development", "web development", "technology"],
  authors: [{ name: "Dr. Can" }],
  creator: "Dr. Can",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      </body>
    </html>
  );
}
