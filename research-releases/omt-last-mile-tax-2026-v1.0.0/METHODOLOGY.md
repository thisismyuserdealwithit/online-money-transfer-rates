# Methodology and limits

## Price basket

The World Bank observed United Kingdom source baskets of £120 and £300 in the Q3 2025 Remittance Prices Worldwide release. Online Money Transfer linearly interpolated the monetary cost between those two observations to create an explicitly labelled £200 scenario.

## Corridor table

The corridor table combines the price study with dated country context from World Bank datasets. A service observation is a firm, product, funding, and payout combination. It is not a customer transaction. Averages are not weighted by provider market share or transaction volume.

The reusable release omits the API's `internet_use_pct` and `internet_use_year` fields pending separate clearance of the underlying ITU-origin indicator. No value is imputed in their place.

## Matched offers

The matched table compares cash and account payout only where corridor, provider, funding instrument, and speed match under the study's strict rule. The cash premium is the observed customer price difference. It is not a measure of provider profit or internal cost.

## Interpretation

- A national indicator provides context, not a causal explanation for a corridor price.
- Cash availability may be essential for recipients without practical account access.
- Missing values remain missing.
- The study is a dated snapshot and should not be used as a current consumer quote.

## Source update labels

The application fixture records price data for Q3 2025, a data edition dated 22 July 2026, World Bank indicator refreshes dated 13 July 2026, and governance indicator refreshes dated 18 March 2026. The RPW complete dataset cited by the study was updated 5 May 2026.
