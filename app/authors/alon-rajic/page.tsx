import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Alon Rajic, Publisher and Research Lead",
  description: "Alon Rajic is the publisher and research lead behind Online Money Transfer and managing director of Finofin Limited.",
  path: "/authors/alon-rajic",
});

export default function AlonRajicPage() {
  const person = { "@context": "https://schema.org", "@type": "Person", name: "Alon Rajic", jobTitle: "Managing Director", worksFor: { "@type": "Organization", name: "Finofin Limited", url: "https://finofin.com" }, url: "https://onlinemoneytransfer.co.uk/authors/alon-rajic" };
  return <><SiteHeader /><main><section className="profile-hero"><div className="shell narrow"><span className="author-avatar">AR</span><span className="kicker">PUBLISHER AND RESEARCH LEAD</span><h1>Alon Rajic</h1><p>Alon runs Finofin Limited and has spent more than a decade building financial comparison sites where the published claim can be checked against the underlying record.</p></div></section><article className="legal-page shell narrow">
    <h2>What Alon is responsible for here</h2><p>Alon sets the product direction and research rules for OnlineMoneyTransfer.co.uk. He reviews the collection process and how evidence is labelled, including the separation between an affiliate relationship and the rate ranking.</p>
    <h2>Background</h2><p>Alon worked in web development and personal finance before forming Finofin in 2015. He previously led search work at Webpals, which later became part of the listed XLMedia group. Finofin&apos;s projects include Money Transfer Comparison.</p>
    <h2>His editorial line</h2><p>A rate is not available merely because a brand prints it on a converter. Failed checks stay visible and introductory prices sit apart. Commission cannot alter the amount captured for a recipient.</p>
    <div className="policy-links"><Link href="/about">About Finofin</Link><Link href="/methodology">Methodology</Link><Link href="/editorial-policy">Editorial policy</Link></div>
  </article></main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} /></>;
}
