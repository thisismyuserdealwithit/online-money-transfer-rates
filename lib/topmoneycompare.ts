import type { Corridor } from "@/lib/data";

const topMoneyCompareCountrySlugs: Record<string, string> = {
  AE: "united-arab-emirates",
  AU: "australia",
  CA: "canada",
  CH: "switzerland",
  DE: "germany",
  ES: "spain",
  EU: "europe",
  FR: "france",
  GB: "united-kingdom",
  HK: "hong-kong",
  IE: "ireland",
  IN: "india",
  IT: "italy",
  NG: "nigeria",
  NL: "netherlands",
  NZ: "new-zealand",
  PH: "philippines",
  PK: "pakistan",
  PL: "poland",
  PT: "portugal",
  SG: "singapore",
  US: "united-states",
  ZA: "south-africa",
};

export function topMoneyCompareCorridorUrl(corridor: Corridor) {
  const from = topMoneyCompareCountrySlugs[corridor.fromCode];
  const to = topMoneyCompareCountrySlugs[corridor.toCode];

  if (!from || !to || from === to) {
    return "https://www.topmoneycompare.co.uk";
  }

  const amount = Number(corridor.testAmount);
  const query = Number.isFinite(amount) && amount > 0 && amount < 1_000_000_000
    ? `?amount=${encodeURIComponent(amount)}`
    : "";

  return `https://www.topmoneycompare.co.uk/transfer-money/${from}-to-${to}${query}`;
}
