import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Russell Gous, Head of Content", description: "Russell Gous is head of content for Online Money Transfer, with experience at Barclays Corporate Banking and WorldFirst.", alternates: { canonical: "/authors/russell-gous" } };

export default function RussellGousPage() {
  const person = { "@context": "https://schema.org", "@type": "Person", name: "Russell Gous", jobTitle: "Head of Content", worksFor: { "@type": "Organization", name: "Finofin Limited", url: "https://finofin.com" }, url: "https://onlinemoneytransfer.co.uk/authors/russell-gous" };
  return <><SiteHeader /><main><section className="profile-hero"><div className="shell narrow"><span className="author-avatar">RG</span><span className="kicker">HEAD OF CONTENT</span><h1>Russell Gous</h1><p>Russell is a UK banking and foreign-exchange specialist who worked at Barclays Corporate Banking and WorldFirst before moving into financial publishing.</p></div></section><article className="legal-page shell narrow">
    <h2>What Russell is responsible for here</h2><p>Russell oversees the written explanations and provider context, translating the rate records into decisions a customer can use. He writes the guide series and owns its review dates.</p>
    <h2>Background</h2><p>Russell spent more than five years at Barclays Corporate Banking and WorldFirst, where he worked as a senior relationship manager. His writing covers currency brokers and bank payments, plus the infrastructure underneath them.</p>
    <h2>His editorial line</h2><p>A converter rate and an executable transfer quote are different pieces of evidence. A model built from a published bank margin is something else again. The labels should remain plain enough that nobody mistakes one for another.</p>
    <div className="policy-links"><Link href="/about">About Finofin</Link><Link href="/methodology">Methodology</Link><Link href="/editorial-policy">Editorial policy</Link></div>
  </article></main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} /></>;
}
