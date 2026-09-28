import assert from "node:assert/strict";
import test from "node:test";
import { corridors, getCorridor } from "../lib/data.ts";
import type { DisplayQuoteRecord } from "../lib/display-quotes.ts";
import { buildCorridorSnapshots, getPeerCorridors } from "../lib/corridor-comparison.ts";

const now = Date.parse("2026-09-29T12:00:00.000Z");
const spain = getCorridor("uk-to-spain")!;
const otherCurrency = corridors.find((corridor) => corridor.fromCurrency === "GBP" && corridor.toCurrency !== "EUR")!;

function record(corridor = spain, changes: Partial<DisplayQuoteRecord> = {}): DisplayQuoteRecord {
  return {
    id: "wise-today", provider_slug: "wise", provider_name: "Wise", quote_type: "verified", status: "current",
    corridor_slug: corridor.slug, source_amount: corridor.testAmount, source_currency: corridor.fromCurrency,
    recipient_amount: 230, recipient_currency: corridor.toCurrency, fee_amount: 1,
    fee_currency: corridor.fromCurrency, exchange_rate: 1.15, delivery_estimate: null, plan_name: null,
    promotion: 0, funding_method: "Bank transfer", payout_method: "Bank deposit",
    captured_at: "2026-09-29T11:00:00.000Z", ...changes,
  };
}

function snapshot(rows: DisplayQuoteRecord[], corridor = spain, at = now) {
  return buildCorridorSnapshots(rows, at).find((item) => item.slug === corridor.slug)!;
}

test("returns all configured routes with empty evidence represented by null prices", () => {
  const result = buildCorridorSnapshots([], now);
  assert.equal(corridors.length, 52);
  assert.equal(result.length, 52);
  assert.equal(new Set(result.map((item) => item.slug)).size, 52);
  for (const item of result) {
    assert.equal(item.currentProviders, 0);
    assert.equal(item.verifiedProviders, 0);
    assert.equal(item.bestRecipient, null);
    assert.equal(item.worstRecipient, null);
    assert.equal(item.recipientGap, null);
    assert.equal(item.gapPercent, null);
    assert.equal(item.latestCapturedAt, null);
  }
});

test("compares only the same route, sending amount and receiving currency", () => {
  const rows = [
    record(),
    record(spain, { id: "second", provider_slug: "second", recipient_amount: 220 }),
    record(otherCurrency, { recipient_amount: 900 }),
    record(spain, { id: "wrong-currency", provider_slug: "wrong", recipient_currency: "USD", recipient_amount: 999 }),
    record(spain, { id: "wrong-amount", provider_slug: "wrong-amount", source_amount: spain.testAmount * 5, recipient_amount: 999 }),
    record(spain, { id: "wrong-source", provider_slug: "wrong-source", source_currency: "USD", recipient_amount: 999 }),
  ];
  const result = snapshot(rows);
  assert.equal(result.currentProviders, 2);
  assert.equal(result.verifiedProviders, 2);
  assert.equal(result.bestRecipient, 230);
  assert.equal(result.worstRecipient, 220);
  assert.equal(result.recipientGap, 10);
  assert.ok(Math.abs(result.gapPercent! - 10 / 230 * 100) < 1e-10);
  assert.equal(snapshot(rows, otherCurrency).bestRecipient, 900);
  assert.equal(snapshot(rows, otherCurrency).recipientGap, null);
});

test("excludes stale, yesterday, invalid, future, indicative, promotional and non-bank cases from ranking", () => {
  const result = snapshot([
    record(),
    record(spain, { id: "estimate", provider_slug: "estimate", quote_type: "indicative", recipient_amount: 999 }),
    record(spain, { id: "promo", provider_slug: "promo", promotion: 1, recipient_amount: 999 }),
    record(spain, { id: "card", provider_slug: "card", funding_method: "Debit card", recipient_amount: 999 }),
    record(spain, { id: "cash", provider_slug: "cash", payout_method: "Cash pickup", recipient_amount: 999 }),
    record(spain, { id: "stale", provider_slug: "stale", status: "stale", recipient_amount: 999 }),
    record(spain, { id: "yesterday", provider_slug: "yesterday", captured_at: "2026-09-28T23:59:59.999Z" }),
    record(spain, { id: "invalid", provider_slug: "invalid", status: "invalid" }),
    record(spain, { id: "future", provider_slug: "future", captured_at: "2026-09-29T12:00:00.001Z" }),
  ]);
  assert.equal(result.currentProviders, 5);
  assert.equal(result.verifiedProviders, 1);
  assert.equal(result.bestRecipient, 230);
  assert.equal(result.worstRecipient, 230);
  assert.equal(result.recipientGap, null);
  assert.equal(result.gapPercent, null);
});

test("falls back past malformed or future records without reviving an older verified quote behind a usable estimate", () => {
  const rows = [
    record(spain, { id: "older-good", captured_at: "2026-09-29T08:00:00.000Z" }),
    record(spain, { id: "new-malformed", recipient_amount: NaN }),
    record(spain, { id: "new-future", captured_at: "2026-09-29T13:00:00.000Z" }),
    record(spain, { id: "other-earlier", provider_slug: "other", recipient_amount: 240, captured_at: "2026-09-29T09:00:00.000Z" }),
    record(spain, { id: "other-latest", provider_slug: "other", quote_type: "indicative", recipient_amount: 999 }),
  ];
  const result = snapshot(rows);
  assert.equal(result.currentProviders, 2);
  assert.equal(result.verifiedProviders, 1);
  assert.equal(result.bestRecipient, 230);
  assert.equal(result.latestCapturedAt, "2026-09-29T11:00:00.000Z");
  assert.deepEqual(snapshot([...rows].reverse()), result);
});

test("a newer stale record prevents an older current record from being counted", () => {
  const result = snapshot([
    record(spain, { id: "earlier", captured_at: "2026-09-29T10:00:00.000Z" }),
    record(spain, { id: "latest", status: "stale" }),
  ]);
  assert.equal(result.currentProviders, 0);
  assert.equal(result.verifiedProviders, 0);
  assert.equal(result.latestCapturedAt, null);
});

test("selects chronological offset timestamps and uses the UTC day boundary", () => {
  const result = snapshot([
    record(spain, { id: "canonical", recipient_amount: 220, captured_at: "2026-09-29T10:00:00.000Z" }),
    record(spain, { id: "offset", recipient_amount: 231, captured_at: "2026-09-29T09:30:00-02:00" }),
    record(spain, { id: "previous-utc-day", provider_slug: "other", captured_at: "2026-09-29T00:30:00+01:00" }),
  ]);
  assert.equal(result.currentProviders, 1);
  assert.equal(result.bestRecipient, 231);
  assert.equal(result.latestCapturedAt, "2026-09-29T11:30:00.000Z");
  assert.equal(snapshot([record(spain, { captured_at: "2026-09-29T00:00:00.000Z" })],
    spain, Date.parse("2026-09-29T00:00:00.000Z")).currentProviders, 1);
});

test("uses a deterministic ID tie-break and allows a genuinely equal two-provider gap", () => {
  const rows = [
    record(spain, { id: "a", recipient_amount: 220 }),
    record(spain, { id: "z", recipient_amount: 230 }),
    record(spain, { id: "second", provider_slug: "second", recipient_amount: 230 }),
  ];
  assert.deepEqual(snapshot(rows), snapshot([...rows].reverse()));
  assert.equal(snapshot(rows).recipientGap, 0);
  assert.equal(snapshot(rows).gapPercent, 0);
});

test("prioritises comparable origin cases, receiving currency and then the reverse route", () => {
  assert.deepEqual(getPeerCorridors(spain).map((peer) => peer.slug), [
    "uk-to-france", "uk-to-germany", "uk-to-ireland", "uk-to-italy", "uk-to-netherlands",
  ]);
  const euroDollar = getCorridor("europe-to-united-states")!;
  assert.deepEqual(getPeerCorridors(euroDollar).map((peer) => peer.slug), [
    "europe-to-switzerland", "australia-to-united-states", "canada-to-united-states",
    "uk-to-united-states", "united-states-to-europe",
  ]);
});

test("peer lists are deterministic and unique across all 52 routes", () => {
  for (const corridor of corridors) {
    const peers = getPeerCorridors(corridor);
    assert.equal(peers.length, 5);
    assert.equal(new Set(peers.map((peer) => peer.slug)).size, 5);
    assert.ok(peers.every((peer) => peer.slug !== corridor.slug));
    assert.deepEqual(getPeerCorridors(corridor), peers);
    assert.equal(getPeerCorridors(corridor, 100).length, corridors.length - 1);
  }
  assert.deepEqual(getPeerCorridors(spain, 0), []);
  assert.deepEqual(getPeerCorridors(spain, -1), []);
  assert.equal(getPeerCorridors(spain, 2.8).length, 2);
});