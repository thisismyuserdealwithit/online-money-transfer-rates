import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Money Transfer Rates API Use Terms",
  description: "The attribution, freshness and evidence rules for free use of the Online Money Transfer rates API and widget.",
  path: "/api/terms",
});

export default function ApiTermsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="method-hero">
          <div className="shell narrow">
            <span className="kicker">API USE TERMS</span>
            <h1>The data is free. The matching evidence link stays visible.</h1>
            <p>These terms cover the public JSON and CSV rates endpoints and the supplied rate widget. Last updated 26 August 2026.</p>
          </div>
        </section>
        <article className="legal-page shell narrow">
          <h2>Free use</h2>
          <p>You may use the public API data on commercial and non-commercial websites without an API fee. No account or API key is required.</p>

          <h2>Required attribution</h2>
          <p>Every displayed set of rates must include a readable, clickable link beside or immediately below the figures. The link must point to the matching corridor URL supplied in <code>useTerms.requiredLink</code>. A generic homepage link or a link hidden in a footer does not meet this condition.</p>

          <h2>Timestamp and evidence</h2>
          <p>Keep the capture time and status with any quoted figure. Do not describe an indicative, promotional or stale record as a guaranteed live transfer quote. Receipt links remain hosted by Online Money Transfer and do not grant permission to republish the underlying provider screenshots.</p>

          <h2>Reasonable caching</h2>
          <p>Cache responses and avoid unnecessary repeated requests. The public cache headers are the default refresh guidance. Access may be limited where traffic harms availability for other users.</p>

          <h2>No warranty or service commitment</h2>
          <p>Rates can move after capture. The feed is evidence for comparison, not a transfer offer, financial advice or a promise that an endpoint will remain uninterrupted. Check the provider before sending money.</p>

          <h2>Privacy</h2>
          <p>The API does not require account or recipient data. Integrators remain responsible for their own website privacy disclosures. See the <Link href="/privacy">OMT privacy policy</Link>.</p>

          <p><Link href="/api">Return to the integration guide</Link></p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
