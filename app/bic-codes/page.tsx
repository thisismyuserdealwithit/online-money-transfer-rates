import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { GlobalBicChecker } from "@/components/GlobalBicChecker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "BIC Code Checker: Format and Bank Country",
  description: "Check whether a BIC has the standard 8 or 11-character structure and whether its country characters match the expected receiving-bank country.",
  path: "/bic-codes/",
});

export default function BicCodesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "BIC checker", item: `${siteUrl}/bic-codes/` },
        ],
      },
      {
        "@type": "WebApplication",
        name: "BIC format and country checker",
        url: `${siteUrl}/bic-codes/`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any web browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
        description: "A client-side BIC structure and country-character check. It does not query an institution or account directory.",
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="codes-hero bic-hero">
          <div className="shell codes-hero-grid">
            <div>
              <div className="crumbs"><Link href="/">Home</Link><span>›</span><Link href="/swift-codes/">SWIFT codes</Link><span>›</span><b>BIC checker</b></div>
              <span className="kicker">PRIVATE FORMAT CHECK</span>
              <h1>Does this BIC look right for the country you are paying?</h1>
              <p>Paste the 8 or 11-character code. We will check its ISO 9362 structure and compare the country characters with the expected receiving-bank country. The entry stays in your browser.</p>
            </div>
            <aside className="bic-hero-note">
              <strong>What “passes” means</strong>
              <p>The number of characters, allowed characters and country position look right.</p>
              <b>It is not an institution, branch, account-name or fraud check.</b>
            </aside>
          </div>
        </section>

        <section className="section shell codes-main bic-main">
          <GlobalBicChecker />

          <div className="bic-boundary">
            <span>FORMAT</span><i>→</i><span>INSTITUTION</span><i>→</i><span>RECIPIENT</span><i>→</i><span>PAYMENT SAFETY</span>
          </div>

          <section className="codes-copy-grid bic-explainers">
            <div>
              <span className="kicker">A PASSING RESULT</span>
              <h2>What the checker actually tests</h2>
              <ul>
                <li>The cleaned code contains exactly 8 or 11 characters.</li>
                <li>The two country positions contain letters.</li>
                <li>The remaining positions use characters allowed by the current BIC structure.</li>
                <li>The country characters match the destination you selected, or a warning explains the mismatch.</li>
              </ul>
            </div>
            <div>
              <span className="kicker">A STEP STILL REMAINS</span>
              <h2>Find the institution record</h2>
              <p>SWIFT is the ISO registration authority for BICs. Its free public search provides limited, occasional access to a subset of the BIC Directory and uses a human-verification challenge.</p>
              <p>Use the official search or the bank&apos;s own incoming-payment instructions. Do not rely on an unsourced code copied from a directory page.</p>
              <a className="official-lookup" href="https://www.swiftref.com/en/bicsearch" target="_blank" rel="noopener noreferrer">Search the official SWIFT directory ↗</a>
            </div>
          </section>

          <section className="bic-errors">
            <div className="section-heading"><div><span className="kicker">COMMON FAILURES</span><h2>Small errors that can send a payment into repair</h2></div></div>
            <div>
              <article><b>01</b><strong>Using the recipient&apos;s country</strong><p>The country characters describe the identified institution, which may be an overseas or intermediary branch.</p></article>
              <article><b>02</b><strong>Guessing the final XXX</strong><p>Use the 8 or 11-character code published by the bank for that payment route. Do not invent a branch identifier.</p></article>
              <article><b>03</b><strong>Confusing BIC with IBAN</strong><p>The BIC identifies an institution. An IBAN identifies an account format in countries that use the IBAN standard.</p></article>
              <article><b>04</b><strong>Assuming registered means connected</strong><p>SWIFT registers both connected and non-connected BICs. Syntax alone cannot tell you which one you have.</p></article>
            </div>
          </section>

          <aside className="bic-fraud-note">
            <div><span className="kicker">CHANGED PAYMENT DETAILS?</span><h2>Stop and confirm them outside the message that supplied the change</h2></div>
            <p>Call the recipient using a number you already trust. A matching bank identifier does not prove that the account belongs to the intended person or business.</p>
          </aside>

          <section className="codes-sources">
            <span className="kicker">SOURCE AND LIMIT</span>
            <h2>No copied BIC directory</h2>
            <p>This tool implements the published ISO 9362 structure. It does not scrape or republish SWIFT&apos;s directory. Institution and connection-status checks remain with SWIFT&apos;s official search, a licensed reference-data service or the receiving bank.</p>
            <div>
              <a href="https://www.swift.com/standards/data-standards/bic-business-identifier-code" target="_blank" rel="noopener noreferrer">SWIFT BIC structure ↗</a>
              <a href="https://www.swiftref.com/en/bicsearch" target="_blank" rel="noopener noreferrer">Official BIC Search ↗</a>
              <Link href="/swift-codes/">Read the SWIFT guide →</Link>
            </div>
          </section>

          <AuthorPanel label="REVIEWED BY" />
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </>
  );
}
