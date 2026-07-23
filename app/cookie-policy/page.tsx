import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Cookie Policy", description: "The essential and optional cookies used by Online Money Transfer.", alternates: { canonical: "/cookie-policy" } };

export default function CookiePolicyPage() {
  return <><SiteHeader /><main><section className="method-hero"><div className="shell narrow"><span className="kicker">COOKIE POLICY</span><h1>Two cookies, and neither follows you around the web</h1><p>One cookie remembers your choice. The optional one measures provider-link use after consent, without creating an advertising profile.</p></div></section><article className="legal-page shell narrow">
    <h2>The cookie that remembers your answer</h2><p><code>omt_consent</code> records whether optional measurement was accepted. It lasts up to 180 days, sparing everyone the pleasure of seeing the same banner on every visit.</p>
    <h2>The optional link-measurement cookie</h2><p><code>omt_affiliate_session</code> is created only after consent and a provider-link click. The random identifier lasts up to 180 days. Our reporting record stores a one-way hash rather than the cookie value.</p>
    <h2>What happens after rejection</h2><p>Provider links still work. The site records the basic click needed to operate and assess the destination, but it creates no persistent visitor identifier.</p>
    <h2>Changing the answer</h2><p>Deleting this site&apos;s cookies in the browser will show the consent banner again. A preference centre will be added if further optional tools appear.</p>
  </article></main><SiteFooter /></>;
}
