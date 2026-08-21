import { Fragment } from "react";
import Link from "next/link";
import { Corridor, money, monitoredProviders, providerSlugFromName, Quote } from "@/lib/data";
import { hasProviderDestination } from "@/lib/affiliate";
import { TopMoneyCompareRow } from "@/components/TopMoneyCompareRow";

function compareQuotes(a: Quote, b: Quote) {
  if (a.eligibleForPriceRanking !== b.eligibleForPriceRanking) return a.eligibleForPriceRanking ? -1 : 1;
  if (a.provider === "Xe") return -1;
  if (b.provider === "Xe") return 1;
  if (a.status === "verified" && b.status !== "verified") return -1;
  if (a.status !== "verified" && b.status === "verified") return 1;
  return b.recipientGets - a.recipientGets;
}

function UnavailableRow({ provider, mark, unavailable }: { provider: string; mark: string; unavailable?: string }) {
  const bestRated = provider === "Xe";
  return (
    <article className={`quote-row quote-unavailable ${bestRated ? "quote-featured" : ""}`}>
      <div className="provider-cell">
        <div className={`provider-mark provider-${mark.toLowerCase()}`}>{mark}</div>
        <div><Link className="provider-review-link" href={`/reviews/${providerSlugFromName(provider)}`}>{provider}</Link><small>{unavailable ?? "No usable public quote in this sweep"}</small></div>
        {bestRated && <b className="best-tag">Best Rated</b>}
      </div>
      <div className="rate-cell"><strong>Not available</strong><small>No rate to compare</small></div>
      <div className="gets-cell"><strong>Not quoted</strong><small>Cannot take part in the price ranking</small></div>
      <div className="proof-cell"><span className="proof-unavailable">No receipt</span><small>The public journey failed or was unsupported</small></div>
    </article>
  );
}

export function QuoteTable({ corridor, compact = false }: { corridor: Corridor; compact?: boolean }) {
  const ordered = [...corridor.quotes].sort(compareQuotes);
  const quotedProviders = new Set(ordered.map((quote) => quote.provider.toLowerCase()));
  const unavailable = monitoredProviders.filter(({ provider }) => !quotedProviders.has(provider.toLowerCase()));
  const xeUnavailable = unavailable.find(({ provider }) => provider === "Xe");
  const remainingUnavailable = unavailable.filter(({ provider }) => provider !== "Xe");

  return (
    <div className={`quote-table ${compact ? "compact" : ""}`}>
      <div className="quote-head">
        <span>Company</span><span>Rate and visible fee</span><span>What arrives</span><span>Our receipt</span>
      </div>
      {xeUnavailable && (
        <>
          <UnavailableRow provider={xeUnavailable.provider} mark={xeUnavailable.mark} unavailable={"unavailable" in xeUnavailable ? xeUnavailable.unavailable : undefined} />
          {!compact && <TopMoneyCompareRow corridor={corridor} />}
        </>
      )}
      {ordered.map((quote) => {
        const bestRated = quote.provider === "Xe";
        return (
          <Fragment key={quote.provider}>
            <article className={`quote-row ${bestRated ? "quote-featured" : ""} ${quote.status !== "verified" ? "quote-muted" : ""}`}>
              <div className="provider-cell">
                <div className={`provider-mark provider-${quote.mark.toLowerCase()}`}>{quote.mark}</div>
                <div>
                  <Link className="provider-review-link" href={`/reviews/${quote.providerSlug || providerSlugFromName(quote.provider)}`}>{quote.provider}</Link>
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
              <div className="gets-cell"><strong>{money(quote.recipientGets, corridor.toCurrency)}</strong><small>{quote.eligibleForPriceRanking ? "Comparable completed bank-transfer quote" : quote.promotion ? "Promotional quote, not ranked" : quote.status === "stale" ? "Due another standard-case check" : "Calculator evidence only"}</small></div>
              <div className="proof-cell">
                <Link href={`/${corridor.slug}/receipts/${quote.proofId}/`} className={quote.status === "stale" ? "disabled-proof" : "proof-link"}>{quote.status === "stale" ? "Pending" : "Open receipt"}</Link>
                <small>{quote.checkedAt}</small>
              </div>
              {quote.note && <p className="quote-note">{quote.note}</p>}
            </article>
            {bestRated && !compact && <TopMoneyCompareRow corridor={corridor} />}
          </Fragment>
        );
      })}
      {remainingUnavailable.map((entry) => <UnavailableRow provider={entry.provider} mark={entry.mark} unavailable={"unavailable" in entry ? entry.unavailable : undefined} key={entry.provider} />)}
      <p className="table-commercial-note">A provider button may earn us money. The receipt link does not; it opens the evidence we stored independently.</p>
    </div>
  );
}
