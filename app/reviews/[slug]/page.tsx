import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CustomerReviewSection } from "@/components/CustomerReviewSection";
import { ProviderComparison } from "@/components/ProviderComparison";
import { ProviderEvidenceSummary } from "@/components/ProviderEvidenceSummary";
import { getCustomerReviewEvidence, providerComparisonProfiles } from "@/lib/customer-reviews";
import { getCorridor, money } from "@/lib/data";
import { getProviderRateEvidence } from "@/lib/live-data";
import { getProviderReview, providerReviews } from "@/lib/reviews";
import { getReviewMaterialUpdatedAt, reviewDateLabel } from "@/lib/provider-evidence-summary";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export function generateStaticParams() {
  return providerReviews.map((review) => ({ slug: review.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const review = getProviderReview(slug);
  if (!review) return {};
  return { ...pageMetadata({
    title: `${review.name} Review: Customer Feedback, Rates and Fees`,
    description: `Read ${review.name} customer-review research alongside transfer fees, live rate evidence and service limits. Compare it side by side with other providers.`,
    path: `/reviews/${review.slug}`,
    type: "article",
    modifiedTime: getReviewMaterialUpdatedAt(review, getCustomerReviewEvidence(slug)),
    authors: review.byline ? [review.byline] : ["Russell Gous", "Alon Rajic"],
    socialTitle: review.rating === null ? `${review.name} provider research` : `${review.name} rate review and live evidence`,
    socialDescription: review.verdict,
  }), ...(review.byline ? { authors: [{ name: review.byline, url: "https://onlinemoneytransfer.co.uk/about" }] } : {}) };
}

function capturedLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value)) + " UTC";
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = getProviderReview(slug);
  if (!review) notFound();

  const customerEvidence = getCustomerReviewEvidence(review.slug);
  const evidence = await getProviderRateEvidence(review.slug);
  const related = review.comparisonSlugs
    .map((comparisonSlug) => getProviderReview(comparisonSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const updatedAt = getReviewMaterialUpdatedAt(review, customerEvidence);
  const updatedLabel = reviewDateLabel(updatedAt);

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: `${review.name} exchange rate and fee review`,
    dateModified: updatedAt,
    author: review.byline
      ? { "@type": "Organization", name: review.byline, url: "https://onlinemoneytransfer.co.uk/about" }
      : { "@type": "Person", name: "Russell Gous", url: "https://onlinemoneytransfer.co.uk/authors/russell-gous" },
    reviewBody: review.verdict,
    itemReviewed: { "@type": "FinancialService", name: review.name },
    ...(review.rating === null ? {} : { reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 } }),
    publisher: { "@type": "Organization", name: "Finofin Limited", url: "https://onlinemoneytransfer.co.uk/about" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://onlinemoneytransfer.co.uk" },
      { "@type": "ListItem", position: 2, name: "Reviews", item: "https://onlinemoneytransfer.co.uk/reviews" },
      { "@type": "ListItem", position: 3, name: review.name, item: `https://onlinemoneytransfer.co.uk/reviews/${review.slug}` },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <header className="review-article-hero">
          <div className="shell">
            <div className="review-breadcrumbs"><Link href="/">Home</Link><span>›</span><Link href="/reviews">Reviews</Link><span>›</span><b>{review.name}</b></div>
            <div className="review-hero-grid">
              <div>
                <span className={`provider-mark provider-mark-large mark-${review.slug}`}>{review.mark}</span>
                <span className="kicker">{review.category.toUpperCase()} · PRICE AND SERVICE REVIEW</span>
                <h1>{review.name} review: rates, service and customer feedback</h1>
                <p>{review.verdict}</p>
                <div className="review-byline">{review.byline ? <span>Research by <Link href="/about">{review.byline}</Link></span> : <><span>Written by <Link href="/authors/russell-gous">Russell Gous</Link></span><span>Evidence reviewed by <Link href="/authors/alon-rajic">Alon Rajic</Link></span></>}<span>Updated <time dateTime={updatedAt}>{updatedLabel}</time></span></div>
              </div>
              <aside className="review-rating-card">
                <span>EDITORIAL RATING</span>
                {review.rating === null ? <><strong className="review-unrated">Not rated</strong><p>This research covers published service terms. We have not assigned an editorial score.</p></> : <><strong>{review.rating.toFixed(1)}<small>/5</small></strong><div aria-label={`${review.rating} out of 5 stars`}>{"★★★★★".split("").map((star, index) => <i className={index < Math.round(review.rating as number) ? "filled" : ""} key={index}>{star}</i>)}</div><p>This is our view of the whole service. Today&apos;s cheapest quote is a separate question.</p></>}
                <a href={`/go/${review.slug}?placement=review-hero`} rel="sponsored nofollow">Recheck {review.name}&apos;s price</a>
              </aside>
            </div>
          </div>
        </header>

        <div className="shell review-article-layout">
          <article className="review-main">
            <ProviderEvidenceSummary review={review} customer={customerEvidence} evidence={evidence} />

            <section className="review-fast-facts">
              <h2>Where {review.name} makes sense</h2>
              <dl>
                <div><dt>Best for</dt><dd>{review.bestFor}</dd></div>
                <div><dt>Less suitable for</dt><dd>{review.lessSuitableFor}</dd></div>
                <div><dt>Where the rate cost sits</dt><dd>{review.rateModel}</dd></div>
                <div><dt>What the fee tells you</dt><dd>{review.feeModel}</dd></div>
                <div><dt>Delivery</dt><dd>{review.delivery}</dd></div>
                <div><dt>Access</dt><dd>{review.access}</dd></div>
              </dl>
            </section>

            <section className="review-analysis">
              <span className="kicker">THE PRICE VERDICT</span>
              <h2>How {review.name}&apos;s quote can flatter or disappoint</h2>
              {review.analysis.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>

            {customerEvidence && <CustomerReviewSection providerName={review.name} evidence={customerEvidence} />}

            <section className="review-pros-cons">
              <article><span>EARNS ITS PLACE</span><h2>Where it works well</h2><ul>{review.strengths.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article><span>READ THE SMALLER PRINT</span><h2>Where the value thins out</h2><ul>{review.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul></article>
            </section>

            <section className="review-evidence" id="provider-rate-evidence">
              <header>
                <div><span className="kicker">RECENT RATE EVIDENCE</span><h2>The latest {review.name} figures we can reproduce</h2><p>Each row is the newest matching record returned within the rolling 36-hour window. The receipt shows the provider screen or calculation behind it, including the time we saw it. This window can include the previous UTC day.</p></div>
                <Link href="/coverage">See the full checking ledger →</Link>
              </header>
              {evidence.length ? (
                <div className="review-evidence-scroll">
                  <table>
                    <thead><tr><th>Route</th><th>Sent</th><th>Visible fee</th><th>Amount delivered</th><th>Against the best completed quote</th><th>Receipt</th></tr></thead>
                    <tbody>
                      {evidence.slice(0, 18).map((item) => {
                        const corridor = getCorridor(item.corridorSlug);
                        const delta = item.bestVerifiedRecipient !== null && item.eligibleForPriceRanking
                          ? item.recipientAmount - item.bestVerifiedRecipient
                          : null;
                        return (
                          <tr key={item.id}>
                            <th scope="row"><Link href={`/${item.corridorSlug}`}>{corridor ? `${corridor.fromCountry} → ${corridor.toCountry}` : item.corridorSlug}</Link><small>{item.fundingMethod} · {item.payoutMethod}</small></th>
                            <td>{money(item.sourceAmount, item.sourceCurrency)}</td>
                            <td>{money(item.feeAmount, item.feeCurrency)}</td>
                            <td><strong>{money(item.recipientAmount, item.recipientCurrency)}</strong><small>Rate {item.exchangeRate.toLocaleString("en-GB", { maximumFractionDigits: 6 })}</small></td>
                            <td>{!item.eligibleForPriceRanking ? <span className="evidence-indicative">Non-standard evidence, not ranked</span> : delta === null ? "No like-for-like rival" : delta === 0 ? <b className="evidence-win">Best completed result</b> : <span>{money(delta, item.recipientCurrency)}</span>}</td>
                            <td><Link href={`/${item.corridorSlug}/receipts/${encodeURIComponent(item.id)}`}>Open receipt</Link><small>{capturedLabel(item.capturedAt)}</small></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="review-evidence-empty">
                  <strong>We do not have a reproducible public quote right now</strong>
                  <p>{review.collectionMethod === "account-quote" ? "This is a review of the provider’s published service. Request a customer-specific quote directly; we have not collected an anonymous public transfer rate." : `${review.name} remains here because UK customers will still encounter it. A rate will appear only when the amount and payment method can be recorded with a time and receipt.`}</p>
                </div>
              )}
            </section>

            <ProviderComparison profiles={providerComparisonProfiles} initialLeft={review.slug} initialRight={related[0]?.slug} />

            <section className="review-comparisons">
              <span className="kicker">THE SHORTLIST</span>
              <h2>What to price beside {review.name}</h2>
              <div>
                {related.map((item) => (
                  <Link href={`/reviews/${item.slug}`} key={item.slug}>
                    <span className={`provider-mark mark-${item.slug}`}>{item.mark}</span>
                    <div><strong>{review.name} or {item.name}?</strong><p>{item.verdict}</p><b>Read the {item.name} rate review →</b></div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="review-sources" id="provider-sources">
              <span className="kicker">WHAT WE CHECKED</span>
              <h2>{review.name}&apos;s own pricing documents</h2>
              <p>These pages describe the published terms. The corridor table is gathered separately, so a provider&apos;s explanation never substitutes for the quote it gives us.</p>
              <ol>{review.sources.map((source) => <li key={source.url}><a href={source.url}>{source.label}</a><span>{source.publisher}</span></li>)}</ol>
            </section>

            <aside className="review-disclosure">
              <strong>Who pays us, and what it cannot buy</strong>
              <p>Finofin Limited publishes this review. A provider link may earn revenue, but it cannot purchase a better rate or change an evidence label. Eligibility differs and prices move, so the final provider screen remains the one that matters.</p>
              <div><Link href="/editorial-policy">Editorial policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link><Link href="/methodology">Rate methodology</Link></div>
            </aside>
          </article>

          <aside className="review-side-rail">
            <div><span className="kicker">PRICE THE ROUTE</span><p>Put {review.name} beside every company captured for the same sending amount.</p><Link href="/#corridors">Choose the transfer →</Link></div>
            <div><span className="kicker">CUSTOMER FEEDBACK</span><p>Read what customers praise and question, then compare the service with another company.</p><a href="#customer-reviews">Read the customer evidence →</a></div>
            <div><span className="kicker">ABOUT THE RATING</span><p>{review.rating === null ? "No editorial score has been assigned. Read the source documents and check the provider’s quote for your transfer." : "The score covers the service. The price ranking starts again on every route."}</p><Link href="/reviews">Compare all company reviews →</Link></div>
          </aside>
        </div>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    </>
  );
}
