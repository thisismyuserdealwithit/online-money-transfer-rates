const countries = {
  uk: { slug: "uk", name: "United Kingdom", currency: "GBP", amount: 200, locale: "gb" },
  spain: { slug: "spain", name: "Spain", currency: "EUR", amount: 850, locale: "es" },
  france: { slug: "france", name: "France", currency: "EUR", amount: 850, locale: "fr" },
  germany: { slug: "germany", name: "Germany", currency: "EUR", amount: 850, locale: "de" },
  ireland: { slug: "ireland", name: "Ireland", currency: "EUR", amount: 850, locale: "ie" },
  italy: { slug: "italy", name: "Italy", currency: "EUR", amount: 850, locale: "it" },
  netherlands: { slug: "netherlands", name: "Netherlands", currency: "EUR", amount: 850, locale: "nl" },
  portugal: { slug: "portugal", name: "Portugal", currency: "EUR", amount: 850, locale: "pt" },
  poland: { slug: "poland", name: "Poland", currency: "PLN", amount: 3600, locale: "pl" },
  switzerland: { slug: "switzerland", name: "Switzerland", currency: "CHF", amount: 800, locale: "ch" },
  "united-states": { slug: "united-states", name: "United States", currency: "USD", amount: 1000, locale: "us" },
  canada: { slug: "canada", name: "Canada", currency: "CAD", amount: 1350, locale: "ca" },
  australia: { slug: "australia", name: "Australia", currency: "AUD", amount: 1500, locale: "au" },
  "new-zealand": { slug: "new-zealand", name: "New Zealand", currency: "NZD", amount: 1650, locale: "nz" },
  india: { slug: "india", name: "India", currency: "INR", amount: 85000, locale: "in" },
  pakistan: { slug: "pakistan", name: "Pakistan", currency: "PKR", amount: 280000, locale: "pk" },
  philippines: { slug: "philippines", name: "Philippines", currency: "PHP", amount: 58000, locale: "ph" },
  "united-arab-emirates": { slug: "united-arab-emirates", name: "United Arab Emirates", currency: "AED", amount: 3670, locale: "ae" },
  "south-africa": { slug: "south-africa", name: "South Africa", currency: "ZAR", amount: 17500, locale: "za" },
  nigeria: { slug: "nigeria", name: "Nigeria", currency: "NGN", amount: 1550000, locale: "ng" },
  singapore: { slug: "singapore", name: "Singapore", currency: "SGD", amount: 1280, locale: "sg" },
  "hong-kong": { slug: "hong-kong", name: "Hong Kong", currency: "HKD", amount: 7800, locale: "hk" },
  europe: { slug: "europe", name: "Euro area", currency: "EUR", amount: 850, locale: "de" },
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
];

function makeCorridor(fromSlug, toSlug, group) {
  const from = countries[fromSlug];
  const to = countries[toSlug];
  return {
    slug: `${from.slug}-to-${to.slug}`,
    group,
    sourceCountry: from.name,
    sourceLocale: from.locale,
    sourceCurrency: from.currency,
    sourceAmount: from.amount,
    destinationCountry: to.name,
    destinationLocale: to.locale,
    destinationCurrency: to.currency,
    fundingMethod: "bank transfer",
    payoutMethod: "bank deposit",
  };
}

export const corridors = [
  ...ukMarkets.map((market) => makeCorridor("uk", market, "from-uk")),
  ...ukMarkets.map((market) => makeCorridor(market, "uk", "to-uk")),
  ...majorPairs.map(([from, to]) => makeCorridor(from, to, "major")),
];
