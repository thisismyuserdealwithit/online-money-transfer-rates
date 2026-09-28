import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProviderComparison } from "@/components/ProviderComparison";
import { FeeIllustration } from "@/components/FeeIllustration";
import { providerComparisonProfiles } from "@/lib/customer-reviews";
import { pageMetadata } from "@/lib/seo";
import styles from "@/components/ComparisonHub.module.css";

export const metadata: Metadata = pageMetadata({ title: "Compare Money Transfer Companies: Fees and Customer Reviews", description: "Compare 40 transfer companies, banks and brokers side by side. Explore pricing models, delivery, service limits and sourced customer-review evidence.", path: "/compare", modifiedTime: "2026-09-29" });

export default function ComparePage() {
  return <><SiteHeader /><main>
    <section className={styles.hero}><div className="shell"><span className="kicker">COMPARE MONEY TRANSFER COMPANIES</span><h1>Put the price beside the service you need</h1><p>Choose two companies to compare their fees, delivery options and customer feedback. Then check the actual quote for your route: the right service still needs to deliver a competitive recipient amount.</p><p><Link href="/#corridors">Find current quotes for your route →</Link></p></div></section>
    <div className={`shell ${styles.body}`}>
      <ProviderComparison profiles={providerComparisonProfiles} initialLeft="wise" initialRight="xe" />
      <div className={styles.intro}>
        <article><h2>Compare the full price</h2><p>A fixed charge is easy to see. A cost built into the exchange rate takes more checking. Start with the same sending budget, currency pair and payment method, then compare what the recipient gets after the disclosed fees.</p><p>Keep introductory offers separate from the rate a returning customer can use. Account plans and business products can also carry conditions that make a headline price unsuitable for your transfer.</p><Link href="/methodology">How our quote comparison works →</Link></article>
        <article><h2>Match the service to the payment</h2><p>For a regular small payment, simple recipient setup and repeatable pricing may matter most. For a property payment or other large transfer, contact, limits and document requirements deserve attention before you send funds.</p><p>A bank, app, cash network and broker can serve different needs. Check the quoted delivery method, whether the recipient has the right account or collection access, and how the provider handles a delayed payment.</p><Link href="/swift-codes">Check receiving-account requirements →</Link></article>
        <article><h2>Read the reviews with their limits</h2><p>We researched customer feedback for all 40 companies in this directory. Each profile records the source and date, with reported strengths and problems. Some sources cover a whole bank or account service; a small transfer-only sample has a different limitation.</p><p>Published ratings describe the people who left feedback. They do not measure every customer’s experience, prove a failure rate or predict your outcome. Use the comments to identify questions, alongside the provider’s terms and your actual quote.</p><Link href="/reviews">Read the full company reviews →</Link></article>
      </div>
      <FeeIllustration />
      <section className={styles.closing}><h2>Make a shortlist, then check the route</h2><p>The comparison above explains how companies differ. Our route pages put those differences beside dated quote receipts, current coverage and comparisons with other destinations. Selected UK routes also include historical World Bank cost observations, labelled by period and calculation method.</p><ol><li>Choose providers that support your sending country, recipient and payout method.</li><li>Request quotes using the same total budget and payment method.</li><li>Check the final recipient amount, delivery estimate and any conditions attached to the price.</li><li>Use customer-review themes to ask about support, delays or limits that matter to your payment.</li></ol><p><Link href="/#corridors">Explore all 52 transfer routes →</Link></p><p>Customer-review research checked on 29 September 2026 by the OMT research desk. Published service descriptions retain the dates and source links on their company pages. Prices and terms can change.</p></section>
    </div>
  </main><SiteFooter /></>;
}
