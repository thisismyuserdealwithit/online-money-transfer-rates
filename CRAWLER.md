# Daily rate checker

The public site stores structured quote records in D1 on Sites or Postgres on Render. Immutable screenshots use R2 on Sites. On Render they use a configured S3-compatible bucket, with Postgres as the initial fallback. A separate scheduled browser process visits public provider calculators and posts validated captures to `/api/ingest`.

## Current provider adapters

- Wise: verified only when the public page exposes both recipient amount and transfer fee. Otherwise stored as indicative.
- Revolut: stored as indicative because plan usage, timing and transfer fees can change the final customer result.
- CurrencyFair: stored as verified on supported currencies because its public widget shows recipient amount, customer rate and included fee.
- Xe: stored as an indicative mid-market reference. Xe states that its converter rate is not the rate customers receive.
- TransferGo: stored only when its public response contains an available bank funded, bank deposit option. The crawler checks eligible alternatives when the provider defaults to a card, wallet or payment link. Promotional routes remain indicative.
- SingX: monitored for Singapore outbound routes. Its public quote is indicative because the displayed fee is added to the transfer amount.
- Remitly: first customer rates are stored as promotional and indicative. They never enter the standard winner calculation.
- Instarem: monitored on UK outbound routes through its public bank transfer API and matching calculator. Anonymous first transfer rates are stored as promotional and indicative.
- Ria Money Transfer: monitored where its public calculator offers bank account funding and bank deposit delivery. Its anonymous first transfer rate is labelled and excluded from the standard winner.
- Wise comparison service: provides an hourly second evidence layer for banks and transfer companies returned for the exact amount, currencies and countries. Wise describes non-Wise rows as estimates based on quotes gathered from provider websites. These records are always indicative, show the Wise API response as proof and cannot win against a direct verified quote.
- Xe: records its timestamped public mid-market converter data for every supported currency pair. It is an indicative market reference, not a transferable quote; no customer fee or delivery availability is inferred.

The corridor register contains 21 routes from the UK, the same 21 routes to the UK, and 10 major non-UK directions covering EUR/USD, USD/CAD, AUD/NZD, USD/AUD and EUR/CHF. The public `/coverage` ledger reads the quote archive and latest crawl runs directly so an empty corridor cannot be mistaken for a completed check.

The public comparison also lists WorldRemit, ACE Money Transfer, Profee, Xoom and OrbitRemit. They remain visibly unavailable until a repeatable public bank funded quote and proof image can be captured. A provider name is never treated as a quote.

WorldRemit currently introduces a human verification step, ACE and OrbitRemit block the crawler, Xoom routes the quote through PayPal, and Profee has not yet exposed a reproducible bank funded public quote. These providers stay in the research queue and cannot win a corridor while unavailable.

## Schedule

The included GitHub Actions workflow runs at 05:17 UTC every day and can also be started manually. Set repository secrets `INGEST_ENDPOINT` and `INGEST_TOKEN`. The ingest token must match the runtime secret on Render or Sites. Add `SITES_BYPASS_TOKEN` only while posting to an owner-protected Sites URL; Render does not use it.

For a focused manual run, set `CORRIDOR_FILTER` and/or `PROVIDER_FILTER` to comma-separated slugs before starting the crawler.
When one public comparison response contains several providers, the ingest stores its proof image once and links every provider row to that immutable object.

## Publishing rules

1. A verified result needs source amount, recipient amount, fee and a provider screenshot. A provider controlled public quote response may be used when it contains the same fields.
2. Indicative converter results are published below verified results and cannot be named cheapest.
3. A failed run does not replace the most recent successful record.
4. Screenshots are immutable. Corrections create a new record.
5. First customer rates, card funding, cash pickup, wallets and business quotes are separate comparison cases.
6. A Wise comparison estimate is useful coverage, but remains indicative even when its underlying provider is a bank or transfer company.
7. A route that the provider's own public response marks unavailable is reported as unsupported, not as a crawler failure. It cannot replace an earlier successful quote.
