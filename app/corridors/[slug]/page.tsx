import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { QuoteTable } from "@/components/QuoteTable";
import { AuthorPanel } from "@/components/AuthorPanel";
import { CorridorBankDetails } from "@/components/CorridorBankDetails";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { corridors, getCorridor, money, monitoredProviders } from "@/lib/data";
import { getLatestQuotes, getQuoteHistory } from "@/lib/live-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return corridors.map((corridor) => ({ slug: corridor.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const corridor = getCorridor(slug);
  if (!corridor) return {};
  const title = `${corridor.fromCountry} to ${corridor.toCountry} Money Transfer Rates Today`;
  const description = `See what actually arrives when sending ${corridor.fromCurrency} to ${corridor.toCurrency}. Compare current fees, recipient amounts and dated provider proof.`;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}/` },
    robots: { index: false, follow: true },
  };
}

export default async function CorridorAliasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getCorridor(slug)) notFound();
  permanentRedirect(`/${slug}/`);
}

export async function renderCorridorPage(slug: string) {
  const baseCorridor = getCorridor(slug);
  if (!baseCorridor) notFound();
  const [liveQuotes, history] = await Promise.all([getLatestQuotes(slug), getQuoteHistory(slug)]);
  const corridor = liveQuotes.length ? { ...baseCorridor, quotes: liveQuotes } : baseCorridor;
  const verified = corridor.quotes.filter((quote) => quote.eligibleForPriceRanking).sort((a, b) => b.recipientGets - a.recipientGets);
  const comparableLiveQuotes = liveQuotes.filter((quote) => quote.eligibleForPriceRanking);
  const best = verified[0];
  const sourceAmount = corridor.testAmount;
  const newestQuote = [...liveQuotes].sort((a, b) => Date.parse(b.capturedAt ?? "") - Date.parse(a.capturedAt ?? ""))[0];
  const newestComparableQuote = [...comparableLiveQuotes].sort((a, b) => Date.parse(b.capturedAt ?? "") - Date.parse(a.capturedAt ?? ""))[0];
  const canonical = `https://onlinemoneytransfer.co.uk/${slug}`;
  const schema = [
    {
      "@context": "https://schema.org", "@type": "WebPage", name: `${corridor.fromCountry} to ${corridor.toCountry} money transfer rates`,
      description: comparableLiveQuotes.length
        ? `Like-for-like ${corridor.fromCurrency} to ${corridor.toCurrency} transfer evidence with provider fees, recipient amounts and timestamps.`
        : `A monitored ${corridor.fromCurrency} to ${corridor.toCurrency} transfer route showing provider availability and the evidence still needed for a like-for-like comparison.`,
      url: canonical, inLanguage: "en-GB", ...(newestQuote?.capturedAt ? { dateModified: newestQuote.capturedAt } : {}),
      isPartOf: { "@type": "WebSite", name: "Online Money Transfer", url: "https://onlinemoneytransfer.co.uk/" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://onlinemoneytransfer.co.uk/" },
        { "@type": "ListItem", position: 2, name: `${corridor.fromCountry} to ${corridor.toCountry}`, item: canonical },
      ],
    },
    ...(comparableLiveQuotes.length ? [{
      "@context": "https://schema.org", "@type": "Dataset", name: `${corridor.fromCurrency} to ${corridor.toCurrency} transfer quote evidence`,
      description: `Timestamped provider evidence for a ${money(sourceAmount, corridor.fromCurrency)} bank-funded transfer to a bank account.`,
      url: canonical, temporalCoverage: newestComparableQuote?.capturedAt, variableMeasured: ["Provider", "Source amount", "Fee", "Fee currency", "Recipient amount", "Funding method", "Payout method", "Capture time"],
      distribution: { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `https://onlinemoneytransfer.co.uk/api/v1/rates/${slug}` },
      creator: { "@type": "Organization", name: "Finofin Limited", url: "https://onlinemoneytransfer.co.uk/about" },
    }] : []),
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
        <section className="corridor-hero">
          <div className="shell">
            <div className="crumbs"><Link href="/">Home</Link><span>›</span><Link href="/#corridors">Corridors</Link><span>›</span><b>{corridor.fromCountry} to {corridor.toCountry}</b></div>
            <div className="corridor-title-row">
              <div><span className="route-flags">{corridor.fromCode} <i>→</i> {corridor.toCode}</span><h1>What does it cost to send money from {corridor.fromCountry} to {corridor.toCountry}?</h1><p>We test a {money(sourceAmount, corridor.fromCurrency)} personal bank transfer and rank the amount that reaches the recipient.</p></div>
              <div className="status-card"><span><i /> {liveQuotes.length ? "Most recent sweep" : "Manual check due"}</span><strong>{newestQuote?.checkedAt ?? "No current record"}</strong><small>A new collection is scheduled every 24 hours</small></div>
            </div>
          </div>
        </section>
        <section className="section shell corridor-results">
          <div className="result-summary">
            <div><span>Most money delivered by a verified quote</span><strong>{best ? money(best.recipientGets, corridor.toCurrency) : "Pending"}</strong><small>{best ? `${best.provider} · receipt available` : "The current sweep has not produced a complete quote"}</small></div>
            <div><span>Gap between completed quotes</span><strong>{verified.length > 1 ? money(verified[0].recipientGets - verified[verified.length - 1].recipientGets, corridor.toCurrency) : "Pending"}</strong><small>Measured on the same {money(sourceAmount, corridor.fromCurrency)} transfer</small></div>
            <div><span>Companies on our watchlist</span><strong>{monitoredProviders.length}</strong><small>{corridor.quotes.length} returned evidence · {verified.length} can be compared directly</small></div>
          </div>
          <div className="section-heading table-title"><div><span className="kicker">PROVIDER RESULTS</span><h2>Today&apos;s quotes, including the misses</h2><p>Xe appears first as our Best Rated service. Price order then follows comparable recipient amounts; unsupported calculators remain visible rather than quietly disappearing.</p></div></div>
          <QuoteTable corridor={corridor} />
          <p className="data-caveat">{liveQuotes.length ? "Open any proof link to see the screen behind the figure. A missing public quote is shown as unavailable, and the provider should be checked again before money leaves your account." : "We have not substituted a sample rate. The provider list stays in place while the next successful captures are collected."}</p>
          <CorridorBankDetails corridor={corridor} />

          <div className="history-block">
            <div className="section-heading"><div><span className="kicker">HISTORY</span><h2>What providers quoted before today</h2><p>A fresh rate replaces the headline figure, not the record behind it.</p></div></div>
            {history.length ? (
              <div className="history-table">
                <div className="history-head"><span>Checked</span><span>Provider and transfer case</span><span>Recipient received</span><span>Evidence</span></div>
                {history.slice(0, 24).map((item) => (
                  <div className="history-row" key={item.id}>
                    <span>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(item.capturedAt))} UTC</span>
                    <strong>{item.provider} <small>{money(item.sourceAmount, item.sourceCurrency)} · {item.fundingMethod} to {item.payoutMethod}{item.promotion ? " · promotion" : ""} · {item.quoteType}</small></strong>
                    <b>{money(item.recipientAmount, item.recipientCurrency)}</b>
                    <Link href={`/${slug}/receipts/${item.id}`}>View proof</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-chart"><div className="chart-grid"><span /><span /><span /><span /></div><strong>The archive starts with a real check</strong><p>We do not invent a tidy past from today&apos;s calculator.</p></div>
            )}
          </div>
          <aside className="scope-note"><strong>The transfer we are comparing</strong><p>This table covers a personal payment from one bank account into another. Card funding and cash collection are different products. Business pricing, subscription allowances and first-transfer offers are kept outside the standard winner.</p><Link href="/methodology">See where we draw the line →</Link></aside>
          <AuthorPanel label="REVIEWED BY" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
