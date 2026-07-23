import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "UK Money Transfer Research: Who Pays More and Why",
  description: "Original UK money transfer research using provider rate evidence and World Bank data to show where costs rise and who has fewer practical choices.",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="research-desk-hero">
          <div className="shell">
            <span className="kicker">ORIGINAL UK RESEARCH</span>
            <h1>The expensive route is rarely expensive by accident</h1>
            <p>We use World Bank records and our own provider checks to find where the extra pounds go. Some differences come from cash networks or thin currency markets. Others look much more like pricing power.</p>
          </div>
        </section>
        <section className="section shell research-desk-body">
          <Link href="/research/uk-remittance-vulnerability-index" className="flagship-study-card">
            <div>
              <span className="study-status"><i /> DATA EDITION</span>
              <h2>Why a poorer destination can cost 72% more</h2>
              <p>UK services to low-income countries cost more on average, but India and Pakistan complicate the tidy explanation. We examine 791 service records and compare the same provider across different routes.</p>
              <strong>See which routes break the pattern →</strong>
            </div>
            <div className="study-stat-grid">
              <span><b>72%</b> low income route penalty</span>
              <span><b>33</b> official UK corridors</span>
              <span><b>791</b> latest official UK service observations</span>
              <span><b>8</b> named provider comparisons</span>
            </div>
          </Link>
          <Link href="/research/last-mile-tax" className="secondary-study-card">
            <div>
              <span className="study-status"><i /> NEW DATA EDITION</span>
              <h2>The extra £2.10 paid by people who need cash</h2>
              <p>Cash collection adds about £2.10 to a £200 transfer after allowing for the company and destination. We then test how that premium sits beside account ownership and local payment access.</p>
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
            <div><b>NOW COLLECTING</b><strong>Who passes on a stronger pound?</strong><p>A 90-day record of how quickly customer rates improve when sterling rises, and how quickly they worsen when it falls.</p></div>
            <div><b>NEXT DATA PANEL</b><strong>Ten logos, perhaps two useful quotes</strong><p>A route-level count of advertised companies against reproducible prices, including the providers that land within 1% of the daily winner.</p></div>
          </div>
          <AuthorPanel label="RESEARCH TEAM" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
