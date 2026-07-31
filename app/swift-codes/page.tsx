import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { bankDetailsProfiles } from "@/lib/bank-details";
import { pageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "SWIFT Codes for International Transfers",
  description: "Understand SWIFT codes, check the bank-country characters and find the account details required for every destination covered by Online Money Transfer.",
  path: "/swift-codes/",
});

const facts = [
  ["8", "characters in the main BIC"],
  ["11", "characters when a branch is included"],
  ["2", "letters identifying the institution country"],
];

export default function SwiftCodesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "SWIFT codes", item: `${siteUrl}/swift-codes/` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is a SWIFT code the same as a BIC?",
            acceptedAnswer: { "@type": "Answer", text: "People commonly use the terms interchangeably. BIC is the ISO 9362 identifier. SWIFT is the financial messaging network and the registration authority for BICs." },
          },
          {
            "@type": "Question",
            name: "Does a correctly formatted BIC prove the bank details are safe?",
            acceptedAnswer: { "@type": "Answer", text: "No. A format check cannot confirm the institution record, recipient, account ownership, account status or payment safety." },
          },
        ],
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="codes-hero">
          <div className="shell codes-hero-grid">
            <div>
              <div className="crumbs"><Link href="/">Home</Link><span>›</span><b>SWIFT codes</b></div>
              <span className="kicker">BANK ROUTING, EXPLAINED</span>
              <h1>SWIFT codes tell the payment where to look. They do not prove who owns the account.</h1>
              <p>A SWIFT code, commonly called a BIC, identifies a financial or non-financial institution in an international payment message. Check its structure here, then confirm the actual code with the recipient&apos;s bank.</p>
              <div className="codes-actions">
                <Link href="/bic-codes/#checker">Check a BIC</Link>
                <a href="https://www.swiftref.com/en/bicsearch" target="_blank" rel="noopener noreferrer">Open official SWIFT search ↗</a>
              </div>
            </div>
            <aside className="bic-anatomy" aria-label="BIC structure">
              <span>BIC STRUCTURE</span>
              <div><b>AAAA</b><b>GB</b><b>2L</b><b>XXX</b></div>
              <dl>
                <div><dt>AAAA</dt><dd>Business party</dd></div>
                <div><dt>GB</dt><dd>Country</dd></div>
                <div><dt>2L</dt><dd>Location</dd></div>
                <div><dt>XXX</dt><dd>Optional branch</dd></div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="section shell codes-main">
          <div className="codes-fact-strip">
            {facts.map(([number, label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}
          </div>

          <section className="codes-copy-grid">
            <div>
              <span className="kicker">WHAT IT CAN TELL YOU</span>
              <h2>Read the code before you copy it</h2>
              <p>The first four characters identify the business party. Characters five and six are the ISO country code. The next two identify the location. An optional final three identify a branch, department or service.</p>
              <p>An 8-character BIC can be written as an 11-character code ending in <code>XXX</code>, but you should not add a branch ending by guesswork. Use the code the receiving bank publishes for the selected currency and payment type.</p>
            </div>
            <div>
              <span className="kicker">WHAT IT CANNOT TELL YOU</span>
              <h2>A BIC is not an account check</h2>
              <p>A code can match the ISO format while still being mistyped, retired, unrelated to the recipient or unsuitable for that payment route. Some registered BICs are not connected to SWIFT at all.</p>
              <p>Online Money Transfer checks structure in your browser. The official SWIFT directory or the receiving bank is needed to identify the institution. Your bank or transfer provider must perform any account-name check.</p>
            </div>
          </section>

          <section className="codes-country-section">
            <div className="section-heading">
              <div><span className="kicker">DESTINATION CHECKLISTS</span><h2>What bank details does each country use?</h2><p>Choose the country where the recipient&apos;s account is held, not their nationality or current location.</p></div>
            </div>
            <div className="codes-country-grid">
              {bankDetailsProfiles.map((profile) => (
                <Link href={`/bank-details/${profile.slug}/`} key={profile.slug}>
                  <span>{profile.countryCode}</span>
                  <strong>{profile.country}</strong>
                  <small>{profile.accountFormat}</small>
                  <b>View checklist →</b>
                </Link>
              ))}
            </div>
          </section>

          <section className="codes-safety">
            <div><span className="kicker">THREE SEPARATE CHECKS</span><h2>Format, institution and recipient are not the same thing</h2></div>
            <ol>
              <li><b>01</b><div><strong>Check the structure</strong><p>Confirm the length, country characters and, for an IBAN, the MOD97 checksum.</p></div></li>
              <li><b>02</b><div><strong>Identify the institution</strong><p>Use SWIFT&apos;s official BIC search or the receiving bank&apos;s own payment instructions.</p></div></li>
              <li><b>03</b><div><strong>Confirm the recipient</strong><p>Reconfirm changed instructions using a phone number or contact route you already trust.</p></div></li>
            </ol>
          </section>

          <section className="codes-sources">
            <span className="kicker">PRIMARY SOURCES</span>
            <h2>Where these rules come from</h2>
            <p>Country IBAN lengths are drawn from SWIFT&apos;s IBAN Registry, release 102, published in June 2026. BIC structure follows ISO 9362 and SWIFT&apos;s current data-standard guidance.</p>
            <div>
              <a href="https://www.swift.com/standards/data-standards/bic-business-identifier-code" target="_blank" rel="noopener noreferrer">SWIFT BIC standard ↗</a>
              <a href="https://www.swift.com/standards/standards-resources" target="_blank" rel="noopener noreferrer">SWIFT IBAN Registry ↗</a>
              <Link href="/bic-codes/">Use the format checker →</Link>
            </div>
          </section>

          <AuthorPanel label="REVIEWED BY" />
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </>
  );
}
