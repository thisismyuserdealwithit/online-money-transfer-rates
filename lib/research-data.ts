export type RemittanceCountryInput = {
  corridorSlug: string;
  country: string;
  code: string;
  wdiCode: string;
  dependencyPct2019: number | null;
  dependencyPct2023: number | null;
  dependencyPct2024: number | null;
  remittancesReceivedUsd2024: number | null;
  growth2024Pct: number | null;
  cagr2019to2024Pct: number | null;
  remittancesToFdi2024: number | null;
};

export type RpwCorridorBenchmark = {
  period: "2025_3Q";
  services: number;
  firms: number;
  avgCost200Pct: number;
  medianCost200Pct: number;
  avgCost500Pct: number;
  servicesAtOrBelow5Pct: number;
  avgCost2015Q1Pct: number;
  changeSince2015Pp: number;
  changeSince2015Pct: number;
  changeSince2024Q3Pp: number;
  volatility2021to2025: number;
};

export type RpwUkCorridorCost = {
  code: string;
  country: string;
  income: "Low income" | "Lower middle income" | "Upper middle income" | "High income";
  services: number;
  firms: number;
  avgCost200Pct: number;
};

export type RpwProviderRouteCost = {
  code: string;
  country: string;
  services: number;
  avgTotalCost200Pct: number;
  avgFeeGbp: number;
  avgFxMarginPct: number;
  serviceMix: string;
};

export type RpwProviderCorridorComparison = {
  provider: string;
  lowest: RpwProviderRouteCost;
  highest: RpwProviderRouteCost;
  costMultiple: number;
};

/**
 * WDI annual observations were downloaded from the World Bank API on
 * 22 July 2026. The API source vintage was updated on 13 July 2026.
 */
export const remittanceCountryInputs: RemittanceCountryInput[] = [
  { corridorSlug: "uk-to-spain", country: "Spain", code: "ES", wdiCode: "ESP", dependencyPct2019: 0.22849, dependencyPct2023: 0.339088, dependencyPct2024: 0.366748, remittancesReceivedUsd2024: 6328874671.48, growth2024Pct: 15.249183, cagr2019to2024Pct: 14.564394, remittancesToFdi2024: 0.147944 },
  { corridorSlug: "uk-to-france", country: "France", code: "FR", wdiCode: "FRA", dependencyPct2019: 1.056406, dependencyPct2023: 1.200839, dependencyPct2024: 1.226897, remittancesReceivedUsd2024: 38775361344.03, growth2024Pct: 5.65308, cagr2019to2024Pct: 6.155394, remittancesToFdi2024: 0.744927 },
  { corridorSlug: "uk-to-germany", country: "Germany", code: "DE", wdiCode: "DEU", dependencyPct2019: 0.4631, dependencyPct2023: 0.469349, dependencyPct2024: 0.473111, remittancesReceivedUsd2024: 22168068237.92, growth2024Pct: 3.527883, cagr2019to2024Pct: 3.866108, remittancesToFdi2024: 0.353912 },
  { corridorSlug: "uk-to-ireland", country: "Ireland", code: "IE", wdiCode: "IRL", dependencyPct2019: 0.144074, dependencyPct2023: 0.100627, dependencyPct2024: 0.107758, remittancesReceivedUsd2024: 656414520.54, growth2024Pct: 14.972867, cagr2019to2024Pct: 2.271464, remittancesToFdi2024: 0.136217 },
  { corridorSlug: "uk-to-italy", country: "Italy", code: "IT", wdiCode: "ITA", dependencyPct2019: 0.517849, dependencyPct2023: 0.513182, dependencyPct2024: 0.509435, remittancesReceivedUsd2024: 12142048872.13, growth2024Pct: 2.121347, cagr2019to2024Pct: 3.030162, remittancesToFdi2024: 0.425866 },
  { corridorSlug: "uk-to-netherlands", country: "Netherlands", code: "NL", wdiCode: "NLD", dependencyPct2019: 0.395464, dependencyPct2023: 0.376317, dependencyPct2024: 0.388768, remittancesReceivedUsd2024: 4719400104.53, growth2024Pct: 10.447174, cagr2019to2024Pct: 5.138507, remittancesToFdi2024: null },
  { corridorSlug: "uk-to-portugal", country: "Portugal", code: "PT", wdiCode: "PRT", dependencyPct2019: 0.349032, dependencyPct2023: 0.593684, dependencyPct2024: 0.587155, remittancesReceivedUsd2024: 1841653246.18, growth2024Pct: 6.117779, cagr2019to2024Pct: 17.053497, remittancesToFdi2024: 0.136556 },
  { corridorSlug: "uk-to-poland", country: "Poland", code: "PL", wdiCode: "POL", dependencyPct2019: 1.246923, dependencyPct2023: 1.05114, dependencyPct2024: 0.946863, remittancesReceivedUsd2024: 8690000000, growth2024Pct: 1.75644, cagr2019to2024Pct: 2.948058, remittancesToFdi2024: 0.421722 },
  { corridorSlug: "uk-to-switzerland", country: "Switzerland", code: "CH", wdiCode: "CHE", dependencyPct2019: 0.391804, dependencyPct2023: 0.37594, dependencyPct2024: 0.374856, remittancesReceivedUsd2024: 3635806741.17, growth2024Pct: 4.167163, cagr2019to2024Pct: 4.733457, remittancesToFdi2024: null },
  { corridorSlug: "uk-to-united-states", country: "United States", code: "US", wdiCode: "USA", dependencyPct2019: 0.032725, dependencyPct2023: 0.030203, dependencyPct2024: 0.029736, remittancesReceivedUsd2024: 8712000000, growth2024Pct: 3.714286, cagr2019to2024Pct: 4.327325, remittancesToFdi2024: 0.029328 },
  { corridorSlug: "uk-to-canada", country: "Canada", code: "CA", wdiCode: "CAN", dependencyPct2019: 0.075229, dependencyPct2023: 0.038568, dependencyPct2024: 0.037507, remittancesReceivedUsd2024: 851437898.47, growth2024Pct: 0.501029, cagr2019to2024Pct: -8.28123, remittancesToFdi2024: 0.013504 },
  { corridorSlug: "uk-to-australia", country: "Australia", code: "AU", wdiCode: "AUS", dependencyPct2019: 0.119985, dependencyPct2023: 0.092856, dependencyPct2024: 0.100779, remittancesReceivedUsd2024: 1770711533.77, growth2024Pct: 9.945103, cagr2019to2024Pct: 1.083596, remittancesToFdi2024: 0.03296 },
  { corridorSlug: "uk-to-new-zealand", country: "New Zealand", code: "NZ", wdiCode: "NZL", dependencyPct2019: 0.22241, dependencyPct2023: null, dependencyPct2024: null, remittancesReceivedUsd2024: null, growth2024Pct: null, cagr2019to2024Pct: null, remittancesToFdi2024: null },
  { corridorSlug: "uk-to-india", country: "India", code: "IN", wdiCode: "IND", dependencyPct2019: 2.938775, dependencyPct2023: 3.414146, dependencyPct2024: 3.660765, remittancesReceivedUsd2024: 137674533895.69, growth2024Pct: 15.183701, cagr2019to2024Pct: 10.56261, remittancesToFdi2024: 5.072781 },
  { corridorSlug: "uk-to-pakistan", country: "Pakistan", code: "PK", wdiCode: "PAK", dependencyPct2019: 6.934043, dependencyPct2023: 7.888054, dependencyPct2024: 9.391869, remittancesReceivedUsd2024: 34914000000, growth2024Pct: 31.463213, cagr2019to2024Pct: 9.427408, remittancesToFdi2024: 13.100938 },
  { corridorSlug: "uk-to-philippines", country: "Philippines", code: "PH", wdiCode: "PHL", dependencyPct2019: 9.332614, dependencyPct2023: 8.945518, dependencyPct2024: 8.724696, remittancesReceivedUsd2024: 40279405932.43, growth2024Pct: 3.024578, cagr2019to2024Pct: 2.75155, remittancesToFdi2024: 4.285806 },
  { corridorSlug: "uk-to-united-arab-emirates", country: "United Arab Emirates", code: "AE", wdiCode: "ARE", dependencyPct2019: null, dependencyPct2023: 0.3595, dependencyPct2024: 0.325377, remittancesReceivedUsd2024: 1797140912.19, growth2024Pct: -4.347826, cagr2019to2024Pct: null, remittancesToFdi2024: 0.039379 },
  { corridorSlug: "uk-to-south-africa", country: "South Africa", code: "ZA", wdiCode: "ZAF", dependencyPct2019: 0.228613, dependencyPct2023: 0.210619, dependencyPct2024: 0.213233, remittancesReceivedUsd2024: 855374671.12, growth2024Pct: 6.471247, cagr2019to2024Pct: -0.791818, remittancesToFdi2024: 0.367079 },
  { corridorSlug: "uk-to-nigeria", country: "Nigeria", code: "NG", wdiCode: "NGA", dependencyPct2019: 3.56309, dependencyPct2023: 4.011087, dependencyPct2024: 8.771344, remittancesReceivedUsd2024: 22126757545.06, growth2024Pct: 13.182954, cagr2019to2024Pct: -1.455067, remittancesToFdi2024: 13.708987 },
  { corridorSlug: "uk-to-singapore", country: "Singapore", code: "SG", wdiCode: "SGP", dependencyPct2019: null, dependencyPct2023: null, dependencyPct2024: null, remittancesReceivedUsd2024: null, growth2024Pct: null, cagr2019to2024Pct: null, remittancesToFdi2024: null },
  { corridorSlug: "uk-to-hong-kong", country: "Hong Kong", code: "HK", wdiCode: "HKG", dependencyPct2019: 0.124285, dependencyPct2023: 0.119174, dependencyPct2024: 0.112048, remittancesReceivedUsd2024: 457568834.4, growth2024Pct: 0.837496, cagr2019to2024Pct: 0.278649, remittancesToFdi2024: 0.003637 },
];

/** Q3 2025 World Bank Remittance Prices Worldwide observations for UK source amounts of £120 and £300. */
export const rpwCorridorBenchmarks: Record<string, RpwCorridorBenchmark> = {
  IN: { period: "2025_3Q", services: 28, firms: 12, avgCost200Pct: 1.905, medianCost200Pct: 2.06, avgCost500Pct: 1.12, servicesAtOrBelow5Pct: 100, avgCost2015Q1Pct: 4.152, changeSince2015Pp: -2.247, changeSince2015Pct: -54.1, changeSince2024Q3Pp: -0.975, volatility2021to2025: 0.614 },
  PK: { period: "2025_3Q", services: 29, firms: 8, avgCost200Pct: 2.392, medianCost200Pct: 2.51, avgCost500Pct: 1.22, servicesAtOrBelow5Pct: 97, avgCost2015Q1Pct: 3.066, changeSince2015Pp: -0.674, changeSince2015Pct: -22.0, changeSince2024Q3Pp: 0.475, volatility2021to2025: 0.582 },
  NG: { period: "2025_3Q", services: 31, firms: 9, avgCost200Pct: 1.956, medianCost200Pct: 1.01, avgCost500Pct: 1.26, servicesAtOrBelow5Pct: 87, avgCost2015Q1Pct: 7.193, changeSince2015Pp: -5.237, changeSince2015Pct: -72.8, changeSince2024Q3Pp: -1.266, volatility2021to2025: 1.133 },
  PH: { period: "2025_3Q", services: 38, firms: 10, avgCost200Pct: 3.331, medianCost200Pct: 3.13, avgCost500Pct: 2.0, servicesAtOrBelow5Pct: 84, avgCost2015Q1Pct: 6.426, changeSince2015Pp: -3.095, changeSince2015Pct: -48.2, changeSince2024Q3Pp: -0.74, volatility2021to2025: 0.242 },
  PL: { period: "2025_3Q", services: 30, firms: 10, avgCost200Pct: 2.659, medianCost200Pct: 1.75, avgCost500Pct: 2.0, servicesAtOrBelow5Pct: 83, avgCost2015Q1Pct: 6.317, changeSince2015Pp: -3.657, changeSince2015Pct: -57.9, changeSince2024Q3Pp: -0.888, volatility2021to2025: 0.438 },
  ZA: { period: "2025_3Q", services: 24, firms: 9, avgCost200Pct: 6.393, medianCost200Pct: 5.78, avgCost500Pct: 4.64, servicesAtOrBelow5Pct: 29, avgCost2015Q1Pct: 8.248, changeSince2015Pp: -1.855, changeSince2015Pct: -22.5, changeSince2024Q3Pp: -0.764, volatility2021to2025: 0.548 },
};

/**
 * All 791 UK-source service observations in World Bank RPW Q3 2025, grouped
 * by destination. A service is a firm/product/funding/payout observation, not
 * a customer transaction. The World Bank standard basket was £120, equivalent
 * to the World Bank's standard USD 200 basket during the collection window.
 */
export const rpwUkCorridorCosts: RpwUkCorridorCost[] = [
  { code: "GM", country: "The Gambia", income: "Low income", services: 22, firms: 10, avgCost200Pct: 12.0555 },
  { code: "AF", country: "Afghanistan", income: "Low income", services: 3, firms: 2, avgCost200Pct: 10.56 },
  { code: "ER", country: "Eritrea", income: "Low income", services: 12, firms: 6, avgCost200Pct: 8.4175 },
  { code: "SS", country: "South Sudan", income: "Low income", services: 10, firms: 4, avgCost200Pct: 7.946 },
  { code: "RW", country: "Rwanda", income: "Low income", services: 23, firms: 7, avgCost200Pct: 7.427 },
  { code: "SO", country: "Somalia", income: "Low income", services: 17, firms: 6, avgCost200Pct: 6.7 },
  { code: "ZA", country: "South Africa", income: "Upper middle income", services: 24, firms: 9, avgCost200Pct: 6.3933 },
  { code: "BG", country: "Bulgaria", income: "High income", services: 22, firms: 5, avgCost200Pct: 6.2909 },
  { code: "AL", country: "Albania", income: "Upper middle income", services: 30, firms: 6, avgCost200Pct: 5.84 },
  { code: "LB", country: "Lebanon", income: "Lower middle income", services: 15, firms: 4, avgCost200Pct: 5.7033 },
  { code: "SL", country: "Sierra Leone", income: "Low income", services: 18, firms: 7, avgCost200Pct: 5.5206 },
  { code: "BD", country: "Bangladesh", income: "Lower middle income", services: 32, firms: 10, avgCost200Pct: 5.1131 },
  { code: "ZW", country: "Zimbabwe", income: "Lower middle income", services: 23, firms: 7, avgCost200Pct: 5.0422 },
  { code: "TH", country: "Thailand", income: "Upper middle income", services: 25, firms: 8, avgCost200Pct: 5.0356 },
  { code: "TZ", country: "Tanzania", income: "Lower middle income", services: 24, firms: 8, avgCost200Pct: 4.8846 },
  { code: "LT", country: "Lithuania", income: "High income", services: 25, firms: 9, avgCost200Pct: 4.6692 },
  { code: "UG", country: "Uganda", income: "Low income", services: 34, firms: 11, avgCost200Pct: 4.6394 },
  { code: "JM", country: "Jamaica", income: "Upper middle income", services: 20, firms: 6, avgCost200Pct: 4.4505 },
  { code: "ZM", country: "Zambia", income: "Lower middle income", services: 21, firms: 6, avgCost200Pct: 4.341 },
  { code: "ET", country: "Ethiopia", income: "Low income", services: 19, firms: 7, avgCost200Pct: 4.3358 },
  { code: "CN", country: "China", income: "Upper middle income", services: 23, firms: 6, avgCost200Pct: 4.2691 },
  { code: "GH", country: "Ghana", income: "Lower middle income", services: 37, firms: 13, avgCost200Pct: 4.2419 },
  { code: "VN", country: "Vietnam", income: "Lower middle income", services: 25, firms: 8, avgCost200Pct: 3.9496 },
  { code: "BR", country: "Brazil", income: "Upper middle income", services: 29, firms: 9, avgCost200Pct: 3.8569 },
  { code: "KE", country: "Kenya", income: "Lower middle income", services: 27, firms: 10, avgCost200Pct: 3.43 },
  { code: "PH", country: "Philippines", income: "Lower middle income", services: 38, firms: 10, avgCost200Pct: 3.3305 },
  { code: "RO", country: "Romania", income: "High income", services: 24, firms: 6, avgCost200Pct: 3.1225 },
  { code: "LK", country: "Sri Lanka", income: "Lower middle income", services: 29, firms: 8, avgCost200Pct: 3.0641 },
  { code: "NP", country: "Nepal", income: "Lower middle income", services: 22, firms: 6, avgCost200Pct: 2.8968 },
  { code: "PL", country: "Poland", income: "High income", services: 30, firms: 10, avgCost200Pct: 2.6593 },
  { code: "PK", country: "Pakistan", income: "Lower middle income", services: 29, firms: 8, avgCost200Pct: 2.3917 },
  { code: "NG", country: "Nigeria", income: "Lower middle income", services: 31, firms: 9, avgCost200Pct: 1.9558 },
  { code: "IN", country: "India", income: "Lower middle income", services: 28, firms: 12, avgCost200Pct: 1.9054 },
];

export const rpwUkIncomeCosts = [
  { income: "Low income", services: 158, avgCost200Pct: 6.972 },
  { income: "Upper middle income", services: 151, avgCost200Pct: 4.9906 },
  { income: "High income", services: 101, avgCost200Pct: 4.0579 },
  { income: "Lower middle income", services: 381, avgCost200Pct: 3.6334 },
] as const;

/**
 * Same-firm comparisons across the six RPW corridors that overlap with this
 * site's current UK panel. Values are simple means across each firm's observed
 * products. Different corridors may contain different funding and payout mixes.
 */
export const rpwProviderCorridorComparisons: RpwProviderCorridorComparison[] = [
  {
    provider: "WorldRemit", costMultiple: 25,
    lowest: { code: "NG", country: "Nigeria", services: 3, avgTotalCost200Pct: 0.28, avgFeeGbp: 0, avgFxMarginPct: 0.28, serviceMix: "Account payout" },
    highest: { code: "ZA", country: "South Africa", services: 3, avgTotalCost200Pct: 7, avgFeeGbp: 3.99, avgFxMarginPct: 3.67, serviceMix: "Cash payout" },
  },
  {
    provider: "Remitly", costMultiple: 15.83,
    lowest: { code: "NG", country: "Nigeria", services: 6, avgTotalCost200Pct: 0.25, avgFeeGbp: 0, avgFxMarginPct: 0.25, serviceMix: "Account and cash payout" },
    highest: { code: "ZA", country: "South Africa", services: 6, avgTotalCost200Pct: 3.9583, avgFeeGbp: 2.99, avgFxMarginPct: 1.4633, serviceMix: "Account and cash payout" },
  },
  {
    provider: "Western Union", costMultiple: 5.97,
    lowest: { code: "IN", country: "India", services: 3, avgTotalCost200Pct: 2.04, avgFeeGbp: 1.96, avgFxMarginPct: 0.4033, serviceMix: "Account and cash payout" },
    highest: { code: "ZA", country: "South Africa", services: 2, avgTotalCost200Pct: 12.185, avgFeeGbp: 5.445, avgFxMarginPct: 7.65, serviceMix: "Cash payout" },
  },
  {
    provider: "MoneyGram", costMultiple: 5.62,
    lowest: { code: "PH", country: "Philippines", services: 6, avgTotalCost200Pct: 1.5667, avgFeeGbp: 1.3267, avgFxMarginPct: 0.46, serviceMix: "Account, cash and wallet payout" },
    highest: { code: "ZA", country: "South Africa", services: 3, avgTotalCost200Pct: 8.8067, avgFeeGbp: 3.3267, avgFxMarginPct: 6.0333, serviceMix: "Account and cash payout" },
  },
  {
    provider: "Ria", costMultiple: 4.48,
    lowest: { code: "NG", country: "Nigeria", services: 2, avgTotalCost200Pct: 1.66, avgFeeGbp: 1.99, avgFxMarginPct: 0, serviceMix: "Online, account payout" },
    highest: { code: "ZA", country: "South Africa", services: 1, avgTotalCost200Pct: 7.44, avgFeeGbp: 6, avgFxMarginPct: 2.44, serviceMix: "Agent, account payout" },
  },
  {
    provider: "Wise", costMultiple: 3.33,
    lowest: { code: "PL", country: "Poland", services: 3, avgTotalCost200Pct: 2.0333, avgFeeGbp: 2.43, avgFxMarginPct: 0.01, serviceMix: "Account payout" },
    highest: { code: "ZA", country: "South Africa", services: 3, avgTotalCost200Pct: 6.7767, avgFeeGbp: 8.13, avgFxMarginPct: 0, serviceMix: "Account payout" },
  },
  {
    provider: "Paysend", costMultiple: 1.88,
    lowest: { code: "NG", country: "Nigeria", services: 2, avgTotalCost200Pct: 0.64, avgFeeGbp: 0, avgFxMarginPct: 0.64, serviceMix: "Account payout" },
    highest: { code: "IN", country: "India", services: 1, avgTotalCost200Pct: 1.2, avgFeeGbp: 1, avgFxMarginPct: 0.37, serviceMix: "Account payout" },
  },
  {
    provider: "Xoom", costMultiple: 1.46,
    lowest: { code: "IN", country: "India", services: 3, avgTotalCost200Pct: 3.07, avgFeeGbp: 1.99, avgFxMarginPct: 1.41, serviceMix: "Account payout" },
    highest: { code: "PH", country: "Philippines", services: 2, avgTotalCost200Pct: 4.47, avgFeeGbp: 1.99, avgFxMarginPct: 2.81, serviceMix: "Account payout" },
  },
];

export const ukRpwTrend = [
  { period: "2011_1Q", avgCost200Pct: 8.066 }, { period: "2012_1Q", avgCost200Pct: 8.045 },
  { period: "2013_1Q", avgCost200Pct: 8.06 }, { period: "2014_1Q", avgCost200Pct: 7.918 },
  { period: "2015_1Q", avgCost200Pct: 7.537 }, { period: "2016_1Q", avgCost200Pct: 7.294 },
  { period: "2017_1Q", avgCost200Pct: 7.893 }, { period: "2018_1Q", avgCost200Pct: 7.135 },
  { period: "2019_1Q", avgCost200Pct: 6.967 }, { period: "2020_1Q", avgCost200Pct: 7.416 },
  { period: "2021_1Q", avgCost200Pct: 6.472 }, { period: "2022_1Q", avgCost200Pct: 5.636 },
  { period: "2023_1Q", avgCost200Pct: 6.251 }, { period: "2024_1Q", avgCost200Pct: 5.691 },
  { period: "2025_1Q", avgCost200Pct: 5.195 }, { period: "2025_3Q", avgCost200Pct: 4.614 },
];

export const dependencyHistory = {
  years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  series: [
    { code: "IN", country: "India", values: [3.452, 3.276, 2.734, 2.601, 2.915, 2.939, 3.109, 2.822, 3.422, 3.414, 3.661] },
    { code: "PK", country: "Pakistan", values: [6.354, 6.436, 6.319, 5.854, 5.951, 6.934, 8.684, 8.984, 8.049, 7.888, 9.392] },
    { code: "NG", country: "Nigeria", values: [3.657, 4.184, 4.868, 5.865, 5.764, 3.563, 2.875, 3.198, 3.111, 4.011, 8.771] },
    { code: "PH", country: "Philippines", values: [9.644, 9.724, 9.774, 9.988, 9.748, 9.333, 9.643, 9.309, 9.41, 8.946, 8.725] },
    { code: "PL", country: "Poland", values: [1.378, 1.424, 1.429, 1.383, 1.279, 1.247, 1.228, 1.151, 1.087, 1.051, 0.947] },
    { code: "ZA", country: "South Africa", values: [0.24, 0.238, 0.233, 0.229, 0.229, 0.229, 0.24, 0.221, 0.214, 0.211, 0.213] },
  ],
};

export const receivedHistoryUsdBn = {
  years: dependencyHistory.years,
  series: [
    { code: "IN", country: "India", values: [70.389, 68.91, 62.744, 68.967, 78.79, 83.332, 83.149, 89.375, 111.222, 119.526, 137.675] },
    { code: "PK", country: "Pakistan", values: [17.244, 19.306, 19.819, 19.856, 21.193, 22.252, 26.089, 31.312, 30.176, 26.558, 34.914] },
    { code: "NG", country: "Nigeria", values: [20.999, 20.626, 19.698, 22.037, 24.311, 23.809, 17.208, 19.483, 20.128, 19.55, 22.127] },
    { code: "PH", country: "Philippines", values: [28.691, 29.799, 31.142, 32.81, 33.809, 35.167, 34.883, 36.685, 38.049, 39.097, 40.279] },
    { code: "PL", country: "Poland", values: [7.468, 6.835, 6.763, 7.305, 7.603, 7.515, 7.438, 7.929, 7.564, 8.54, 8.69] },
    { code: "ZA", country: "South Africa", values: [0.913, 0.825, 0.755, 0.874, 0.929, 0.89, 0.811, 0.927, 0.873, 0.803, 0.855] },
  ],
};

export const ukRemittancesPaidHistory = [
  { year: 2011, usd: 9931101010.46 }, { year: 2012, usd: 10077435197.27 },
  { year: 2013, usd: 10528125661.64 }, { year: 2014, usd: 11572710615.64 },
  { year: 2015, usd: 10707262597.49 }, { year: 2016, usd: 10190899107.29 },
  { year: 2017, usd: 9803750898.25 }, { year: 2018, usd: 10410041123.54 },
  { year: 2019, usd: 10360300796.89 }, { year: 2020, usd: 9382380085.41 },
  { year: 2021, usd: 10273648447.26 }, { year: 2022, usd: 10917818776.96 },
  { year: 2023, usd: 11570032006.47 }, { year: 2024, usd: 12271093645.56 },
];

export const researchConstants = {
  editionDate: "22 July 2026",
  ukRemittancesPaidUsd2024: 12_271_093_645.56,
  ukRpwLatestAverageCostPct: 4.614,
  ukRpw2011AverageCostPct: 8.066,
  rpwLatestPeriod: "Q3 2025",
  rpwDatasetUpdated: "5 May 2026",
  rpwUkCorridors: 33,
  rpwUkLatestServiceObservations: 791,
  monitoredProviderCount: 27,
  monitoredCorridors: 21,
  benchmarkedCorridors: 6,
  worldBankLastUpdated: "13 July 2026",
};

export const researchSources = {
  dependency: "https://data.worldbank.org/indicator/BX.TRF.PWKR.DT.GD.ZS",
  received: "https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT",
  paid: "https://data.worldbank.org/indicator/BM.TRF.PWKR.CD.DT",
  fdi: "https://data.worldbank.org/indicator/BX.KLT.DINV.CD.WD",
  prices: "https://datacatalog.worldbank.org/search/dataset/0037898/remittance-prices-worldwide",
  priceReport: "https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf",
  ukSouthAfrica: "https://remittanceprices.worldbank.org/corridor/United-Kingdom/South-Africa",
  bisFxTurnover: "https://www.bis.org/statistics/rpfx25_fx.htm",
  bisCrossBorderTechnology: "https://www.bis.org/publ/bppdf/bispap167.htm",
  bisInterlinking: "https://www.bis.org/cpmi/publ/brief7.htm",
  bisLiquidityBridges: "https://www.bis.org/cpmi/publ/cb_bridges.htm",
  bisRialto: "https://www.bis.org/publ/othp91.htm",
  worldBankCashCosts: "https://blogs.worldbank.org/en/psd/remittances-and-the-high-cost-of-generosity",
};
