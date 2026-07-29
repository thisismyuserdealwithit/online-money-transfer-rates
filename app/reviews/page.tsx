import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProviderCoverage } from "@/lib/live-data";
import { providerReviews, reviewsUpdated } from "@/lib/reviews";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Money Transfer Company Rate Reviews and Live Comparisons",
  description: "Compare Wise, Xe, Revolut, CurrencyFair, UK banks and other transfer services through current rate evidence, fees and dated provider receipts.",
  path: "/reviews",
});

const categoryOrder = ["Transfer specialist", "Cash network", "Digital account", "Bank"] as const;

function dateLabel(value: string | null | undefined) {
  if (!value) return "Awaiting a public capture";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

export default async function ReviewsPage() {
  const coverage = await getProviderCoverage();
  const bySlug = new Map(coverage.map((item) => [item.providerSlug, item]));
  const captured = coverage.reduce((total, item) => total + item.corridorCount, 0);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="reviews-hero">
          <div className="shell reviews-hero-grid">
            <div>
              <span className="kicker">COMPANY RATE REVIEWS</span>
              <h1>A pleasant app does not rescue an expensive exchange rate</h1>
              <p>We begin with what the recipient gets, because that is where a “fee-free” claim either survives or falls apart. The review then covers delivery, service and the bits of the price a public calculator does not reveal.</p>
            </div>
            <aside>
              <span>LIVE REVIEW COVERAGE</span>
              <strong>{providerReviews.length}</strong>
              <p>companies examined</p>
              <div><b>{captured}</b><small>current provider records</small></div>
              <div><b>£200</b><small>usual UK comparison amount</small></div>
            </aside>
          </div>
        </section>

        <section className="section shell reviews-method-strip" aria-label="Review method">
          <article><b>01</b><strong>Count what leaves the rate</strong><p>A separate fee and a poorer exchange rate both reduce the money delivered. The label does not matter much to the recipient.</p></article>
          <article><b>02</b><strong>Make the quote prove itself</strong><p>A public converter is useful context. It cannot outrank a completed transfer journey with the same amount.</p></article>
          <article><b>03</b><strong>Price is not the entire service</strong><p>Cash access or human help may justify paying more. We say where the trade-off looks sensible and where it looks a bit steep.</p></article>
        </section>

        <section className="section shell reviews-directory">
          {categoryOrder.map((category) => {
            const items = providerReviews.filter((review) => review.category === category);
            return (
              <section className="review-category" key={category}>
                <div className="section-heading">
                  <div>
                    <span className="kicker">{category.toUpperCase()}</span>
                    <h2>{category === "Bank" ? "UK bank transfer reviews" : `${category} reviews`}</h2>
                  </div>
                  <span>{items.length} companies</span>
                </div>
                <div className="review-card-grid">
                  {items.map((review) => {
                    const live = bySlug.get(review.slug);
                    return (
                      <Link href={`/reviews/${review.slug}`} className="review-card" key={review.slug}>
                        <header>
                          <span className={`provider-mark mark-${review.slug}`}>{review.mark}</span>
                          <div><h3>{review.name}</h3><span className="review-score">{review.rating.toFixed(1)} <small>/ 5 editorial rating</small></span></div>
                        </header>
                        <p>{review.verdict}</p>
                        <dl>
                          <div><dt>Rate evidence</dt><dd>{live ? `${live.corridorCount} corridors` : "No fresh capture"}</dd></div>
                          <div><dt>Verified quotes</dt><dd>{live?.verifiedCount ?? 0}</dd></div>
                          <div><dt>Last checked</dt><dd>{dateLabel(live?.latestCapturedAt)}</dd></div>
                        </dl>
                        <strong>See how the price holds up →</strong>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <aside className="reviews-editorial-note">
            <span className="kicker">READING THE SCORE</span>
            <h2>A good company can still quote a poor rate</h2>
            <p>The editorial score reflects how the service works for its intended customer, including its reach and support. The price winner is calculated afresh for each route. A polished provider with a high rating does not receive a free pass in the live table.</p>
            <div><Link href="/methodology">See how a quote qualifies</Link><Link href="/coverage">Check the latest collection</Link></div>
          </aside>
          <AuthorPanel label={`REVIEWS UPDATED ${reviewsUpdated.toUpperCase()}`} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
