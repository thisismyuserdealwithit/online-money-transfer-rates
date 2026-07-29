import type { Metadata } from "next";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How We Compare Money Transfer Rates",
  description:
    "See how Online Money Transfer checks provider rates, separates verified quotes from indicative evidence and preserves every dated receipt.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <><SiteHeader /><main><section className="method-hero"><div className="shell narrow"><span className="kicker">METHOD · VERSION 1.7</span><h1>How do you compare a price that keeps moving?</h1><p>We do not pretend the quote will wait politely for the reader. We fix the transfer case, check providers in a short window and publish the time beside the receipt.</p></div></section><article className="method-body shell narrow">
      <h2>The transfer we put through each calculator</h2><p>Ranked quotes use a personal bank transfer paid into the recipient&apos;s bank account. No introductory rate is allowed to win. New UK checks use £200 from 23 July 2026, while earlier records retain the amount tested at the time. A global route uses a round amount in the sender&apos;s currency and prints it clearly.</p>
      <div className="rules-grid"><div><b>01</b><strong>Hold the sending budget still</strong><p>The visible provider fee comes out of the same total amount for every company.</p></div><div><b>02</b><strong>Rank what arrives</strong><p>The recipient amount settles the price order, rather than the rate chosen for the advert.</p></div><div><b>03</b><strong>Match the payout</strong><p>A bank deposit competes with another bank deposit. Cash belongs in its own comparison.</p></div><div><b>04</b><strong>Keep the checks close together</strong><p>A short collection window reduces the chance that sterling, rather than the provider, decides the order.</p></div></div>
      <h2>Completed quotes and calculator evidence</h2><p>A verified result shows the sending amount and what reaches the recipient, plus any visible fee, on a provider-controlled journey. An indicative converter may explain the price but cannot win. We also publish clearly labelled Wise comparison estimates when available. Wise says it models these from provider websites and normally refreshes them about hourly.</p>
      <h2>What the receipt stores</h2><p>A successful check keeps a lossless image of the calculator or provider-controlled response. The source address and UTC collection time sit in the same record, alongside a SHA-256 file hash. A new result becomes current without erasing the older receipt.</p>
      <h2>When a provider fails</h2><p>A failed collection does not overwrite a valid quote. Once the old result passes its freshness window, it becomes stale and leaves the winner calculation until another comparable quote completes.</p>
      <h2>Why unavailable companies stay in the table</h2><p>Every route retains the companies we monitor, including UK banks and transfer specialists. Direct provider quotes take priority. Third-party estimates remain labelled, while an unavailable company provides market context rather than a fictional price.</p>
      <h2>Modelled UK bank prices</h2><p>A bank may publish its fee and exchange-rate margin without revealing the final customer quote. When both figures can be reproduced, we apply them to the same £200 budget and mark the result indicative. The receipt shows the reference rate and our calculation rather than claiming the bank supplied it.</p>
      <h2>Introductory rates and plan allowances</h2><p>A first-transfer offer is preserved but excluded from the standard winner. Plan-based services are tied to a named plan and usage assumption. Weekend charges are counted when the provider reveals them; otherwise the result stays indicative.</p>
      <aside><strong>When we get a record wrong</strong><p>An incorrectly parsed result is marked invalid rather than rewritten. The corrected check receives a new time and its own receipt.</p></aside>
      <AuthorPanel label="EDITORIAL OVERSIGHT" />
    </article></main><SiteFooter /></>
  );
}
