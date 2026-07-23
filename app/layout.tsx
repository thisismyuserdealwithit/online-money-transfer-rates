import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
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
  title: {
    default: "Online Money Transfer | Today's Rates and Receipts",
    template: "%s | Online Money Transfer",
  },
  description: "Compare what international transfer companies deliver for the same amount, then open the dated provider receipt behind each result.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
            "@type": "WebSite",
            name: "Online Money Transfer",
            url: "https://onlinemoneytransfer.co.uk",
            publisher: {
              "@type": "Organization",
              name: "Finofin Limited",
              url: "https://finofin.com",
              founder: { "@type": "Person", name: "Alon Rajic" },
            },
          }).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
