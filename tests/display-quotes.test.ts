import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import test from "node:test";
import { getCorridor, type Quote } from "../lib/data.ts";
import { isRankEligible } from "../lib/comparison-case.ts";
import { buildCorridorSnapshots } from "../lib/corridor-comparison.ts";
import { isUsableDisplayRecord, loadDisplayQuoteRecords, selectDisplayQuotes, type DisplayQuoteRecord } from "../lib/display-quotes.ts";

const now = Date.parse("2026-09-28T12:00:00.000Z");
const corridor = getCorridor("uk-to-spain")!;

function record(changes: Partial<DisplayQuoteRecord> = {}): DisplayQuoteRecord {
  return {
    id: "wise-today", provider_slug: "wise", provider_name: "Wise", quote_type: "verified", status: "current",
    corridor_slug: corridor.slug, source_amount: 200, source_currency: "GBP", recipient_amount: 230,
    recipient_currency: "EUR", fee_amount: 1, fee_currency: "GBP", exchange_rate: 1.15578,
    delivery_estimate: "Within one day", plan_name: null, promotion: 0,
    funding_method: "Bank transfer", payout_method: "Bank deposit", captured_at: "2026-09-28T11:00:00.000Z",
    ...changes,
  };
}

function toQuote(row: DisplayQuoteRecord): Quote {
  return {
    provider: row.provider_name, providerSlug: row.provider_slug, mark: "WI", sourceAmount: row.source_amount,
    rate: row.exchange_rate, fee: row.fee_amount, recipientGets: row.recipient_amount, delivery: "Check provider",
    checkedAt: row.captured_at, capturedAt: row.captured_at, proofId: row.id, status: row.quote_type,
    eligibleForPriceRanking: isRankEligible(corridor, {
      corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
      recipientCurrency: row.recipient_currency, recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
      fundingMethod: row.funding_method, payoutMethod: row.payout_method, status: row.status,
      capturedAt: row.captured_at, quoteType: row.quote_type, promotion: row.promotion,
    }, now),
  };
}

function select(rows: DisplayQuoteRecord[], at = now) {
  return selectDisplayQuotes(corridor, rows, toQuote, at);
}

test("prefers each provider's newest usable result today, not the largest or older verified amount", () => {
  const quotes = select([
    record({ id: "wise-old", recipient_amount: 999, captured_at: "2026-09-27T11:00:00.000Z" }),
    record({ id: "wise-earlier", captured_at: "2026-09-28T08:00:00.000Z" }),
    record({ id: "wise-latest", quote_type: "indicative" }),
    record({ id: "xe-today", provider_slug: "xe", provider_name: "Xe" }),
  ]);
  assert.equal(quotes.length, 2);
  const wise = quotes.find((quote) => quote.providerSlug === "wise")!;
  assert.equal(wise.proofId, "wise-latest");
  assert.equal(wise.status, "indicative");
  assert.equal(wise.eligibleForPriceRanking, false);
  assert.equal(quotes.find((quote) => quote.providerSlug === "xe")?.eligibleForPriceRanking, true);
});

test("retains the freshest older receipt with its original date and marks it stale and unranked", () => {
  const timestamp = "2026-07-01T05:17:00.000Z";
  const [quote] = select([
    record({ id: "older", captured_at: "2026-06-01T05:17:00.000Z" }),
    record({ id: "stored-receipt", captured_at: timestamp }),
  ]);
  assert.equal(quote.proofId, "stored-receipt");
  assert.equal(quote.capturedAt, timestamp);
  assert.equal(quote.status, "stale");
  assert.equal(quote.eligibleForPriceRanking, false);
  assert.equal(select([record({ status: "stale" })])[0].status, "stale");
});

test("never creates a row without usable stored evidence and skips a malformed newer record", () => {
  assert.deepEqual(select([]), []);
  assert.deepEqual(select([record({ status: "invalid" })]), []);
  const badRows = [
    { id: "" }, { provider_slug: "" }, { provider_name: " " }, { recipient_amount: 0 },
    { recipient_amount: NaN }, { exchange_rate: Infinity }, { exchange_rate: 0 },
    { fee_amount: -1 }, { fee_amount: null as never }, { fee_currency: "" },
    { funding_method: "" }, { promotion: 2 }, { captured_at: "not-a-date" },
    { captured_at: "2026-02-30T11:00:00.000Z" }, { captured_at: "2026-09-28T24:00:00.000Z" },
    { captured_at: "2026-09-28T11:00:00" },
  ];
  for (const changes of badRows) {
    assert.equal(isUsableDisplayRecord(corridor, record(changes), now), false, JSON.stringify(changes));
    assert.equal(select([
      record({ id: "older-valid", captured_at: "2026-09-27T10:00:00.000Z" }), record(changes),
    ])[0].proofId, "older-valid");
  }
});

test("skips wrong transfer cases and future captures even when a provider has an older usable record", () => {
  for (const changes of [
    { corridor_slug: "uk-to-france" }, { source_amount: 1000 }, { source_currency: "EUR" },
    { recipient_currency: "USD" }, { captured_at: "2026-09-28T12:00:00.001Z" },
  ]) {
    const [quote] = select([record(changes), record({ id: "valid-fallback", captured_at: "2026-09-27T09:00:00.000Z" })]);
    assert.equal(quote.proofId, "valid-fallback");
    assert.equal(quote.status, "stale");
  }
});

test("uses UTC midnight rather than the existing 36-hour freshness window", () => {
  const boundary = Date.parse("2026-09-28T00:00:00.000Z");
  const [yesterday] = select([record({ captured_at: "2026-09-27T23:59:59.999Z" })], boundary);
  assert.equal(yesterday.status, "stale");
  assert.equal(yesterday.eligibleForPriceRanking, false);
  const [today] = select([record({ captured_at: "2026-09-28T00:00:00.000Z" })], boundary);
  assert.equal(today.status, "verified");
});

test("orders offset timestamps chronologically and keeps their original receipt timestamp", () => {
  const [quote] = select([
    record({ id: "canonical", captured_at: "2026-09-28T10:00:00.000Z" }),
    record({ id: "offset", captured_at: "2026-09-28T09:30:00-02:00" }),
    record({ id: "offset-future", captured_at: "2026-09-28T11:00:00-02:00" }),
  ]);
  assert.equal(quote.proofId, "offset");
  assert.equal(quote.capturedAt, "2026-09-28T09:30:00-02:00");
  assert.equal(quote.status, "verified");
  assert.equal(select([record({ captured_at: "2026-09-28T00:30:00+01:00" })])[0].status, "stale");
});

test("accepts one through nine fractional-second digits without rewriting receipt timestamps", () => {
  for (let digits = 1; digits <= 9; digits += 1) {
    const capturedAt = `2026-09-28T10:44:50.${"862909123".slice(0, digits)}Z`;
    const row = record({ captured_at: capturedAt });
    assert.equal(isUsableDisplayRecord(corridor, row, now), true, capturedAt);
    const [quote] = select([row]);
    assert.equal(quote.capturedAt, capturedAt);
    assert.equal(quote.status, "verified");
  }
  const offset = "2026-09-28T12:44:50.862909+02:00";
  assert.equal(select([record({ captured_at: offset })])[0].capturedAt, offset);
});

test("higher timestamp precision does not admit malformed dates, missing timezones or future captures", () => {
  for (const captured_at of [
    "2026-09-28T10:44:50.8629091234Z",
    "2026-09-28T10:44:50.Z",
    "2026-09-28T10:44:50.862909",
    "2026-02-30T10:44:50.862909Z",
    "2026-09-28T24:00:00.862909Z",
    "2026-09-28T10:60:00.862909Z",
    "2026-09-28T12:00:00.001001Z",
  ]) {
    assert.equal(isUsableDisplayRecord(corridor, record({ captured_at }), now), false, captured_at);
  }
});

test("a newer microsecond receipt replaces an older millisecond result and preserves its evidence type", () => {
  const capturedAt = "2026-09-28T10:44:50.862909Z";
  const [quote] = select([
    record({ id: "z-older-verified", captured_at: "2026-09-28T10:43:00.000Z" }),
    record({ id: "a-latest-indicative", quote_type: "indicative", captured_at: capturedAt }),
  ]);
  assert.equal(quote.proofId, "a-latest-indicative");
  assert.equal(quote.capturedAt, capturedAt);
  assert.equal(quote.status, "indicative");
  assert.equal(quote.eligibleForPriceRanking, false);

  const historical = "2026-09-27T10:44:50.862909Z";
  const [older] = select([
    record({ id: "older-millis", captured_at: "2026-09-27T10:43:00.000Z" }),
    record({ id: "latest-history", captured_at: historical }),
  ]);
  assert.equal(older.proofId, "latest-history");
  assert.equal(older.capturedAt, historical);
  assert.equal(older.status, "stale");
  assert.equal(older.eligibleForPriceRanking, false);
});

test("a new promotional result remains selected without reviving an older ranked quote", () => {
  const [quote] = select([
    record({ id: "previous", captured_at: "2026-09-28T10:00:00.000Z" }),
    record({ id: "promotion", promotion: 1 }),
  ]);
  assert.equal(quote.proofId, "promotion");
  assert.equal(quote.eligibleForPriceRanking, false);
});

function sqliteRecords(rows: DisplayQuoteRecord[]) {
  const db = new DatabaseSync(":memory:");
  const keys = Object.keys(record());
  const numeric = new Set(["source_amount", "recipient_amount", "fee_amount", "exchange_rate", "promotion"]);
  db.exec(`CREATE TABLE quotes (${keys.map((key) => `${key} ${numeric.has(key) ? "REAL" : "TEXT"}`).join(", ")})`);
  const insert = db.prepare(`INSERT INTO quotes (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`);
  for (const row of rows) insert.run(...keys.map((key) => row[key as keyof DisplayQuoteRecord]));
  let transferred = 0;
  const query = async (sql: string, params: unknown[]) => {
    const result = db.prepare(sql).all(...params as SQLInputValue[]) as DisplayQuoteRecord[];
    transferred += result.length;
    return result;
  };
  return { db, query, transferred: () => transferred };
}

test("the SQLite query returns one candidate per provider across uncapped history", async (t) => {
  const stored = sqliteRecords([
    ...Array.from({ length: 120 }, (_, index) => record({ id: `wise-${index}`, captured_at: new Date(now - index * 86400000).toISOString() })),
    record({ id: "rare-provider", provider_slug: "rare", captured_at: "2025-01-01T00:00:00.000Z" }),
  ]);
  t.after(() => stored.db.close());
  const rows = await loadDisplayQuoteRecords(stored.query, corridor, now);
  assert.deepEqual(rows.map((row) => row.id).sort(), ["rare-provider", "wise-0"]);
  assert.equal(stored.transferred(), 2);
});

test("the SQLite query walks past malformed newer records and merges noncanonical timestamps", async (t) => {
  const stored = sqliteRecords([
    record({ id: "bad-newest", fee_currency: "invalid" }),
    record({ id: "bad-second", provider_name: "", captured_at: "2026-09-28T10:30:00.000Z" }),
    record({ id: "canonical-good", captured_at: "2026-09-28T10:00:00.000Z" }),
    record({ id: "offset-good", captured_at: "2026-09-28T09:15:00-02:00" }),
    record({ id: "future", captured_at: "2026-09-28T13:00:00.000Z" }),
    record({ id: "wrong-case", source_amount: 1000, captured_at: "2026-09-28T11:59:00.000Z" }),
    record({ id: "invalid", status: "invalid", captured_at: "2026-09-28T11:58:00.000Z" }),
  ]);
  t.after(() => stored.db.close());
  const rows = await loadDisplayQuoteRecords(stored.query, corridor, now);
  assert.deepEqual(rows.map((row) => row.id).sort(), ["canonical-good", "offset-good"]);
  assert.equal(select(rows)[0].proofId, "offset-good");
});

test("the SQLite history path returns a newer microsecond quote alongside the canonical candidate", async (t) => {
  const timestamp = "2026-09-28T10:44:50.862909Z";
  const stored = sqliteRecords([
    record({ id: "older-canonical", captured_at: "2026-09-27T10:43:00.000Z" }),
    record({ id: "latest-microseconds", captured_at: timestamp }),
    record({ id: "other-provider", provider_slug: "xe", captured_at: "2026-09-28T10:30:00.123456789Z" }),
  ]);
  t.after(() => stored.db.close());
  const quotes = select(await loadDisplayQuoteRecords(stored.query, corridor, now));
  assert.equal(quotes.length, 2);
  assert.equal(quotes.find((quote) => quote.providerSlug === "wise")?.proofId, "latest-microseconds");
  assert.equal(quotes.find((quote) => quote.providerSlug === "wise")?.capturedAt, timestamp);
  assert.equal(quotes.find((quote) => quote.providerSlug === "xe")?.proofId, "other-provider");
});

test("corridor snapshots count current high-precision evidence without ranking indicative or historical rows", () => {
  const snapshot = buildCorridorSnapshots([
    record({ id: "wise-old", captured_at: "2026-09-28T10:00:00.000Z" }),
    record({ id: "wise-new", quote_type: "indicative", captured_at: "2026-09-28T10:44:50.862909Z" }),
    record({ id: "xe-new", provider_slug: "xe", recipient_amount: 235, captured_at: "2026-09-28T11:00:00.123456789Z" }),
    record({ id: "remitly-new", provider_slug: "remitly", quote_type: "indicative", captured_at: "2026-09-28T10:30:00.123456Z" }),
    record({ id: "historic", provider_slug: "historical", captured_at: "2026-09-27T23:59:59.999999Z" }),
  ], now).find((candidate) => candidate.slug === corridor.slug)!;
  assert.equal(snapshot.currentProviders, 3);
  assert.equal(snapshot.verifiedProviders, 1);
  assert.equal(snapshot.bestRecipient, 235);
  assert.equal(snapshot.recipientGap, null);
  assert.equal(snapshot.latestCapturedAt, "2026-09-28T11:00:00.123Z");
});
