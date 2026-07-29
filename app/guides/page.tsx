import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { guideWordCount, guides } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "UK Money Transfer Guides: Rates, Brokers and Payment Routes",
  description: "Plain-English UK guides to exchange rates, currency brokers and the payment infrastructure beneath Wise, Revolut and other transfer companies.",
  path: "/guides",
});

export default function GuidesPage() {
  const consumerGuides = guides.filter((guide) => !guide.series);
  const infrastructureGuides = guides.filter((guide) => guide.series === "Payment infrastructure");
  return <><SiteHeader /><main><section className="guide-desk-hero"><div className="shell"><span className="kicker">GUIDES FOR UK CUSTOMERS</span><h1>The fee is rarely the whole price</h1><p>These guides begin with a real payment and follow the money from the quote screen to the receiving bank. You will find named providers and worked amounts, plus the occasional piece of plumbing that explains why a cheap route stays cheap.</p><div className="guide-desk-stats"><span><strong>{guides.length}</strong> detailed guides</span><span><strong>{guides.reduce((total, guide) => total + guideWordCount(guide), 0).toLocaleString("en-GB")}</strong> words on file</span><span><strong>23 July 2026</strong> latest editorial review</span></div></div></section><section className="section shell guide-desk-body">
    <div className="section-heading"><div><span className="kicker">MONEY DECISIONS</span><h2>Start with the bill you actually have to pay</h2><p>Rates and timing explained in pounds, with the sales upholstery removed.</p></div></div>
    <div className="guide-card-grid">
      {consumerGuides.map((guide, index) => <Link href={`/guides/${guide.slug}`} className={index === 0 ? "guide-card guide-card-featured" : "guide-card"} key={guide.slug}><span>0{index + 1}</span><div><small>{guide.readTime} · {guideWordCount(guide)} words</small><h2>{guide.title}</h2><p>{guide.description}</p><strong>Read guide →</strong></div></Link>)}
    </div>
    <div className="section-heading guide-series-heading"><div><span className="kicker">BENEATH THE APP</span><h2>Why the money arrives before the plumbing finishes</h2><p>Industry guides to routing and payment messages, with the local liquidity sitting behind an “instant” transfer.</p></div></div>
    <div className="guide-card-grid guide-technical-grid">
      {infrastructureGuides.map((guide, index) => <Link href={`/guides/${guide.slug}`} className={index === 0 ? "guide-card guide-card-featured guide-card-technical" : "guide-card guide-card-technical"} key={guide.slug}><span>T{index + 1}</span><div><small>{guide.readTime} · {guideWordCount(guide)} words</small><h2>{guide.title}</h2><p>{guide.description}</p><strong>Open the system →</strong></div></Link>)}
    </div>
    <div className="guide-principles"><div><b>01</b><strong>A real payment, not a glossary entry</strong><p>Each guide answers one decision and puts the trade-off into pounds.</p></div><div><b>02</b><strong>Dates attached to moving claims</strong><p>Rates and product rules lead back to a source or a recorded review date.</p></div><div><b>03</b><strong>People attached to the copy</strong><p>Russell Gous writes the guides. Alon Rajic checks the evidence behind them.</p></div></div>
    <div className="policy-links"><Link href="/editorial-policy">Read the editorial policy</Link><Link href="/methodology">See the rate methodology</Link></div>
    <AuthorPanel label="GUIDE EDITORS" />
  </section></main><SiteFooter /></>;
}
