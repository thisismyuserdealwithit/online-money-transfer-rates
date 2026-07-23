import Link from "next/link";
import { CorridorFinder } from "@/components/CorridorFinder";
import { CompanyTrust } from "@/components/CompanyTrust";
import { QuoteTable } from "@/components/QuoteTable";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { corridorGroups, corridors, money } from "@/lib/data";
import { getLatestQuotes } from "@/lib/live-data";

function CorridorGrid({ items }: { items: typeof corridors }) {
  return (
    <div className="corridor-grid">
      {items.map((corridor) => (
        <Link href={`/corridors/${corridor.slug}`} key={corridor.slug}>
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
  const liveQuotes = await getLatestQuotes(featuredBase.slug);
  const featured = { ...featuredBase, quotes: liveQuotes };
  const best = liveQuotes.filter((quote) => quote.status === "verified").sort((a, b) => b.recipientGets - a.recipientGets)[0];
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
              <div className="receipt-lines"><div><span>Provider</span><strong>{best?.provider ?? "Manual check"}</strong></div><div><span>Quoted rate</span><strong>{best?.rate.toLocaleString("en-GB", { maximumFractionDigits: 5 }) ?? "Pending"}</strong></div><div><span>Transfer fee</span><strong>{best ? money(best.fee, featured.fromCurrency) : "Pending"}</strong></div></div>
              <div className="receipt-stamp"><div>PUBLIC QUOTE<br /><b>{best ? best.checkedAt.split(",")[0].toUpperCase() : "IN PROGRESS"}</b></div><span>Screenshot<br />{best ? "stored" : "pending"}</span></div>
              {!best && <p className="sample-warning">The latest manual check has not landed yet, so we are not dressing an old rate up as today&apos;s.</p>}
            </aside>
          </div>
        </section>

        <section className="trust-strip"><div className="shell"><span>A fairer way to compare the quote</span><strong>Same amount</strong><i /> <strong>Same payment route</strong><i /> <strong>Short checking window</strong><i /> <strong>Proof kept</strong></div></section>

        <section className="section shell" id="corridors">
          <div className="section-heading"><div><span className="kicker">LATEST CHECK</span><h2>What {money(sourceAmount, featured.fromCurrency)} buys in Spain today</h2><p>A completed transfer quote can win. A currency converter cannot.</p></div><Link href={`/corridors/${featured.slug}`}>See every provider and receipt →</Link></div>
          <QuoteTable corridor={featured} compact />
          <p className="data-caveat">Every published figure has a stored capture behind it. We show indicative rates, but they stay out of the cheapest-rate claim.</p>
        </section>

        <section className="how-section">
          <div className="shell">
            <div className="section-heading light"><div><span className="kicker">THE CHECKING DESK</span><h2>Enough detail to catch a flattering rate</h2></div><Link href="/methodology">Read how a quote qualifies →</Link></div>
            <div className="steps-grid">
              <article><b>01</b><h3>Use one ordinary transfer</h3><p>New UK checks start with £200 sent from a bank account to another bank account. Historic records keep the amount used at the time.</p></article>
              <article><b>02</b><h3>Keep the checkout screen</h3><p>We record the rate and fee, plus what reaches the recipient. The payment route and time sit beside the captured provider screen.</p></article>
              <article><b>03</b><h3>Replace the headline, keep the history</h3><p>The newest successful check becomes current. Yesterday&apos;s quote stays in the archive, where an inconvenient old result belongs.</p></article>
            </div>
          </div>
        </section>

        <section className="research-home">
          <div className="shell research-home-grid">
            <div>
              <span className="kicker">ORIGINAL UK RESEARCH</span>
              <h2>Cash collection costs about £2.10 more on a £200 transfer</h2>
              <p>That is roughly the price of a supermarket loaf, added because the recipient needs notes in hand. Our study compares like-for-like delivery and sets 791 UK service records against financial access data for 33 destinations.</p>
              <Link href="/research/last-mile-tax">Read the figures and the awkward bits →</Link>
            </div>
            <div className="research-home-stats">
              <span><b>£10.23</b> average cash service cost per £200</span>
              <span><b>£4.79</b> average account delivery cost per £200</span>
              <span><b>17</b> tightly matched cash and account offers</span>
              <span><b>33</b> destinations with access context</span>
            </div>
          </div>
        </section>

        <section className="section shell corridor-section">
          <div className="section-heading"><div><span className="kicker">UNITED KINGDOM</span><h2>Sending pounds abroad</h2><p>Current GBP comparisons for the routes UK customers use most.</p></div></div>
          <CorridorGrid items={corridorGroups["from-uk"]} />
          <div className="section-heading corridor-subheading"><div><span className="kicker">INBOUND</span><h2>Bringing money into the UK</h2><p>The same receipt test, this time with pounds arriving at the other end.</p></div></div>
          <CorridorGrid items={corridorGroups["to-uk"]} />
          <div className="section-heading corridor-subheading"><div><span className="kicker">MAJOR GLOBAL ROUTES</span><h2>Useful comparisons beyond sterling</h2><p>We also watch the large routes between Europe and the United States, plus North America and Australasia.</p></div></div>
          <CorridorGrid items={corridorGroups.major} />
        </section>
        <CompanyTrust />
      </main>
      <SiteFooter />
    </>
  );
}
