import { Fragment } from "react";
import Link from "next/link";
import { Corridor, money, monitoredProviders, providerSlugFromName, Quote } from "@/lib/data";
import { hasProviderDestination } from "@/lib/affiliate";
import { getProviderReview } from "@/lib/reviews";
import { TopMoneyCompareRow } from "@/components/TopMoneyCompareRow";

function compareQuotes(a: Quote, b: Quote) {
  if ((a.status === "stale") !== (b.status === "stale")) return a.status === "stale" ? 1 : -1;
  if (a.eligibleForPriceRanking !== b.eligibleForPriceRanking) return a.eligibleForPriceRanking ? -1 : 1;
  if (a.provider === "Xe") return -1;
  if (b.provider === "Xe") return 1;
  if (a.status === "verified" && b.status !== "verified") return -1;
  if (a.status !== "verified" && b.status === "verified") return 1;
  return b.recipientGets - a.recipientGets;
}

function ProviderName({ provider, slug }: { provider: string; slug?: string }) {
  const review = getProviderReview(slug || providerSlugFromName(provider));
  return review
    ? <Link className="provider-review-link" href={`/reviews/${review.slug}`}>{provider}</Link>
    : <strong>{provider}</strong>;
}

export function QuoteTable({ corridor, compact = false, resultsAvailable = true }: { corridor: Corridor; compact?: boolean; resultsAvailable?: boolean }) {
  const ordered = [...corridor.quotes].sort(compareQuotes);
  const quotedProviders = new Set(ordered.map((quote) => quote.providerSlug || providerSlugFromName(quote.provider)));
  const unavailable = monitoredProviders.filter(({ provider }) => !quotedProviders.has(providerSlugFromName(provider)));
  const hasXe = quotedProviders.has("xe");

  return (
    <div className={`quote-table ${compact ? "compact" : ""}`}>
      <div className="quote-head">
        <span>Company</span><span>Rate and visible fee</span><span>What arrives</span><span>Our receipt</span>
      </div>
      {!ordered.length && <p className="quote-no-results">{resultsAvailable ? "No saved results for this transfer yet." : "Saved results are temporarily unavailable. Please try again shortly."}</p>}
      {!hasXe && !compact && <TopMoneyCompareRow corridor={corridor} />}
      {ordered.map((quote) => {
        const bestRated = (quote.providerSlug || providerSlugFromName(quote.provider)) === "xe";
        return (
          <Fragment key={quote.providerSlug || quote.provider}>
            <article className={`quote-row ${bestRated ? "quote-featured" : ""} ${quote.status !== "verified" ? "quote-muted" : ""} ${quote.status === "stale" ? "quote-historical" : ""}`}>
              <div className="provider-cell">
                <div className={`provider-mark provider-${quote.mark.toLowerCase()}`}>{quote.mark}</div>
                <div>
                  <ProviderName provider={quote.provider} slug={quote.providerSlug} />
                  <small>{quote.delivery}</small>
                  {quote.status !== "stale" && hasProviderDestination(quote.providerSlug || providerSlugFromName(quote.provider)) && (
                    <a
                      className="provider-visit"
                      href={`/go/${quote.providerSlug || providerSlugFromName(quote.provider)}?corridor=${encodeURIComponent(corridor.slug)}&placement=rate-table`}
                      rel="sponsored nofollow"
                    >
                      Recheck with provider <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
                {bestRated && <b className="best-tag">Best Rated</b>}
              </div>
              <div className="rate-cell"><strong>{quote.rate.toLocaleString("en-GB", { maximumFractionDigits: 5 })}</strong><small>Fee {money(quote.fee, quote.feeCurrency ?? corridor.fromCurrency)}</small></div>
              <div className="gets-cell"><strong>{money(quote.recipientGets, corridor.toCurrency)}</strong><small>{quote.status === "stale" ? "Previous result · not a current quote" : quote.eligibleForPriceRanking ? "Comparable completed bank-transfer quote" : quote.promotion ? "Promotional quote, not ranked" : "Calculator evidence only"}</small></div>
              <div className="proof-cell">
                <Link href={`/${corridor.slug}/receipts/${quote.proofId}`} className="proof-link">Open receipt</Link>
                <small>{quote.checkedAt}</small>
              </div>
              {quote.note && <p className="quote-note">{quote.note}</p>}
            </article>
            {bestRated && !compact && <TopMoneyCompareRow corridor={corridor} />}
          </Fragment>
        );
      })}
      {resultsAvailable && unavailable.length > 0 && (
        <details className="quote-missing-note">
          <summary>{unavailable.length} monitored providers have no saved result for this transfer</summary>
          <p>{unavailable.map(({ provider }) => provider).join(", ")}.</p>
          <p>They are omitted from the table until we have a usable result for the amount and currencies shown. This does not mean the provider cannot offer the transfer.</p>
        </details>
      )}
      <p className="table-commercial-note">A provider button may earn us money. The receipt link does not; it opens the evidence we stored independently.</p>
    </div>
  );
}
