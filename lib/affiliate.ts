import { env } from "cloudflare:workers";

type AffiliateEntry = {
  url: string;
  commercial: boolean;
};

const providerDestinations: Record<string, string> = {
  xe: "https://www.xe.com/send-money/",
  wise: "https://wise.com/",
  currencyfair: "https://www.currencyfair.com/",
  atlanticmoney: "https://atlantic.money/",
  instarem: "https://www.instarem.com/",
  ria: "https://www.riamoneytransfer.com/",
  taptapsend: "https://www.taptapsend.com/",
  transfergo: "https://www.transfergo.com/",
  singx: "https://www.singx.co/",
  remitly: "https://www.remitly.com/",
  revolut: "https://www.revolut.com/",
  starling: "https://www.starlingbank.com/",
  natwestbusiness: "https://www.natwest.com/business/",
  lloydsbusiness: "https://www.lloydsbank.com/business/",
  santanderuk: "https://www.santander.co.uk/business/",
  hsbcuk: "https://www.business.hsbc.uk/",
  barclays: "https://www.barclays.co.uk/business-banking/",
  natwest: "https://www.natwest.com/current-accounts/international-payments.html",
  rbs: "https://www.rbs.co.uk/current-accounts/international-payments.html",
  nationwide: "https://www.nationwide.co.uk/help/payments/international-payments/",
  monese: "https://www.monese.com/",
  skrill: "https://www.skrill.com/en/transfer-money/",
  paypal: "https://www.paypal.com/uk/digital-wallet/send-receive-money/send-money-internationally",
  asda: "https://money.asda.com/travel/travel-money/",
  lloyds: "https://www.lloydsbank.com/international-payments.html",
  santander: "https://www.santander.co.uk/personal/support/current-accounts/making-international-payments",
  hsbc: "https://www.hsbc.co.uk/international/money-transfer/",
  paysend: "https://paysend.com/",
  westernunion: "https://www.westernunion.com/",
  worldremit: "https://www.worldremit.com/",
  ace: "https://acemoneytransfer.com/",
  profee: "https://www.profee.com/",
  xoom: "https://www.xoom.com/",
  orbitremit: "https://www.orbitremit.com/",
  moneygram: "https://www.moneygram.com/",
  ofx: "https://www.ofx.com/",
  lemfi: "https://www.lemfi.com/",
  torfx: "https://www.torfx.com/",
  keycurrency: "https://www.keycurrency.co.uk/",
  currenciesdirect: "https://www.currenciesdirect.com/en-gb/",
};

function configuredLinks() {
  const value = (env as unknown as Record<string, unknown>).AFFILIATE_LINKS_JSON;
  if (typeof value !== "string" || !value.trim()) return {} as Record<string, string>;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  } catch {
    return {} as Record<string, string>;
  }
}

export function hasProviderDestination(providerSlug: string) {
  return Boolean(providerDestinations[providerSlug]);
}

export function getAffiliateDestination(providerSlug: string): AffiliateEntry | null {
  const configured = configuredLinks()[providerSlug];
  const candidate = configured ?? providerDestinations[providerSlug];
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    return { url: candidate, commercial: Boolean(configured) };
  } catch {
    return null;
  }
}

export function fillTrackingTemplate(url: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, encodeURIComponent(value)),
    url,
  );
}
