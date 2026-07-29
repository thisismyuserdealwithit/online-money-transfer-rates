import { corridors } from "@/lib/data";
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

  const content = `# Online Money Transfer: full content index

OnlineMoneyTransfer.co.uk is published by Finofin Limited. Its core dataset compares public money transfer prices using the same sending amount and payment route. A verified quote must show the source amount, recipient amount and visible fee on a provider-controlled journey. Indicative evidence is retained but cannot win the price ranking. Previous captures remain in the history.

## Corridor comparisons

${corridorLinks}

## Guides

${guideLinks}

## Company reviews

${reviewLinks}

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
