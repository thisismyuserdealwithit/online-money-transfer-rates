import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorPanel } from "@/components/AuthorPanel";
import { BankDetailsChecker } from "@/components/BankDetailsChecker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { bankDetailsProfiles, getBankDetailsBySlug } from "@/lib/bank-details";
import { corridors } from "@/lib/data";
import { pageMetadata, siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return bankDetailsProfiles.map((profile) => ({ country: profile.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ country: string }> },
): Promise<Metadata> {
  const { country } = await params;
  const profile = getBankDetailsBySlug(country);
  if (!profile) return {};
  return pageMetadata({
    title: `Bank Details Needed to Send Money to ${profile.country}`,
    description: `Check the account, IBAN, local bank-code and SWIFT/BIC formats commonly requested when sending money to ${profile.country}.`,
    path: `/bank-details/${profile.slug}/`,
  });
}

export default async function CountryBankDetailsPage(
  { params }: { params: Promise<{ country: string }> },
) {
  const { country } = await params;
  const profile = getBankDetailsBySlug(country);
  if (!profile) notFound();

  const inboundCorridors = corridors.filter((corridor) => corridor.toCode === profile.countryCode);
  const outboundCorridors = corridors.filter((corridor) => corridor.fromCode === profile.countryCode);
  const relatedCorridors = [...inboundCorridors, ...outboundCorridors]
    .filter((corridor, index, array) => array.findIndex((item) => item.slug === corridor.slug) === index)
    .slice(0, 8);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "SWIFT codes", item: `${siteUrl}/swift-codes/` },
          { "@type": "ListItem", position: 3, name: `${profile.country} bank details`, item: `${siteUrl}/bank-details/${profile.slug}/` },
        ],
      },
      {
        "@type": "Dataset",
        name: `Bank-detail formats for transfers to ${profile.country}`,
        description: `Recipient account identifiers and format rules commonly requested for transfers to ${profile.country}.`,
        url: `${siteUrl}/bank-details/${profile.slug}/`,
        creator: { "@id": `${siteUrl}/#organisation` },
        dateModified: "2026-07-31",
        variableMeasured: profile.fields.map((item) => item.label),
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bank-country-hero">
          <div className="shell">
            <div className="crumbs"><Link href="/">Home</Link><span>›</span><Link href="/swift-codes/">SWIFT codes</Link><span>›</span><b>{profile.country}</b></div>
            <div className="bank-country-title">
              <div>
                <span className="country-code-mark">{profile.countryCode}</span>
                <span className="kicker">RECIPIENT BANK DETAILS</span>
                <h1>What details do you need to send money to {profile.country}?</h1>
                <p>Use this as a format checklist, then follow the exact fields shown by your chosen provider. Local {profile.currency} payout and a direct international wire can use different instructions.</p>
              </div>
              <aside><span>FORMAT DATA REVIEWED</span><strong>{profile.reviewedAt}</strong><small>Rules and official links can change</small></aside>
            </div>
          </div>
        </section>

        <section className="section shell bank-country-main">
          <div className="bank-country-summary">
            <article><span>Account identifier</span><strong>{profile.accountFormat}</strong></article>
            <article><span>Local bank identifier</span><strong>{profile.localCode?.format ?? (profile.iban ? "Encoded inside the IBAN" : "Bank-specific")}</strong></article>
            <article><span>SWIFT/BIC</span><strong>{profile.iban ? "Conditional" : "Common on direct wires"}</strong></article>
          </div>

          <section className="country-checker-section">
            <div>
              <span className="kicker">CHECK BEFORE COPYING</span>
              <h2>Catch a mistyped code in your browser</h2>
              <p>This checks the published structure and any available checksum. It does not query the recipient account or save what you enter.</p>
            </div>
            <BankDetailsChecker profile={profile} />
          </section>

          <section className="country-fields-section">
            <div className="section-heading"><div><span className="kicker">FIELD BY FIELD</span><h2>{profile.country} recipient checklist</h2><p>“Conditional” means the field depends on the provider, currency or payment rail.</p></div></div>
            <div className="country-fields-table">
              <div className="country-fields-head"><span>Detail</span><span>When</span><span>Format</span><span>What to check</span></div>
              {profile.fields.map((item) => (
                <div className="country-fields-row" key={`${item.label}-${item.status}`}>
                  <strong>{item.label}</strong>
                  <span className={`field-status status-${item.status}`}>{item.status}</span>
                  <b>{item.format}</b>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="country-route-note">
            <div><span className="kicker">LOCAL PAYOUT OR DIRECT WIRE?</span><h2>The same destination can ask for different details</h2></div>
            <p>{profile.bicUse}</p>
          </section>

          <section className="country-safety-grid">
            <article><b>1</b><strong>Get the details from the recipient</strong><p>Prefer their banking screen, official statement or bank-issued incoming-payment instructions.</p></article>
            <article><b>2</b><strong>Check the institution separately</strong><p>Use the official source links below. A passing format is not an institution match.</p></article>
            <article><b>3</b><strong>Reconfirm any change</strong><p>Call through a trusted number, not contact details contained in the payment-change message.</p></article>
          </section>

          <aside className="country-warning"><strong>Where this check stops</strong><p>{profile.warning} Online Money Transfer cannot confirm account ownership or say that a payment is safe.</p></aside>

          {relatedCorridors.length ? (
            <section className="country-related">
              <div className="section-heading"><div><span className="kicker">LIVE RATE PAGES</span><h2>Compare transfers linked to {profile.country}</h2><p>Once the details are confirmed, compare what the recipient gets and open the proof behind each quote.</p></div></div>
              <div>
                {relatedCorridors.map((corridor) => (
                  <Link href={`/${corridor.slug}/`} key={corridor.slug}>
                    <span>{corridor.fromCode} → {corridor.toCode}</span>
                    <strong>{corridor.fromCountry} to {corridor.toCountry}</strong>
                    <small>{corridor.fromCurrency} to {corridor.toCurrency} rates</small>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="country-sources">
            <span className="kicker">OFFICIAL CHECKS</span>
            <h2>Sources for {profile.country}</h2>
            <p>Use these for the institution, branch or national format. A directory result still does not identify the recipient account.</p>
            <ol>
              {profile.sources.map((source) => (
                <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>
              ))}
            </ol>
          </section>

          <AuthorPanel label="REVIEWED BY" />
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </>
  );
}
