import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { defaultDescription, siteName, siteUrl } from "@/lib/seo";
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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Online Money Transfer | Today's Rates and Receipts",
    template: "%s | Online Money Transfer",
  },
  description: defaultDescription,
  applicationName: siteName,
  authors: [
    { name: "Alon Rajic", url: `${siteUrl}/authors/alon-rajic` },
    { name: "Russell Gous", url: `${siteUrl}/authors/russell-gous` },
  ],
  creator: "Finofin Limited",
  publisher: "Finofin Limited",
  category: "Finance",
  keywords: [
    "money transfer rates",
    "international money transfer",
    "UK money transfer comparison",
    "exchange rates",
    "remittance fees",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "OMT Rates",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#112343",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                name: siteName,
                url: siteUrl,
                description: defaultDescription,
                inLanguage: "en-GB",
                publisher: { "@id": `${siteUrl}/#organisation` },
              },
              {
                "@type": "Organization",
                "@id": `${siteUrl}/#organisation`,
                name: "Finofin Limited",
                url: "https://finofin.com",
                logo: {
                  "@type": "ImageObject",
                  url: `${siteUrl}/favicon.svg`,
                },
                founder: {
                  "@type": "Person",
                  name: "Alon Rajic",
                  url: `${siteUrl}/authors/alon-rajic`,
                },
              },
            ],
          }).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
