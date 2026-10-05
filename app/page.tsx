import Link from "next/link";
import type { Metadata } from "next";
import { CorridorFinder } from "@/components/CorridorFinder";
import { CompanyTrust } from "@/components/CompanyTrust";
import { QuoteTable } from "@/components/QuoteTable";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { corridorGroups, corridors, money } from "@/lib/data";
import { getDisplayQuotes } from "@/lib/live-data";
import { defaultDescription, pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const metadata: Metadata = pageMetadata({
  title: "Online Money Transfer | Today's Rates and Receipts",
  description: defaultDescription,
  path: "/",
  absoluteTitle: true,
});

function CorridorGrid({ items }: { items: typeof corridors }) {
  return (
    <div className="corridor-grid">
      {items.map((corridor) => (
        <Link href={`/${corridor.slug}`} key={corridor.slug}>
          <span className="country-pair"><i>{corridor.fromCode}</i><i>{corridor.toCode}</i></span>
          <span><strong>{corridor.fromCountry} to {corridor.toCountry}</strong><small>{corridor.fromCurrency} → {corridor.toCurrency}</small></span>
          <b>→</b>
        </Link>
      ))}
    </div>
  );
}

export default async function Home() {
  const featuredBase = corridors[0];
  const { quotes: liveQuotes, available: resultsAvailable } = await getDisplayQuotes(featuredBase.slug);
  const featured = { ...featuredBase, quotes: liveQuotes };
  const best = liveQuotes.filter((quote) => quote.eligibleForPriceRanking).sort((a, b) => b.recipientGets - a.recipientGets)[0];
  const sourceAmount = best?.sourceAmount ?? featured.testAmount;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-grid shell">
            <div className="hero-copy">
              <div className="eyebrow"><span>Independent UK rate checks</span><i /> A fresh sweep every day</div>
              <h1>The rate looks decent.<br /><em>What actually arrives?</em></h1>
              <p>We put the same £200 transfer through public provider calculators, then compare the amount at the other end. Each result keeps its dated screenshot. You can inspect the quote rather than taking our word for it.</p>
              <CorridorFinder />
              <div className="hero-points"><span>✓ Visible fees counted</span><span>✓ Introductory offers kept apart</span><span>✓ Previous checks left on file</span></div>
            </div>
            <aside className="receipt-card" aria-label="Latest verified quote receipt">
              <div className="receipt-top"><span>QUOTE RECEIPT</span><b>{best ? "CHECKED" : "PENDING"}</b></div>
              <div className="receipt-route"><div><small>You send</small><strong>{money(sourceAmount, featured.fromCurrency)}</strong><span>{featured.fromCurrency} · Bank transfer</span></div><i>→</i><div><small>They receive</small><strong>{best ? money(best.recipientGets, featured.toCurrency) : "Pending"}</strong><span>{featured.toCurrency} · Bank deposit</span></div></div>
              <div className="receipt-lines"><div><span>Provider</span><strong>{best?.provider ?? "Manual check"}</strong></div><div><span>Quoted rate</span><strong>{best?.rate.toLocaleString("en-GB", { maximumFractionDigits: 5 }) ?? "Pending"}</strong></div><div><span>Transfer fee</span><strong>{best ? money(best.fee, best.feeCurrency ?? featured.fromCurrency) : "Pending"}</strong></div></div>
              <div className="receipt-stamp"><div>PUBLIC QUOTE<br /><b>{best ? best.checkedAt.split(",")[0].toUpperCase() : "IN PROGRESS"}</b></div><span>Screenshot<br />{best ? "stored" : "pending"}</span></div>
              {!best && <p className="sample-warning">{resultsAvailable ? "No comparable completed quote has been collected today. Any older results in the table are dated and shown in grey." : "Saved results are temporarily unavailable. Please try again shortly."}</p>}
            </aside>
          </div>
        </section>

        <section className="trust-strip"><div className="shell"><span>A fairer way to compare the quote</span><strong>Same amount</strong><i /> <strong>Same payment route</strong><i /> <strong>Short checking window</strong><i /> <strong>Proof kept</strong></div></section>

        <section className="section shell" id="corridors">
          <div className="section-heading"><div><span className="kicker">LATEST CHECK</span><h2>Latest results for sending {money(sourceAmount, featured.fromCurrency)} to Spain</h2><p>Today&apos;s completed quotes can be compared. Older results remain visible in grey with their original dates.</p></div><Link href={`/${featured.slug}`}>See every provider and receipt →</Link></div>
          <QuoteTable corridor={featured} compact resultsAvailable={resultsAvailable} />
          <p className="data-caveat">Each provider shows its freshest saved result. Previous results and indicative rates stay out of today&apos;s cheapest-rate claim. All check dates use UTC.</p>
        </section>

        <section className="section shell comparison-home">
          <div className="section-heading"><div><span className="kicker">PRICE AND SERVICE, SIDE BY SIDE</span><h2>Which transfer company fits the job?</h2><p>Compare fees, delivery, access to support and the customer feedback behind each company.</p></div><Link href="/compare">Build a company comparison →</Link></div>
          <div className="steps-grid">
            <article><b>40</b><h3>Companies with customer evidence</h3><p>Read positive themes and reported problems, with original sources. Wider bank and account reviews are labelled separately from transfer-only feedback.</p><Link href="/reviews">Browse the research →</Link></article>
            <article><b>52</b><h3>Routes with comparative context</h3><p>Compare today’s coverage, the spread between observed offers and, where available, a dated historical cost benchmark.</p><Link href="/#corridors">Choose a route →</Link></article>
            <article><b>2</b><h3>Companies in one comparison</h3><p>Put a bank beside a specialist or compare two apps. Focus on price, delivery or customer feedback to see their strengths and limitations.</p><Link href="/compare">Try the interactive comparison →</Link></article>
          </div>
        </section>

        <section className="how-section">
          <div className="shell">
            <div className="section-heading light"><div><span className="kicker">THE CHECKING DESK</span><h2>Enough detail to catch a flattering rate</h2></div><Link href="/methodology">Read how a quote qualifies →</Link></div>
            <div className="steps-grid">
              <article><b>01</b><h3>Use one ordinary transfer</h3><p>New UK checks start with £200 sent from a bank account to another bank account. Historic records keep the amount used at the time.</p></article>
              <article><b>02</b><h3>Keep the checkout screen</h3><p>We record the rate and fee, plus what reaches the recipient. The payment route and time sit beside the captured provider screen.</p></article>
              <article><b>03</b><h3>Keep the latest result and its date</h3><p>A new check replaces the provider&apos;s displayed result. When today has no result, the previous one stays visible in grey and outside the price ranking.</p></article>
            </div>
          </div>
        </section>

        <section className="research-home">
          <div className="shell research-home-grid">
            <div>
              <span className="kicker">ORIGINAL UK RESEARCH</span>
              <h2>Cash delivery carried a £2.10 adjusted difference in the historical data</h2>
              <p>Our Q3 2025 World Bank study models a £200 transfer and separates the adjusted estimate from 17 tightly matched cash and account offers. It examines 791 UK service records alongside financial-access data for 33 destinations.</p>
              <Link href="/research/last-mile-tax">Read the historical study and its method →</Link><p><Link href="/research/weekly-transfer-costs">Explore weekly provider evidence for five UK routes →</Link></p>
            </div>
            <div className="research-home-stats">
              <span><b>£10.23</b> modelled cash cost per £200 · Q3 2025</span>
              <span><b>£4.79</b> modelled account cost per £200 · Q3 2025</span>
              <span><b>17</b> tightly matched cash and account offers</span>
              <span><b>33</b> destinations with access context</span>
            </div>
          </div>
        </section>

        <section className="section shell corridor-section">
          <div className="section-heading"><div><span className="kicker">TRANSFER ROUTES</span><h2>Sending pounds abroad</h2><p>Browse each route&apos;s rates, provider availability and dated evidence.</p></div></div>
          <CorridorGrid items={corridorGroups["from-uk"]} />
        </section>
        <section className="section shell corridor-section">
          <div className="section-heading"><div><h2>Sending money to the UK</h2><p>Compare incoming transfers from Europe and beyond.</p></div></div>
          <CorridorGrid items={corridorGroups["to-uk"]} />
        </section>
        <section className="section shell corridor-section">
          <div className="section-heading"><div><h2>Other international routes</h2><p>Inspect the evidence for transfers between major currencies.</p></div></div>
          <CorridorGrid items={corridorGroups.major} />
        </section>
        <CompanyTrust />
      </main>
      <SiteFooter />
    </>
  );
}
