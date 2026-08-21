import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { corridors, getCorridor } from "@/lib/data";
import { getLiveProof } from "@/lib/live-data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "Stored Money Transfer Rate Receipt",
    description:
      "The dated provider screen and recorded figures behind an Online Money Transfer rate.",
    path: `/proof/${encodeURIComponent(id)}`,
    noIndex: true,
  });
}

export async function ProofContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = await getLiveProof(id);
  let found: { corridor: (typeof corridors)[number]; quote: (typeof corridors)[number]["quotes"][number] } | undefined;
  for (const corridor of corridors) {
    const quote = corridor.quotes.find((item) => item.proofId === id);
    if (quote) { found = { corridor, quote }; break; }
  }
  if (!found && !live) notFound();
  if (live && !found) {
    const corridor = corridors.find((item) => item.slug === live.corridor_slug) ?? corridors[0];
    const providerName = String(live.provider_name ?? "Provider");
    const indicative = String(live.quote_type) === "indicative";
    let raw: Record<string, unknown> = {};
    try { raw = JSON.parse(String(live.raw_payload ?? "{}")) as Record<string, unknown>; } catch { raw = {}; }
    const evidenceSource = typeof raw.evidenceSource === "string" ? raw.evidenceSource : providerName;
    const providerCollectedAt = typeof raw.providerQuoteCollectedAt === "string" ? raw.providerQuoteCollectedAt : null;
    return (
      <>
        <SiteHeader />
        <main className="proof-page shell">
          <div className="crumbs"><Link href={`/${corridor.slug}`}>← Return to the rate table</Link></div>
          <div className="proof-layout">
            <section>
              <span className="kicker">THE STORED RECEIPT</span>
              <h1>The screen behind our {providerName} figure</h1>
              <p className="proof-lead">{indicative ? "This is calculator evidence with its disclosed pricing calculation" : "This is the original public transfer evidence"} from {evidenceSource}, captured at {String(live.captured_at)}.</p>
              <div className="screenshot-frame">
                <div className="browser-bar"><i /><i /><i /><span>{String(live.quote_url)}</span></div>
                {/* A provider receipt must remain pixel exact, so image optimisation is intentionally skipped. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="proof-image" src={`/api/proof/${id}`} alt={`${providerName} quote captured for ${corridor.fromCountry} to ${corridor.toCountry}`} />
              </div>
            </section>
            <aside className="proof-meta">
              <h2>What was recorded</h2>
              <dl>
                <div><dt>Status</dt><dd className={String(live.quote_type)}>{String(live.quote_type)}</dd></div>
                <div><dt>Checked</dt><dd>{String(live.captured_at)}</dd></div>
                <div><dt>Amount tested</dt><dd>{String(live.source_amount)} {String(live.source_currency)}</dd></div>
                <div><dt>Route</dt><dd>{corridor.fromCountry} → {corridor.toCountry}</dd></div>
                <div><dt>Recipient gets</dt><dd>{String(live.recipient_amount)} {String(live.recipient_currency)}</dd></div>
                <div><dt>Rate used</dt><dd>{Number(live.exchange_rate).toLocaleString("en-GB", { maximumFractionDigits: 6 })}</dd></div>
                <div><dt>Visible fee</dt><dd>{String(live.fee_amount)} {String(live.fee_currency)}</dd></div>
                <div><dt>Funding</dt><dd>{String(live.funding_method)}</dd></div>
                <div><dt>Payout</dt><dd>{String(live.payout_method)}</dd></div>
                {live.plan_name && <div><dt>Pricing basis</dt><dd>{String(live.plan_name)}</dd></div>}
                <div><dt>Evidence source</dt><dd>{evidenceSource}</dd></div>
                {providerCollectedAt && <div><dt>Provider data collected</dt><dd>{providerCollectedAt}</dd></div>}
                {Number(live.promotion) === 1 && <div><dt>Offer</dt><dd>{String(live.plan_name ?? "First-transfer promotion")}</dd></div>}
                <div><dt>Screenshot hash</dt><dd><code>{String(live.screenshot_sha256).slice(0, 18)}…</code></dd></div>
              </dl>
            </aside>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }
  if (!found) notFound();
  const { corridor, quote } = found;
  return (
    <>
      <SiteHeader />
      <main className="proof-page shell">
          <div className="crumbs"><Link href={`/${corridor.slug}`}>← Return to the rate table</Link></div>
        <div className="proof-layout">
          <section>
            <span className="kicker">THE STORED RECEIPT</span>
            <h1>The screen behind our {quote.provider} figure</h1>
            <p className="proof-lead">This record belongs to the UK to {corridor.toCountry} comparison. A production capture keeps the original image and source address, with its time and file hash.</p>
            <div className="screenshot-frame">
              <div className="browser-bar"><i /><i /><i /><span>Provider quote page</span></div>
              <div className="screenshot-placeholder"><b>PROOF SCREENSHOT</b><strong>{quote.provider}</strong><p>{quote.status === "indicative" ? "Indicative converter capture" : "Public transfer quote capture"}</p><span>Sample screen · production image pending</span></div>
            </div>
          </section>
          <aside className="proof-meta">
            <h2>What was recorded</h2>
            <dl><div><dt>Status</dt><dd className={quote.status}>{quote.status}</dd></div><div><dt>Checked</dt><dd>{quote.checkedAt}</dd></div><div><dt>Amount tested</dt><dd>{quote.sourceAmount ?? corridor.testAmount} {corridor.fromCurrency}</dd></div><div><dt>Route</dt><dd>{corridor.fromCountry} → {corridor.toCountry}</dd></div><div><dt>Funding</dt><dd>Bank transfer</dd></div><div><dt>Payout</dt><dd>Bank deposit</dd></div><div><dt>Record ID</dt><dd><code>{quote.proofId}</code></dd></div></dl>
            <p>This fallback record uses a placeholder where the provider image would sit. A live receipt is replaced only by a newly timed capture, never silently edited.</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default async function LegacyProofPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = await getLiveProof(id);
  const fallbackCorridor = corridors.find((corridor) => corridor.quotes.some((quote) => quote.proofId === id));
  const corridor = live ? getCorridor(String(live.corridor_slug)) : fallbackCorridor;
  if (!corridor) notFound();
  permanentRedirect(`/${corridor.slug}/receipts/${encodeURIComponent(id)}`);
}
