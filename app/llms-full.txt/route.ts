import { corridors } from "@/lib/data";
import { bankDetailsProfiles } from "@/lib/bank-details";
import { guides } from "@/lib/guides";
import { providerReviews } from "@/lib/reviews";
import { siteUrl } from "@/lib/seo";

export function GET() {
  const corridorLinks = corridors
    .map(
      (corridor) =>
        `- [${corridor.fromCountry} to ${corridor.toCountry}](${siteUrl}/${corridor.slug}): ${corridor.fromCurrency} to ${corridor.toCurrency} rate comparison and dated evidence.`,
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
        `- [Bank details for ${profile.country}](${siteUrl}/bank-details/${profile.slug}): ${profile.accountFormat}; local and SWIFT/BIC requirements with official source links.`,
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
- Website current comparisons use UTC-today evidence. The rates API uses its documented 36-hour window. generatedAt describes the response, while capturedAt dates the quote.
- HTTP 503 with available:false means stored rates could not be loaded; a successful empty response is available:true. priceRank compares only eligible observed offers, ties share rank, and rankedRateCount gives the comparison size. Array position is not price rank.

## Corridor comparisons

${corridorLinks}

## Guides

${guideLinks}

## Company reviews and customer evidence

- [Compare two companies](${siteUrl}/compare): Price terms, delivery, access and dated customer evidence. Source review scores are separate from editorial ratings; whole-company, parent-company and transfer-service samples are not interchangeable.

${reviewLinks}

## SWIFT, BIC and recipient bank details

- [SWIFT code guide](${siteUrl}/swift-codes): ISO 9362 structure, limits and country index.
- [BIC format checker](${siteUrl}/bic-codes): Client-side structure and country-character check.

${bankDetailLinks}

## Research and policy

- [Research desk](${siteUrl}/research)
- [UK Remittance Cost Divide](${siteUrl}/research/uk-remittance-vulnerability-index)
- [The Last Mile Tax](${siteUrl}/research/last-mile-tax)
- [Weekly observed transfer costs](${siteUrl}/research/weekly-transfer-costs): Completed UTC weeks for five GBP 200 UK routes. Offer gaps use at least two comparable bank-to-bank quotes within one hour, not a mid-market benchmark.
- [Cost Divide citation and immutable releases](${siteUrl}/research/uk-remittance-vulnerability-index#cite-this-study)
- [Last Mile citation and immutable releases](${siteUrl}/research/last-mile-tax#cite-this-study)
- [Cost Divide data](${siteUrl}/api/research/vulnerability-index)
- [Last Mile data](${siteUrl}/api/research/last-mile-tax)
- [Weekly report data](${siteUrl}/api/research/weekly-transfer-costs)

The two World Bank price studies use Q3 2025 observations. Their official GBP 120 and GBP 300 source baskets must not be confused with Last Mile’s interpolated GBP 200 estimates or current provider quotes. Versioned research releases preserve their own snapshot date; underlying source rights remain in force.
- [Methodology](${siteUrl}/methodology)
- [Coverage ledger](${siteUrl}/coverage)
- [Editorial policy](${siteUrl}/editorial-policy)
- [Affiliate disclosure](${siteUrl}/affiliate-disclosure)
- [About the publisher](${siteUrl}/about)

## Reuse

The public API and JavaScript widget may be used without charge when the rates have a visible, clickable attribution to the matching OnlineMoneyTransfer.co.uk corridor. Receipt images remain hosted on this site. Check the timestamp because exchange rates can change after capture.

- [API integration guide](${siteUrl}/api)
- [API use terms](${siteUrl}/api/terms)
- [Valid corridor routes](${siteUrl}/api/v1/corridors)
- [OpenAPI definition](${siteUrl}/openapi.json)
- [APIs.json index](${siteUrl}/apis.json)
- [RFC 9727 API catalog](${siteUrl}/.well-known/api-catalog)
`;

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
