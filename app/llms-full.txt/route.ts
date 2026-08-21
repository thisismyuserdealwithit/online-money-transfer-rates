import { corridors } from "@/lib/data";
import { bankDetailsProfiles } from "@/lib/bank-details";
import { guides } from "@/lib/guides";
import { providerReviews } from "@/lib/reviews";
import { siteUrl } from "@/lib/seo";

export function GET() {
  const corridorLinks = corridors
    .map(
      (corridor) =>
        `- [${corridor.fromCountry} to ${corridor.toCountry}](${siteUrl}/${corridor.slug}/): ${corridor.fromCurrency} to ${corridor.toCurrency} rate comparison and dated evidence.`,
    )
    .join("\n");
  const guideLinks = guides
    .map(
      (guide) =>
        `- [${guide.title}](${siteUrl}/guides/${guide.slug}): ${guide.description}`,
    )
    .join("\n");
  const reviewLinks = providerReviews
    .map(
      (review) =>
        `- [${review.name} rate review](${siteUrl}/reviews/${review.slug}): ${review.verdict}`,
    )
    .join("\n");
  const bankDetailLinks = bankDetailsProfiles
    .map(
      (profile) =>
        `- [Bank details for ${profile.country}](${siteUrl}/bank-details/${profile.slug}/): ${profile.accountFormat}; local and SWIFT/BIC requirements with official source links.`,
    )
    .join("\n");

  const content = `# Online Money Transfer: full content index

OnlineMoneyTransfer.co.uk is published by Finofin Limited. Its core dataset compares public money transfer prices using the same sending amount and payment route. A verified quote must show the source amount, recipient amount and visible fee on a provider-controlled journey. Indicative evidence is retained but cannot win the price ranking. Previous captures remain in the history.

Canonical origin: ${siteUrl}

## Comparison and citation rules

- A current standard comparison uses one corridor case: the same sending amount, currencies, bank-transfer funding, bank-deposit payout and freshness window.
- Only fresh, verified, non-promotional evidence that matches that case may win a price ranking.
- Indicative, stale, cash-payout, promotional and mismatched-amount evidence remains available as historical or contextual evidence but is not directly ranked.
- When citing a rate, include the provider, corridor, sending amount, recipient amount, funding and payout methods, fee, fee currency and UTC timestamp.
- Receipt pages expose these fields in crawlable HTML. A historical receipt is evidence of a past capture, not a current quote.

## Corridor comparisons

${corridorLinks}

## Guides

${guideLinks}

## Company reviews

${reviewLinks}

## SWIFT, BIC and recipient bank details

- [SWIFT code guide](${siteUrl}/swift-codes): ISO 9362 structure, limits and country index.
- [BIC format checker](${siteUrl}/bic-codes): Client-side structure and country-character check.

${bankDetailLinks}

## Research and policy

- [Research desk](${siteUrl}/research)
- [UK Remittance Cost Divide](${siteUrl}/research/uk-remittance-vulnerability-index)
- [The Last Mile Tax](${siteUrl}/research/last-mile-tax)
- [Methodology](${siteUrl}/methodology)
- [Coverage ledger](${siteUrl}/coverage)
- [Editorial policy](${siteUrl}/editorial-policy)
- [Affiliate disclosure](${siteUrl}/affiliate-disclosure)
- [About the publisher](${siteUrl}/about)

## Reuse

The public API and JavaScript widget may be used without charge when the rates have a visible, clickable attribution to the matching OnlineMoneyTransfer.co.uk corridor. Receipt images remain hosted on this site. Check the timestamp because exchange rates can change after capture.
`;

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
