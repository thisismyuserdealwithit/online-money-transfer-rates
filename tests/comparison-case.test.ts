import assert from "node:assert/strict";
import test from "node:test";
import { hasIndexableComparison, isRankEligible, type ComparisonCandidate } from "../lib/comparison-case.ts";

const now = Date.parse("2026-08-21T12:00:00.000Z");
const corridor = {
  slug: "uk-to-spain",
  fromCurrency: "GBP",
  toCurrency: "EUR",
  testAmount: 200,
} as const;

function candidate(overrides: Partial<ComparisonCandidate> = {}): ComparisonCandidate {
  return {
    corridorSlug: corridor.slug,
    sourceAmount: 200,
    sourceCurrency: "GBP",
    recipientCurrency: "EUR",
    recipientAmount: 231,
    exchangeRate: 1.16,
    fundingMethod: "bank transfer",
    payoutMethod: "bank deposit",
    status: "current",
    capturedAt: "2026-08-21T11:00:00.000Z",
    quoteType: "verified",
    promotion: false,
    providerSlug: "wise",
    ...overrides,
  };
}

test("ranks only positive, standard bank-to-bank, non-promotional quotes", () => {
  assert.equal(isRankEligible(corridor as never, candidate(), now), true);
  assert.equal(isRankEligible(corridor as never, candidate({ recipientAmount: 0 }), now), false);
  assert.equal(isRankEligible(corridor as never, candidate({ exchangeRate: 0 }), now), false);
  assert.equal(isRankEligible(corridor as never, candidate({ fundingMethod: "cash" }), now), false);
  assert.equal(isRankEligible(corridor as never, candidate({ payoutMethod: "cash pickup" }), now), false);
  assert.equal(isRankEligible(corridor as never, candidate({ promotion: true }), now), false);
  assert.equal(isRankEligible(corridor as never, candidate({ status: "stale" }), now), false);
});

test("uses only the latest record for each provider before indexing a corridor", () => {
  const candidates = [
    candidate({ providerSlug: "wise", capturedAt: "2026-08-21T09:00:00.000Z" }),
    candidate({ providerSlug: "wise", promotion: true, capturedAt: "2026-08-21T11:00:00.000Z" }),
    candidate({ providerSlug: "xe", capturedAt: "2026-08-21T10:00:00.000Z" }),
  ];
  assert.equal(hasIndexableComparison(corridor as never, candidates, now), false);
  assert.equal(hasIndexableComparison(corridor as never, [...candidates, candidate({ providerSlug: "currencyfair" })], now), true);
});
