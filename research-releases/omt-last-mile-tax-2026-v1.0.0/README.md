# The Last Mile Tax 2026 data release

Version 1.0.0, snapshot captured 23 August 2026.

This release contains the dated data tables behind Online Money Transfer's study of cash collection costs on United Kingdom outbound remittance corridors. It is a research dataset, not a live quote service or a provider ranking.

## Files

- `data/corridor-summary.csv`: 33 destination corridors and 33 fields. The two internet-use fields in the live API export are deliberately omitted from this release because the underlying indicator originates with the International Telecommunication Union and its downstream reuse terms require separate review.
- `data/matched-offers.csv`: 17 strict same-provider, same-corridor, same-funding, same-speed cash-versus-account comparisons.
- `METHODOLOGY.md`: the calculation and evidence boundaries.
- `RIGHTS-AND-ATTRIBUTION.md`: licences, attribution, and excluded material.
- `LICENSE.md`: licence summary for this release.
- `CHANGELOG.md`: version history.
- `CITATION.cff`: machine-readable citation metadata.
- `SHA256SUMS`: file integrity manifest.

## Scope

The source study analysed 791 transparent service observations across 33 United Kingdom outbound corridors in the World Bank Remittance Prices Worldwide Q3 2025 release. The £200 scenario is a linear interpolation of monetary cost between the World Bank's observed £120 and £300 United Kingdom baskets. It is not a price quoted by the World Bank at £200.

The release does not contain customer transaction volumes, provider profits, bilateral remittance flows, screenshots, personal data, or a universal provider score.

## Canonical publication

- Study: https://onlinemoneytransfer.co.uk/research/last-mile-tax
- Public CSV API: https://onlinemoneytransfer.co.uk/api/research/last-mile-tax/csv
- Matched-offer CSV API: https://onlinemoneytransfer.co.uk/api/research/last-mile-tax/matched-offers/csv
- Publisher: https://finofin.com/

## Provenance

The release was exported from the public API on 23 August 2026. The inspected application source was `thisismyuserdealwithit/online-money-transfer-rates` at commit `3755f7d6cb702f47e5f060b04240eadd85f520a8`. The production runtime is identified by the dated API snapshot rather than assumed to be byte-identical to that repository commit.

## Suggested citation

Online Money Transfer and Finofin Limited. 2026. *The Last Mile Tax 2026 data release*. Version 1.0.0. https://onlinemoneytransfer.co.uk/research/last-mile-tax
