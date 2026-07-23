import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Editorial Policy and Corrections", description: "Who is responsible for Online Money Transfer, how changing claims are checked and what happens when a published record is wrong.", alternates: { canonical: "/editorial-policy" } };

export default function EditorialPolicyPage() {
  return <><SiteHeader /><main><section className="method-hero"><div className="shell narrow"><span className="kicker">EDITORIAL POLICY</span><h1>Claims move. Responsibility stays put.</h1><p>Every substantial guide has a named writer and reviewer. A changing product claim needs a source or a dated test, and a rate needs the receipt that produced it.</p></div></section><article className="legal-page shell narrow">
    <h2>The people responsible</h2><p>Finofin Limited publishes OnlineMoneyTransfer.co.uk. Alon Rajic leads the product and research operation; Russell Gous is responsible for the written work. Guides carry their author and material review date.</p>
    <h2>How a number reaches the table</h2><p>Provider calculators are checked against a standard payment case. The record stores the rate and visible fee, plus the recipient amount. It also keeps the route and checking time beside the screenshot. Indicative evidence is labelled and cannot beat a completed quote.</p>
    <h2>How the guides are checked</h2><p>Regulator material and provider legal documents are preferred for changing claims. Bank fee schedules are used where they describe the customer cost. Drafting software may help with production, but named people remain responsible for every published conclusion.</p>
    <h2>Corrections</h2><p>A bad rate record is marked invalid and replaced with a new capture. It is not quietly edited into a better result. Material written corrections are added to the article record, and readers can contact the publisher through the About page.</p>
    <h2>What an affiliate relationship cannot buy</h2><p>Commission does not control which providers appear, how their evidence is labelled or where their price sits. Commercial buttons remain separate from receipt links.</p>
  </article></main><SiteFooter /></>;
}
