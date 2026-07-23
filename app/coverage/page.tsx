import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { corridors } from "@/lib/data";
import { getCoverageDashboard } from "@/lib/live-data";

export const metadata: Metadata = {
  title: "Today's Money Transfer Rate Checks and Provider Evidence",
  description: "See which transfer routes have current provider evidence, how many quotes completed and when the latest receipt was stored.",
  alternates: { canonical: "/coverage" },
};

function checkedLabel(value: string | null) {
  if (!value) return "No successful capture";
  return `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC`;
}

export default async function CoveragePage() {
  const dashboard = await getCoverageDashboard();
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
            <p>This ledger reads the live archive. A route counts only after a provider record and its receipt are stored, which is less flattering than counting every logo on a comparison page.</p>
            <div className="coverage-summary">
              <article><strong>{populated}/{corridors.length}</strong><span>routes with stored evidence</span></article>
              <article><strong>{totalProviders}</strong><span>current company records</span></article>
              <article><strong>{checkedLabel(latest)}</strong><span>freshest receipt</span></article>
            </div>
          </div>
        </section>

        <section className="section shell">
          <div className="section-heading"><div><span className="kicker">ROUTE BY ROUTE</span><h2>Where we have a price we can stand behind</h2><p>A verified result completed the transfer calculator. An indicative row may come from a converter or a modelled bank price, and is labelled accordingly.</p></div></div>
          <div className="coverage-table">
            <div className="coverage-head"><span>Route</span><span>Companies found</span><span>Type of evidence</span><span>Most recent receipt</span></div>
            {corridors.map((corridor) => {
              const row = bySlug.get(corridor.slug);
              const count = row?.providerCount ?? 0;
              return (
                <Link className={`coverage-row ${count ? "has-data" : "no-data"}`} href={`/corridors/${corridor.slug}`} key={corridor.slug}>
                  <span><strong>{corridor.fromCountry} → {corridor.toCountry}</strong><small>{corridor.fromCurrency} to {corridor.toCurrency}</small></span>
                  <b>{count || "Pending"}</b>
                  <span><strong>{row?.verifiedCount ?? 0} verified</strong><small>{row?.indicativeCount ?? 0} indicative</small></span>
                  <span><strong>{checkedLabel(row?.latestCapturedAt ?? null)}</strong><small>{count ? "Open the stored receipts" : "We have not reconstructed a rate"}</small></span>
                </Link>
              );
            })}
          </div>

          <div className="run-ledger">
            <div className="section-heading"><div><span className="kicker">CHECKING HISTORY</span><h2>How the latest sweeps behaved</h2><p>A partial sweep stored at least one result, but another company blocked the journey or failed to produce a complete public quote.</p></div></div>
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
