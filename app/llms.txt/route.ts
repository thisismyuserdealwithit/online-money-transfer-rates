import { siteUrl } from "@/lib/seo";

const content = `# Online Money Transfer

> Independent UK money transfer rate comparisons. We test public provider journeys, record the rate, fee and recipient amount, and retain dated screenshot evidence.

## Main sections

- [Current corridor comparisons](${siteUrl}/#corridors): Choose a sending and receiving country.
- [Today's checking coverage](${siteUrl}/coverage): Live route coverage and recent crawler runs.
- [Company reviews and customer feedback](${siteUrl}/reviews): Services, dated customer sources and current corridor evidence. Whole-company feedback is labelled separately from transfer-service feedback.
- [Compare companies](${siteUrl}/compare): Side-by-side price terms, delivery, access and customer evidence; no automatic winner from mixed review scopes.
- [Original research](${siteUrl}/research): UK remittance cost and financial access studies.
- [Money transfer guides](${siteUrl}/guides): Rates, brokers, hedging and payment infrastructure.
- [SWIFT and destination bank details](${siteUrl}/swift-codes): BIC structure and country-specific recipient-detail checklists.
- [BIC format checker](${siteUrl}/bic-codes): Private browser check for 8 or 11-character BIC structure and country characters.
- [Comparison methodology](${siteUrl}/methodology): Rules for verified, indicative and stale evidence.
- [Free rates API](${siteUrl}/api): JSON and JavaScript access with visible attribution.

## Key research

- [Why UK transfers to poorer countries cost 72% more](${siteUrl}/research/uk-remittance-vulnerability-index)
- [The cost of cash remittances](${siteUrl}/research/last-mile-tax)
- [Weekly observed transfer costs](${siteUrl}/research/weekly-transfer-costs): Dated completed-week evidence for five GBP 200 UK routes, not current offers.

## Comparison rules

- Only a fresh, verified, non-promotional bank-transfer to bank-deposit quote can win a standard table.
- The sending amount, source and recipient currencies, funding method, payout method and timestamp must match the corridor case.
- Indicative, stale, cash-payout and promotional evidence remains visible but is not ranked.
- Receipt pages separate the latest comparable result from historical captures.
- Website price comparisons use the current UTC day. The rates API retains its documented 36-hour window; request generation time is not quote capture time.
- Rates API availability, priceRank and rankedRateCount distinguish an unavailable store, an empty result and a comparison among observed eligible offers. Array order is not price order.
- Customer-source scores and counts retain the source, scope and checked date. They are separate from OMT editorial ratings.

## Publishing and attribution

- Publisher: Finofin Limited
- Editorial team: Alon Rajic and Russell Gous
- Live quotes can move after capture. Use the time and receipt attached to each figure.
- API reuse is free when the matching rate table clearly links back to OnlineMoneyTransfer.co.uk.

## Machine-readable resources

- [Full LLM index](${siteUrl}/llms-full.txt)
- [XML sitemap](${siteUrl}/sitemap.xml)
- [Robots policy](${siteUrl}/robots.txt)
- [Rates API documentation](${siteUrl}/api)
- [API route catalogue](${siteUrl}/api/v1/corridors)
- [OpenAPI 3.1 definition](${siteUrl}/openapi.json)
- [API use terms](${siteUrl}/api/terms)
- [Cost Divide research JSON](${siteUrl}/api/research/vulnerability-index)
- [Last Mile research JSON](${siteUrl}/api/research/last-mile-tax)
- [Weekly evidence JSON and CSV](${siteUrl}/api/research/weekly-transfer-costs)
- [Cite the Cost Divide study](${siteUrl}/research/uk-remittance-vulnerability-index#cite-this-study)
- [Cite the Last Mile study](${siteUrl}/research/last-mile-tax#cite-this-study)
`;

export function GET() {
  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
