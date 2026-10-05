import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "UK Money Transfer Research: Who Pays More and Why",
  description: "Original UK money transfer research using provider rate evidence and World Bank data to show where costs rise and who has fewer practical choices.",
  path: "/research",
});

export default function ResearchPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="research-desk-hero">
          <div className="shell">
            <span className="kicker">ORIGINAL UK RESEARCH</span>
            <h1>What the evidence says about transfer costs</h1>
            <p>Compare saved provider offers, examine historical World Bank costs and follow each finding back to its source. Our weekly checks and longer studies answer different questions, with their dates and limits kept beside the figures.</p>
          </div>
        </section>
        <section className="section shell research-desk-body">
          <Link href="/research/uk-remittance-vulnerability-index" className="flagship-study-card">
            <div>
              <span className="study-status"><i /> DATA EDITION</span>
              <h2>How costs differ across 33 UK transfer corridors</h2>
              <p>In the Q3 2025 World Bank sample, services to low-income destinations cost more on average than services to high-income destinations. India and Pakistan complicate the pattern. We examine 791 service records and compare the same provider across different routes.</p>
              <strong>See which routes break the pattern →</strong>
            </div>
            <div className="study-stat-grid">
              <span><b>72%</b> higher average service cost: low-income versus high-income destinations</span>
              <span><b>33</b> official UK corridors</span>
              <span><b>791</b> Q3 2025 UK service observations</span>
              <span><b>8</b> named provider comparisons</span>
            </div>
          </Link>
          <Link href="/research/last-mile-tax" className="secondary-study-card">
            <div>
              <span className="study-status"><i /> NEW DATA EDITION</span>
              <h2>The £2.10 cash-delivery difference in the historical sample</h2>
              <p>Cash delivery is associated with an adjusted cost difference of about £2.10 per modelled £200 transfer in the Q3 2025 sample. The study separates that estimate from 17 tightly matched offers and explores financial-access context.</p>
              <strong>Read the cash comparison →</strong>
            </div>
            <div className="secondary-study-stats">
              <span><b>£2.10</b> adjusted cash premium</span>
              <span><b>17</b> tightly matched offers</span>
              <span><b>0.71</b> unbanked to cash correlation</span>
              <span><b>33</b> destination context panel</span>
            </div>
          </Link>
          <div className="research-queue">
            <div><b>WEEKLY PROVIDER EVIDENCE</b><strong>Five routes, seven days, every receipt</strong><p>Compare historical £200 checks for Spain, the United States, India, Pakistan and the Philippines. Daily payout ranges need at least two qualifying providers checked within one hour.</p><Link href="/research/weekly-transfer-costs">Explore the weekly report and download its data →</Link></div>
            <div><b>BUILD YOUR OWN COMPARISON</b><strong>Price evidence beside customer experience</strong><p>Compare two companies across delivery, support and customer-review themes. Each source keeps its date and scope, including reviews of wider bank-account services.</p><Link href="/compare">Compare providers side by side →</Link></div>
          </div>
          <AuthorPanel label="RESEARCH TEAM" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
