export type QuoteStatus = "verified" | "indicative" | "stale";

export type Quote = {
  provider: string;
  providerSlug: string;
  mark: string;
  sourceAmount?: number;
  sourceCurrency?: string;
  recipientCurrency?: string;
  rate: number;
  fee: number;
  feeCurrency?: string;
  recipientGets: number;
  delivery: string;
  checkedAt: string;
  capturedAt?: string;
  status: QuoteStatus;
  proofId: string;
  fundingMethod?: string;
  payoutMethod?: string;
  promotion?: boolean;
  eligibleForPriceRanking?: boolean;
  note?: string;
};

export function providerSlugFromName(provider: string) {
  const matches: Record<string, string> = {
    "Xe": "xe",
    "Wise": "wise",
    "CurrencyFair": "currencyfair",
    "Atlantic Money": "atlanticmoney",
    "Instarem": "instarem",
    "Ria Money Transfer": "ria",
    "Taptap Send": "taptapsend",
    "TransferGo": "transfergo",
    "SingX": "singx",
    "Remitly": "remitly",
    "Revolut": "revolut",
    "Starling Bank": "starling",
    "NatWest Business": "natwestbusiness",
    "Lloyds Bank Business": "lloydsbusiness",
    "Santander UK": "santanderuk",
    "NatWest": "natwest",
    "RBS": "rbs",
    "Nationwide": "nationwide",
    "Monese": "monese",
    "Skrill": "skrill",
    "PayPal": "paypal",
    "Asda Money": "asda",
    "HSBC UK": "hsbcuk",
    "Barclays": "barclays",
    "Paysend": "paysend",
    "Western Union": "westernunion",
    "WorldRemit": "worldremit",
    "ACE Money Transfer": "ace",
    "Profee": "profee",
    "Xoom": "xoom",
    "OrbitRemit": "orbitremit",
    "MoneyGram": "moneygram",
    "OFX": "ofx",
    "LemFi": "lemfi",
  };
  return matches[provider] ?? provider.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export type CorridorGroup = "from-uk" | "to-uk" | "major";

export type Corridor = {
  slug: string;
  group: CorridorGroup;
  fromCountry: string;
  fromCode: string;
  fromCurrency: string;
  fromSymbol: string;
  toCountry: string;
  toCode: string;
  toCurrency: string;
  toSymbol: string;
  testAmount: number;
  quotes: Quote[];
};

export const monitoredProviders = [
  { provider: "Xe", mark: "XE" },
  { provider: "Wise", mark: "WI" },
  { provider: "CurrencyFair", mark: "CF" },
  { provider: "Atlantic Money", mark: "AM", unavailable: "This route did not return a standard public quote" },
  { provider: "Instarem", mark: "IR", unavailable: "We could not reproduce a bank-transfer quote on this route" },
  { provider: "Ria Money Transfer", mark: "RIA", unavailable: "The bank-funded public journey did not complete" },
  { provider: "Taptap Send", mark: "TS", unavailable: "This destination did not produce a supported public quote" },
  { provider: "TransferGo", mark: "TG" },
  { provider: "SingX", mark: "SX" },
  { provider: "Remitly", mark: "RM" },
  { provider: "Revolut", mark: "RE" },
  { provider: "Starling Bank", mark: "ST", unavailable: "Starling publishes live prices for selected UK outbound currencies" },
  { provider: "NatWest Business", mark: "NWB", unavailable: "NatWest's public business calculator covers selected UK outbound currencies" },
  { provider: "Lloyds Bank Business", mark: "LB", unavailable: "Lloyds publishes enough detail to model selected UK outbound payments" },
  { provider: "Santander UK", mark: "SAN", unavailable: "Santander publishes enough detail to model selected UK outbound payments" },
  { provider: "HSBC UK", mark: "HSBC", unavailable: "HSBC shows the transferable customer rate only after sign-in or inside its app" },
  { provider: "Barclays", mark: "BAR", unavailable: "Barclays reveals the final rate inside the authenticated payment journey" },
  { provider: "NatWest", mark: "NW", unavailable: "No current comparison estimate was captured for this route" },
  { provider: "RBS", mark: "RBS", unavailable: "No current comparison estimate was captured for this route" },
  { provider: "Nationwide", mark: "NWD", unavailable: "No current comparison estimate was captured for this route" },
  { provider: "Monese", mark: "MO", unavailable: "No current comparison estimate was captured for this route" },
  { provider: "Skrill", mark: "SK", unavailable: "No current comparison estimate was captured for this route" },
  { provider: "PayPal", mark: "PP", unavailable: "No current comparison estimate was captured for this route" },
  { provider: "Asda Money", mark: "AS", unavailable: "No current comparison estimate was captured for this route" },
  { provider: "Paysend", mark: "PS" },
  { provider: "Western Union", mark: "WU" },
  { provider: "WorldRemit", mark: "WR", unavailable: "The public calculator asked this checking session for human verification" },
  { provider: "ACE Money Transfer", mark: "ACE", unavailable: "The provider blocked automated collection of the public quote" },
  { provider: "Profee", mark: "PF", unavailable: "We could not reproduce a bank-funded quote on this route" },
  { provider: "Xoom", mark: "XM", unavailable: "A bank-funded public quote was not available outside the PayPal journey" },
  { provider: "OrbitRemit", mark: "OR", unavailable: "The provider's public verification step blocked this collection" },
  { provider: "MoneyGram", mark: "MG", unavailable: "The estimator required a human-verification session" },
  { provider: "OFX", mark: "OFX", unavailable: "OFX reveals the customer transfer rate after registration or sign-in" },
  { provider: "LemFi", mark: "LF", unavailable: "The public calculator was visible, but the provider blocked automated receipt collection" },
] as const;

type Market = {
  slug: string;
  country: string;
  code: string;
  currency: string;
  symbol: string;
  amount: number;
};

const markets: Record<string, Market> = {
  uk: { slug: "uk", country: "United Kingdom", code: "GB", currency: "GBP", symbol: "£", amount: 200 },
  spain: { slug: "spain", country: "Spain", code: "ES", currency: "EUR", symbol: "€", amount: 850 },
  france: { slug: "france", country: "France", code: "FR", currency: "EUR", symbol: "€", amount: 850 },
  germany: { slug: "germany", country: "Germany", code: "DE", currency: "EUR", symbol: "€", amount: 850 },
  ireland: { slug: "ireland", country: "Ireland", code: "IE", currency: "EUR", symbol: "€", amount: 850 },
  italy: { slug: "italy", country: "Italy", code: "IT", currency: "EUR", symbol: "€", amount: 850 },
  netherlands: { slug: "netherlands", country: "Netherlands", code: "NL", currency: "EUR", symbol: "€", amount: 850 },
  portugal: { slug: "portugal", country: "Portugal", code: "PT", currency: "EUR", symbol: "€", amount: 850 },
  poland: { slug: "poland", country: "Poland", code: "PL", currency: "PLN", symbol: "zł", amount: 3600 },
  switzerland: { slug: "switzerland", country: "Switzerland", code: "CH", currency: "CHF", symbol: "CHF", amount: 800 },
  "united-states": { slug: "united-states", country: "United States", code: "US", currency: "USD", symbol: "$", amount: 1000 },
  canada: { slug: "canada", country: "Canada", code: "CA", currency: "CAD", symbol: "C$", amount: 1350 },
  australia: { slug: "australia", country: "Australia", code: "AU", currency: "AUD", symbol: "A$", amount: 1500 },
  "new-zealand": { slug: "new-zealand", country: "New Zealand", code: "NZ", currency: "NZD", symbol: "NZ$", amount: 1650 },
  india: { slug: "india", country: "India", code: "IN", currency: "INR", symbol: "₹", amount: 85000 },
  pakistan: { slug: "pakistan", country: "Pakistan", code: "PK", currency: "PKR", symbol: "₨", amount: 280000 },
  philippines: { slug: "philippines", country: "Philippines", code: "PH", currency: "PHP", symbol: "₱", amount: 58000 },
  "united-arab-emirates": { slug: "united-arab-emirates", country: "United Arab Emirates", code: "AE", currency: "AED", symbol: "د.إ", amount: 3670 },
  "south-africa": { slug: "south-africa", country: "South Africa", code: "ZA", currency: "ZAR", symbol: "R", amount: 17500 },
  nigeria: { slug: "nigeria", country: "Nigeria", code: "NG", currency: "NGN", symbol: "₦", amount: 1550000 },
  singapore: { slug: "singapore", country: "Singapore", code: "SG", currency: "SGD", symbol: "S$", amount: 1280 },
  "hong-kong": { slug: "hong-kong", country: "Hong Kong", code: "HK", currency: "HKD", symbol: "HK$", amount: 7800 },
  europe: { slug: "europe", country: "Euro area", code: "EU", currency: "EUR", symbol: "€", amount: 850 },
};

const ukMarkets = [
  "spain", "france", "germany", "ireland", "italy", "netherlands", "portugal", "poland", "switzerland",
  "united-states", "canada", "australia", "new-zealand", "india", "pakistan", "philippines",
  "united-arab-emirates", "south-africa", "nigeria", "singapore", "hong-kong",
];

const majorPairs = [
  ["europe", "united-states"], ["united-states", "europe"],
  ["united-states", "canada"], ["canada", "united-states"],
  ["australia", "new-zealand"], ["new-zealand", "australia"],
  ["united-states", "australia"], ["australia", "united-states"],
  ["europe", "switzerland"], ["switzerland", "europe"],
] as const;

function makeCorridor(fromSlug: string, toSlug: string, group: CorridorGroup): Corridor {
  const from = markets[fromSlug];
  const to = markets[toSlug];
  return {
    slug: `${from.slug}-to-${to.slug}`,
    group,
    fromCountry: from.country,
    fromCode: from.code,
    fromCurrency: from.currency,
    fromSymbol: from.symbol,
    toCountry: to.country,
    toCode: to.code,
    toCurrency: to.currency,
    toSymbol: to.symbol,
    testAmount: from.amount,
    quotes: [],
  };
}

export const corridors: Corridor[] = [
  ...ukMarkets.map((market) => makeCorridor("uk", market, "from-uk")),
  ...ukMarkets.map((market) => makeCorridor(market, "uk", "to-uk")),
  ...majorPairs.map(([from, to]) => makeCorridor(from, to, "major")),
];

export const corridorGroups = {
  "from-uk": corridors.filter((corridor) => corridor.group === "from-uk"),
  "to-uk": corridors.filter((corridor) => corridor.group === "to-uk"),
  major: corridors.filter((corridor) => corridor.group === "major"),
};

export function getCorridor(slug: string) {
  return corridors.find((corridor) => corridor.slug === slug);
}

export function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: ["NGN", "INR", "PKR", "PHP"].includes(currency) ? 0 : 2,
  }).format(value);
}
