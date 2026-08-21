import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCorridor, money } from "@/lib/data";
import { getGuide, guideWordCount, guides } from "@/lib/guides";
import { getLatestQuotes } from "@/lib/live-data";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: "article",
    publishedTime: "2026-07-22",
    modifiedTime: "2026-07-29",
    authors: ["Russell Gous"],
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = guides
    .filter((item) => item.slug !== guide.slug)
    .sort((a, b) => Number(b.series === guide.series) - Number(a.series === guide.series))
    .slice(0, 3);
  const liveComparisons = guide.liveComparison
    ? await Promise.all(guide.liveComparison.slugs.map(async (corridorSlug) => {
        const corridor = getCorridor(corridorSlug);
        if (!corridor) return null;
        const quotes = (await getLatestQuotes(corridorSlug))
          .filter((quote) => quote.eligibleForPriceRanking)
          .sort((a, b) => {
            if (a.provider === "Xe") return -1;
            if (b.provider === "Xe") return 1;
            return b.recipientGets - a.recipientGets;
          });
        return { corridor, quotes, sourceAmount: quotes[0]?.sourceAmount ?? corridor.testAmount };
      }))
    : [];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: "2026-07-22",
    dateModified: "2026-07-23",
    wordCount: guideWordCount(guide),
    mainEntityOfPage: `https://onlinemoneytransfer.co.uk/guides/${guide.slug}`,
    author: {
      "@type": "Person",
      name: "Russell Gous",
      url: "https://onlinemoneytransfer.co.uk/authors/russell-gous",
    },
    reviewedBy: {
      "@type": "Person",
      name: "Alon Rajic",
      url: "https://onlinemoneytransfer.co.uk/authors/alon-rajic",
    },
    publisher: {
      "@type": "Organization",
      name: "Finofin Limited",
      url: "https://onlinemoneytransfer.co.uk/about",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://onlinemoneytransfer.co.uk" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://onlinemoneytransfer.co.uk/guides" },
      { "@type": "ListItem", position: 3, name: guide.shortTitle, item: `https://onlinemoneytransfer.co.uk/guides/${guide.slug}` },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <header className="guide-article-hero">
          <div className="shell guide-article-hero-grid">
            <div>
              <div className="guide-breadcrumbs"><Link href="/">Home</Link><span>›</span><Link href="/guides">Guides</Link><span>›</span><b>{guide.shortTitle}</b></div>
              <span className="kicker">{guide.series ? guide.series.toUpperCase() : "MONEY TRANSFER GUIDE"}</span>
              <h1>{guide.title}</h1>
              <p>{guide.standfirst}</p>
            </div>
            <aside className="guide-fact-card">
              <span>OUR ANSWER</span>
              <strong>{guide.keyPoint}</strong>
              <dl>
                <div><dt>Written by</dt><dd><Link href="/authors/russell-gous">Russell Gous</Link></dd></div>
                <div><dt>Reviewed by</dt><dd><Link href="/authors/alon-rajic">Alon Rajic</Link></dd></div>
                <div><dt>Updated</dt><dd>{guide.reviewed}</dd></div>
                <div><dt>Length</dt><dd>{guide.readTime}</dd></div>
              </dl>
            </aside>
          </div>
        </header>

        <div className="shell guide-article-layout">
          <article className="guide-article-body">
            {guide.liveComparison && (
              <aside className="guide-live-comparison" aria-label={guide.liveComparison.title}>
                <header>
                  <span>{guide.liveComparison.label}</span>
                  <div><h2>{guide.liveComparison.title}</h2><p>{guide.liveComparison.intro}</p></div>
                </header>
                <div className="guide-live-grid">
                  {liveComparisons.filter((item): item is NonNullable<typeof item> => item !== null).map(({ corridor, quotes, sourceAmount }) => (
                    <section key={corridor.slug}>
                      <div className="guide-live-route">
                        <span>{corridor.fromCode} → {corridor.toCode}</span>
                        <div><strong>{corridor.fromCountry} to {corridor.toCountry}</strong><small>{money(sourceAmount, corridor.fromCurrency)} · bank transfer</small></div>
                      </div>
                      {quotes.length ? (
                        <div className="guide-live-quotes">
                          {quotes.slice(0, 3).map((quote) => (
                            <div key={quote.provider}>
                              <span><b>{quote.provider}</b>{quote.provider === "Xe" && <em>Best Rated</em>}<small>Fee {money(quote.fee, quote.feeCurrency ?? corridor.fromCurrency)}</small></span>
                              <strong>{money(quote.recipientGets, corridor.toCurrency)}</strong>
                          <Link href={`/${corridor.slug}/receipts/${encodeURIComponent(quote.proofId)}`}>Receipt</Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="guide-live-pending">No completed public quote is current right now. The route remains open, including the providers that failed, until the next usable receipt arrives.</p>
                      )}
                      <Link className="guide-live-open" href={`/${corridor.slug}/`}>See the full rate check →</Link>
                    </section>
                  ))}
                </div>
                <p className="guide-live-note">{guide.liveComparison.note}</p>
              </aside>
            )}

            {guide.providerBlock && (
              <aside className="guide-provider-block" aria-label={guide.providerBlock.title}>
                <header><span>{guide.providerBlock.label}</span><div><h2>{guide.providerBlock.title}</h2><p>{guide.providerBlock.intro}</p></div></header>
                <div className="guide-provider-grid">
                  {guide.providerBlock.items.map((item) => (
                    <section className={item.tone === "warning" ? "guide-provider-warning" : ""} key={item.name}>
                      <div className="guide-provider-name"><span>{item.category}</span><h3>{item.name}</h3></div>
                      <p>{item.verdict}</p>
                      <dl>{item.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
                      {item.providerSlug ? (
                        <a href={`/go/${item.providerSlug}?placement=guide-profile`} rel="sponsored nofollow">Price the transfer with {item.name} →</a>
                      ) : item.linkHref ? (
                        item.linkHref.startsWith("/")
                          ? <Link href={item.linkHref}>{item.linkLabel ?? "Read more"} →</Link>
                          : <a href={item.linkHref}>{item.linkLabel ?? "Read more"} →</a>
                      ) : null}
                    </section>
                  ))}
                </div>
                <p className="guide-provider-note">{guide.providerBlock.note}</p>
              </aside>
            )}

            {guide.flow && (
              <aside className="guide-technical-visual" aria-label={guide.flow.title}>
                <header><span>{guide.flow.label}</span><h2>{guide.flow.title}</h2></header>
                <div className="guide-flow">
                  {guide.flow.steps.map((step, index) => (
                    <div key={step.title}><b>{String(index + 1).padStart(2, "0")}</b><strong>{step.title}</strong><p>{step.detail}</p></div>
                  ))}
                </div>
                <p className="guide-visual-note">{guide.flow.note}</p>
              </aside>
            )}

            {guide.comparison && (
              <aside className="guide-technical-visual guide-comparison" aria-label={guide.comparison.title}>
                <header><span>{guide.comparison.label}</span><h2>{guide.comparison.title}</h2></header>
                <div className="guide-comparison-scroll">
                  <table>
                    <thead><tr>{guide.comparison.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                    <tbody>{guide.comparison.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                <p className="guide-visual-note">{guide.comparison.note}</p>
              </aside>
            )}

            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}

            {guide.nextSteps && (
              <section className="guide-next-steps" aria-label={guide.nextSteps.title}>
                <span className="kicker">{guide.nextSteps.label}</span>
                <h2>{guide.nextSteps.title}</h2>
                <div>
                  {guide.nextSteps.items.map((item) => (
                    <Link href={item.href} key={item.href}>
                      <span>{item.eyebrow}</span><strong>{item.title}</strong><p>{item.description}</p><b>Open →</b>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <aside className="guide-decision-note">
              <span>WHERE THIS GUIDE STOPS</span>
              <p>{guide.series ? "Payment companies do not publish every private bank connection or routing rule, and those arrangements change. Use this guide to understand the machinery, then check the current provider documents for the payment in front of you." : "This is general information rather than personal financial advice, and it is not an invitation to speculate on sterling. Read the current provider terms and recheck the final recipient amount before committing money."}</p>
            </aside>

            <section className="guide-sources" aria-labelledby="guide-sources-heading">
              <span className="kicker">THE PAPER TRAIL</span>
              <h2 id="guide-sources-heading">Documents checked for this guide</h2>
              <p>Regulator and central-bank material carries the factual spine. A provider page describes that company&apos;s own terms; it does not become an endorsement because we cite it.</p>
              <ol>
                {guide.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url}>{source.label}</a>
                    <span>{source.publisher}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="guide-byline-card">
              <span className="author-avatar">RG</span>
              <div>
                <span className="kicker">THE WRITER</span>
                <h2>Russell Gous</h2>
                <p>Russell writes about UK banking and foreign exchange after working at Barclays Corporate Banking and WorldFirst. Alon Rajic checked the evidence and the line between editorial judgment and commercial links.</p>
                <div><Link href="/authors/russell-gous">Russell&apos;s profile</Link><Link href="/editorial-policy">Editorial policy</Link></div>
              </div>
            </section>
          </article>

          <aside className="guide-side-rail">
            <span className="kicker">RELATED GUIDES</span>
            {related.map((item) => (
              <Link href={`/guides/${item.slug}`} key={item.slug}>
                <strong>{item.shortTitle}</strong>
                <span>{item.readTime} →</span>
              </Link>
            ))}
            <div>
              <strong>Put a real route through the test</strong>
              <p>Compare current recipient amounts and open the dated receipt behind each result.</p>
              <Link href="/#corridors">Choose a route →</Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    </>
  );
}
