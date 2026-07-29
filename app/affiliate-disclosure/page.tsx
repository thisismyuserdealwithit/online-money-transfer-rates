import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Affiliate Disclosure",
  description: "How Online Money Transfer may earn money and why commercial relationships do not change rate evidence.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return <><SiteHeader /><main><section className="method-hero"><div className="shell narrow"><span className="kicker">AFFILIATE DISCLOSURE</span><h1>Some clicks pay us. They do not improve a rate.</h1><p>A provider may pay commission after a visit or completed transfer. Using the link should not increase the customer&apos;s price.</p></div></section><article className="legal-page shell narrow">
    <h2>Which links are commercial</h2><p>Buttons that send a reader to a provider pass through our redirect. We record the company and route, plus the button position and click time. Where an affiliate arrangement exists, the provider or network may receive a reference in that link.</p>
    <h2>The receipt link earns nothing</h2><p>“Open receipt” leads to the screenshot and stored quote record. It does not begin a provider referral, allowing a reader to inspect the evidence without entering a sales journey.</p>
    <h2>No paid winner</h2><p>Commission cannot purchase a verified label or a stronger recorded rate. Companies without a commercial relationship remain visible, including when their public quote fails.</p>
    <h2>The provider sets the final contract</h2><p>Recheck the provider screen before sending money because it sets the final price and eligibility terms. OnlineMoneyTransfer.co.uk neither handles customer funds nor executes the payment.</p>
  </article></main><SiteFooter /></>;
}
