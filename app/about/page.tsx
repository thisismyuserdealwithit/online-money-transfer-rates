import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Who Runs Online Money Transfer?",
  description: "Meet Finofin Limited and the people responsible for the rates, reviews and research published on OnlineMoneyTransfer.co.uk.",
  path: "/about",
});

export default function AboutPage() {
  const organisation = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Finofin Limited",
    url: "https://finofin.com",
    founder: { "@type": "Person", name: "Alon Rajic" },
    address: { "@type": "PostalAddress", streetAddress: "31 Yehuda Hanasi Street", addressLocality: "Tel Aviv", addressCountry: "IL" },
  };
  return (
    <>
      <SiteHeader />
      <main>
        <section className="method-hero"><div className="shell narrow"><span className="kicker">WHO PUBLISHES THIS SITE</span><h1>A rate table is more useful when somebody signs their name to it</h1><p>Finofin Limited publishes OnlineMoneyTransfer.co.uk. Software gathers the public quotes; people decide whether the evidence deserves to appear and take responsibility when it does not.</p></div></section>
        <article className="legal-page shell narrow">
          <h2>Finofin Limited</h2>
          <p>Finofin Limited is an Israeli limited liability company founded by Alon Rajic in 2015. Its work sits where financial comparison meets publishing, with research and practical tools built around the claims providers make in public.</p>
          <p>The company also operates <a href="https://moneytransfercomparison.com/" rel="external">Money Transfer Comparison</a>, which began in 2014 and has examined close to 100 transfer businesses. Writers on that project have worked directly in banking and foreign exchange, a useful antidote to the usual rewritten fee page.</p>

          <div className="fact-grid">
            <div><span>Publisher</span><strong>Finofin Limited</strong><small>Israeli limited liability company</small></div>
            <div><span>Managing director</span><strong>Alon Rajic</strong><small>Publishing and research</small></div>
            <div><span>Head of content</span><strong>Russell Gous</strong><small>Banking and foreign exchange experience</small></div>
            <div><span>Public address</span><strong>31 Yehuda Hanasi Street</strong><small>Tel Aviv, Israel</small></div>
          </div>

          <h2>The problem we wanted to fix</h2>
          <p>Many comparison pages repeat an attractive exchange rate without proving that a customer could use it for the stated transfer. We set one payment case and keep the provider screen. The published amount carries its checking time beside it.</p>
          <p>A company can appear without paying Finofin. An affiliate arrangement may earn the site money after a click, but it cannot improve the provider&apos;s recorded rate or turn calculator evidence into a completed quote.</p>

          <h2>Relevant experience</h2>
          <p>Alon Rajic has run personal-finance publishing projects for more than a decade. Before Finofin, he led search work at Webpals, which later joined the listed XLMedia group. Russell Gous spent more than five years at Barclays Corporate Banking and WorldFirst before writing full time about payments.</p>

          <div className="policy-links"><Link href="/methodology">Rate methodology</Link><Link href="/editorial-policy">Editorial policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link><Link href="/privacy">Privacy policy</Link></div>
          <AuthorPanel />

          <aside className="source-note"><strong>Where the company information comes from</strong><p>The details above can be checked at <a href="https://finofin.com/" rel="external">Finofin.com</a> and <a href="https://moneytransfercomparison.com/about-us/" rel="external">Money Transfer Comparison</a>. Alon&apos;s earlier publishing work is also covered in an <a href="https://www.entrepreneur.com/leadership/why-alon-rajic-doesnt-attend-professional-events-and-what/323087" rel="external">Entrepreneur profile</a>.</p></aside>
        </article>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisation).replace(/</g, "\\u003c") }} />
    </>
  );
}
