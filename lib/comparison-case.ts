import type { Corridor } from "@/lib/data";

export const COMPARISON_FRESHNESS_MS = 36 * 60 * 60 * 1000;

export type ComparisonCandidate = {
  corridorSlug: string;
  sourceAmount: number;
  sourceCurrency: string;
  recipientCurrency: string;
  recipientAmount?: number;
  exchangeRate?: number;
  fundingMethod?: string;
  payoutMethod?: string;
  status: string;
  capturedAt: string;
  quoteType?: string;
  promotion?: boolean | number;
  providerSlug?: string;
};

export function matchesConfiguredTransferCase(corridor: Corridor, candidate: Pick<ComparisonCandidate, "corridorSlug" | "sourceAmount" | "sourceCurrency" | "recipientCurrency">) {
  return candidate.corridorSlug === corridor.slug
    && Math.abs(Number(candidate.sourceAmount) - corridor.testAmount) <= 0.01
    && candidate.sourceCurrency.toUpperCase() === corridor.fromCurrency
    && candidate.recipientCurrency.toUpperCase() === corridor.toCurrency;
}

export function isFreshComparableCase(corridor: Corridor, candidate: ComparisonCandidate, now = Date.now()) {
  const captured = Date.parse(candidate.capturedAt);
  const age = now - captured;
  return matchesConfiguredTransferCase(corridor, candidate)
    && candidate.status === "current"
    && Number.isFinite(captured)
    && age >= -5 * 60 * 1000
    && age <= COMPARISON_FRESHNESS_MS;
}

export function isRankEligible(corridor: Corridor, candidate: ComparisonCandidate, now = Date.now()) {
  return isFreshComparableCase(corridor, candidate, now)
    && candidate.quoteType === "verified"
    && Number(candidate.promotion) !== 1
    && Number(candidate.recipientAmount) > 0
    && Number(candidate.exchangeRate) > 0
    && candidate.fundingMethod?.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ") === "bank transfer"
    && candidate.payoutMethod?.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ") === "bank deposit";
}

export function hasIndexableComparison(corridor: Corridor, candidates: ComparisonCandidate[], now = Date.now()) {
  const latestByProvider = new Map<string, ComparisonCandidate>();
  for (const candidate of candidates) {
    if (!candidate.providerSlug) continue;
    const saved = latestByProvider.get(candidate.providerSlug);
    if (!saved || Date.parse(candidate.capturedAt) > Date.parse(saved.capturedAt)) {
      latestByProvider.set(candidate.providerSlug, candidate);
    }
  }
  return [...latestByProvider.values()].filter((candidate) => isRankEligible(corridor, candidate, now)).length >= 2;
}
