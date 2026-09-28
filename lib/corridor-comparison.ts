import { corridors, type Corridor } from "./data.ts";
import { isRankEligible } from "./comparison-case.ts";
import { isUsableDisplayRecord, type DisplayQuoteRecord } from "./display-quotes.ts";

export type CorridorSnapshot = {
  slug: string;
  currentProviders: number;
  verifiedProviders: number;
  bestRecipient: number | null;
  worstRecipient: number | null;
  recipientGap: number | null;
  gapPercent: number | null;
  latestCapturedAt: string | null;
};

// Each snapshot uses one configured transfer case and OMT's captured quotes.
// The recipient gap is not a measure of the market exchange-rate margin.
export function buildCorridorSnapshots(rows: DisplayQuoteRecord[], now = Date.now()): CorridorSnapshot[] {
  const bySlug = new Map(corridors.map((corridor) => [corridor.slug, corridor]));
  const latest = new Map<string, Map<string, DisplayQuoteRecord>>();
  for (const row of rows) {
    if (!row) continue;
    const corridor = bySlug.get(row.corridor_slug);
    if (!corridor || !isUsableDisplayRecord(corridor, row, now)) continue;
    const providers = latest.get(corridor.slug) ?? new Map<string, DisplayQuoteRecord>();
    const previous = providers.get(row.provider_slug);
    const captured = Date.parse(row.captured_at);
    const previousTime = previous ? Date.parse(previous.captured_at) : -Infinity;
    if (captured > previousTime || (captured === previousTime && row.id > previous!.id)) {
      providers.set(row.provider_slug, row);
    }
    latest.set(corridor.slug, providers);
  }

  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  return corridors.map((corridor) => {
    const current = [...(latest.get(corridor.slug)?.values() ?? [])].filter((row) =>
      row.status === "current" && Date.parse(row.captured_at) >= today.getTime());
    const ranked = current.filter((row) => isRankEligible(corridor, {
      corridorSlug: row.corridor_slug,
      sourceAmount: row.source_amount,
      sourceCurrency: row.source_currency,
      recipientCurrency: row.recipient_currency,
      recipientAmount: row.recipient_amount,
      exchangeRate: row.exchange_rate,
      fundingMethod: row.funding_method,
      payoutMethod: row.payout_method,
      status: row.status,
      capturedAt: row.captured_at,
      quoteType: row.quote_type,
      promotion: row.promotion,
      providerSlug: row.provider_slug,
    }, now));
    const amounts = ranked.map((row) => row.recipient_amount);
    const bestRecipient = amounts.length ? Math.max(...amounts) : null;
    const worstRecipient = amounts.length ? Math.min(...amounts) : null;
    const recipientGap = amounts.length >= 2 ? bestRecipient! - worstRecipient! : null;
    const newest = current.reduce((value, row) => Math.max(value, Date.parse(row.captured_at)), -Infinity);
    return {
      slug: corridor.slug,
      currentProviders: current.length,
      verifiedProviders: ranked.length,
      bestRecipient,
      worstRecipient,
      recipientGap,
      gapPercent: recipientGap === null ? null : recipientGap / bestRecipient! * 100,
      latestCapturedAt: Number.isFinite(newest) ? new Date(newest).toISOString() : null,
    };
  });
}

export function getPeerCorridors(corridor: Corridor, limit = 5): Corridor[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  const sameOriginCase = (candidate: Corridor) => candidate.fromCode === corridor.fromCode
    && candidate.fromCurrency === corridor.fromCurrency && candidate.testAmount === corridor.testAmount;
  const sameReceivingCurrency = (candidate: Corridor) => candidate.toCurrency === corridor.toCurrency;
  const reverseDirection = (candidate: Corridor) => candidate.fromCode === corridor.toCode
    && candidate.toCode === corridor.fromCode
    && candidate.fromCurrency === corridor.toCurrency && candidate.toCurrency === corridor.fromCurrency;
  const unique = new Map(corridors.filter((candidate) => candidate.slug !== corridor.slug)
    .map((candidate) => [candidate.slug, candidate]));
  return [...unique.values()].sort((a, b) =>
    Number(sameOriginCase(b)) - Number(sameOriginCase(a))
    || Number(sameReceivingCurrency(b)) - Number(sameReceivingCurrency(a))
    || Number(reverseDirection(b)) - Number(reverseDirection(a))
    || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
  ).slice(0, Math.floor(limit));
}