import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Finofin Limited handles technical and affiliate link data on OnlineMoneyTransfer.co.uk.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <><SiteHeader /><main><section className="method-hero"><div className="shell narrow"><span className="kicker">PRIVACY</span><h1>You can compare rates without opening an account</h1><p>Finofin Limited is responsible for this site. Reading the tables does not require a name, email address or transfer history.</p></div></section><article className="legal-page shell narrow">
    <h2>The data created when the site is used</h2><p>The hosting service may process ordinary request and security logs. Our affiliate redirect stores the company and route, plus the button position and click time. The reporting table does not keep the visitor&apos;s IP address or full browser user agent.</p>
    <h2>Optional anonymous session measurement</h2><p>If optional cookies are accepted, the site creates a random session identifier. A shortened one-way hash is stored with click events for aggregate reporting. It is not used to build an advertising profile.</p>
    <h2>Why we keep it</h2><p>Technical records keep the service secure. Link data shows whether a provider route is useful and helps us find broken destinations. It also supports affiliate reconciliation.</p>
    <h2>Retention and other sites</h2><p>Affiliate click records may be kept for up to 24 months. After leaving this site, the provider processes information under its own privacy policy. Finofin does not sell personal data.</p>
    <h2>Your rights</h2><p>Local law may give you rights to access or correct personal data, and to ask for erasure. Contact Finofin Limited through Finofin.com or write to 31 Yehuda Hanasi Street, Tel Aviv, Israel.</p>
  </article></main><SiteFooter /></>;
}
