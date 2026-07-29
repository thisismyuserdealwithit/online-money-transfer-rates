import { siteUrl } from "@/lib/seo";

const content = `# Online Money Transfer

> Independent UK money transfer rate comparisons. We test public provider journeys, record the rate, fee and recipient amount, and retain dated screenshot evidence.

## Main sections

- [Current corridor comparisons](${siteUrl}/#corridors): Choose a sending and receiving country.
- [Today's checking coverage](${siteUrl}/coverage): Live route coverage and recent crawler runs.
- [Company rate reviews](${siteUrl}/reviews): Provider services assessed against current corridor evidence.
- [Original research](${siteUrl}/research): UK remittance cost and financial access studies.
- [Money transfer guides](${siteUrl}/guides): Rates, brokers, hedging and payment infrastructure.
- [Comparison methodology](${siteUrl}/methodology): Rules for verified, indicative and stale evidence.
- [Free rates API](${siteUrl}/api): JSON and JavaScript access with visible attribution.

## Key research

- [Why UK transfers to poorer countries cost 72% more](${siteUrl}/research/uk-remittance-vulnerability-index)
- [The cost of cash remittances](${siteUrl}/research/last-mile-tax)

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
`;

export function GET() {
  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
