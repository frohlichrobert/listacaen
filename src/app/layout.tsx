import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { homeDescription, homeTitle } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: homeTitle,
    template: "%s | listacaen.ro",
  },
  description: homeDescription,
  applicationName: "listacaen.ro",
  keywords: ["cod caen", "coduri caen", "lista caen", "caen", "caen rev 3", "lista coduri caen"],
  authors: [{ name: "listacaen.ro", url: SITE_URL }],
  creator: "listacaen.ro",
  category: "reference",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "listacaen.ro",
    title: homeTitle,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#d7ebe0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ro" className="h-full">
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#continut"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Sari la conținut
        </a>
        <SiteHeader />
        <main id="continut" className="flex-1">
          <div className="mx-auto w-full max-w-[44rem] px-5 py-8 sm:py-14">
            {children}
          </div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
