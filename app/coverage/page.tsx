import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { corridors } from "@/lib/data";
import { getCoverageDashboard, getProviderCoverage } from "@/lib/live-data";
import { providerCollectionLabel, providerReviews } from "@/lib/reviews";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Today's Money Transfer Rate Checks and Provider Evidence",
  description: "See which transfer routes have current provider evidence, how many quotes completed and when the latest receipt was stored.",
  path: "/coverage",
});

function checkedLabel(value: string | null) {
  if (!value) return "No successful capture";
  return `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC`;
}

export default async function CoveragePage() {
  const [dashboard, providerCoverage] = await Promise.all([getCoverageDashboard(), getProviderCoverage()]);
  const reviewsBySlug = new Map(providerReviews.map((review) => [review.slug, review]));
  const coverageByProvider = new Map(providerCoverage.map((row) => [row.providerSlug, row]));
  const providerRows = [...new Set([...reviewsBySlug.keys(), ...coverageByProvider.keys()])].map((slug) => {
    const review = reviewsBySlug.get(slug);
    const live = coverageByProvider.get(slug);
    return { slug, review, live, name: review?.name ?? live?.providerName ?? slug };
  });
  const bySlug = new Map(dashboard.corridors.map((row) => [row.corridorSlug, row]));
  const populated = corridors.filter((corridor) => (bySlug.get(corridor.slug)?.providerCount ?? 0) > 0).length;
  const totalProviders = dashboard.corridors.reduce((sum, row) => sum + row.providerCount, 0);
  const latest = dashboard.corridors.map((row) => row.latestCapturedAt).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null;
  console.info("coverage-snapshot", JSON.stringify({ populated, expected: corridors.length, totalProviders, latest }));

  return (
    <>
      <SiteHeader />
      <main>
        <section className="coverage-hero">
          <div className="shell">
            <span className="kicker">WHAT THE CHECKER FOUND</span>
            <h1>The completed quotes, the calculator rates and the failures</h1>
            <p>This ledger counts only fresh evidence for each route&apos;s published standard test amount and currency pair. Older, promotional and different-amount receipts remain in history rather than inflating current coverage.</p>
            <div className="coverage-summary">
              <article><strong>{populated}/{corridors.length}</strong><span>routes with stored evidence</span></article>
              <article><strong>{totalProviders}</strong><span>fresh standard-case company records</span></article>
              <article><strong>{checkedLabel(latest)}</strong><span>freshest receipt</span></article>
            </div>
          </div>
        </section>

        <section className="section shell">
          <div className="section-heading"><div><span className="kicker">ROUTE BY ROUTE</span><h2>Where we have a price we can stand behind</h2><p>Counts use fresh evidence for the configured amount and currencies only. A verified result completed the standard bank-transfer case; indicative evidence remains clearly labelled.</p></div></div>
          <div className="coverage-table">
            <div className="coverage-head"><span>Route</span><span>Companies found</span><span>Type of evidence</span><span>Most recent receipt</span></div>
            {corridors.map((corridor) => {
              const row = bySlug.get(corridor.slug);
              const count = row?.providerCount ?? 0;
              return (
                <Link className={`coverage-row ${count ? "has-data" : "no-data"}`} href={`/${corridor.slug}`} key={corridor.slug}>
                  <span><strong>{corridor.fromCountry} → {corridor.toCountry}</strong><small>{corridor.fromCurrency} to {corridor.toCurrency}</small></span>
                  <b>{count || "Pending"}</b>
                  <span><strong>{row?.verifiedCount ?? 0} verified</strong><small>{row?.indicativeCount ?? 0} indicative</small></span>
                  <span><strong>{checkedLabel(row?.latestCapturedAt ?? null)}</strong><small>{count ? "Open the stored receipts" : "We have not reconstructed a rate"}</small></span>
                </Link>
              );
            })}
          </div>

          <section className="run-ledger" aria-labelledby="provider-ledger-title">
            <div className="section-heading"><div><span className="kicker">PROVIDER BY PROVIDER</span><h2 id="provider-ledger-title">Which companies have current evidence?</h2><p>The research directory also includes companies without a captured rate. Collection labels describe how we seek a quote; the counts below show only fresh stored evidence.</p></div></div>
            <div className="coverage-table">
              <div className="coverage-head"><span>Provider and collection method</span><span>Routes</span><span>Type of evidence</span><span>Latest receipt</span></div>
              {providerRows.map(({ slug, review, live, name }) => {
                const contents = <><span><strong>{name}</strong><small>{providerCollectionLabel(review, Boolean(live))}</small></span><b>{live?.corridorCount ?? 0}</b><span><strong>{live?.verifiedCount ?? 0} verified</strong><small>{live?.indicativeCount ?? 0} indicative</small></span><span><strong>{live ? checkedLabel(live.latestCapturedAt) : "No current receipt"}</strong><small>{review ? "Read the provider research" : "Appears in the stored rate evidence"}</small></span></>;
                const className = `coverage-row ${live ? "has-data" : "no-data"}`;
                return review ? <Link className={className} href={`/reviews/${slug}`} key={slug}>{contents}</Link> : <div className={className} key={slug}>{contents}</div>;
              })}
            </div>
          </section>

          <div className="run-ledger">
            <div className="section-heading"><div><span className="kicker">CHECKING HISTORY</span><h2>How the latest sweeps behaved</h2><p>A partial sweep kept the results it collected but ended early or encountered a provider error.</p></div></div>
            {dashboard.runs.length ? dashboard.runs.map((run) => (
              <article key={run.id}>
                <span className={`run-state state-${run.status}`}>{run.status}</span>
                <strong>{checkedLabel(run.startedAt)}</strong>
                <span>{run.succeeded} stored</span><span>{run.failed} failed</span><span>{run.attempted} attempted</span>
              </article>
            )) : <p className="coverage-empty">The checking history will appear after the first completed production sweep.</p>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
