import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const now = Date.parse("2026-10-06T12:00:00Z");
const corridor = { slug: "uk-to-united-states", testAmount: 200, fromCountry: "United Kingdom", toCountry: "United States", fromCurrency: "GBP", toCurrency: "USD" };

// Exercise actual TypeScript modules with only database access and route lookup
// replaced. The production comparison rules and response handlers stay intact.
function modules(query) {
  const cache = new Map();
  const overrides = {
    "@/lib/platform-runtime": { query },
    "@/lib/data": { getCorridor: (slug) => slug === corridor.slug ? corridor : undefined },
  };
  function load(filename) {
    filename = path.resolve(root, filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const localRequire = (specifier) => overrides[specifier] ?? (specifier.startsWith("@/") ? load(`${specifier.slice(2)}.ts`) : require(specifier));
    new Function("require", "module", "exports", output)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load;
}

function row(provider, extra = {}) {
  return { id: `receipt-${provider}`, crawl_run_id: "run-today", provider_slug: provider, provider_name: provider,
    quote_type: "verified", status: "current", source_amount: 200, source_currency: "GBP", recipient_amount: 250,
    recipient_currency: "USD", fee_amount: 1, fee_currency: "GBP", exchange_rate: 1.25, delivery_estimate: null,
    funding_method: "Bank transfer", payout_method: "Bank deposit", plan_name: null, promotion: 0,
    captured_at: "2026-10-06T11:00:00.123456Z", ...extra };
}

test("price ranks describe eligible offers, including ties, independently of Xe presentation order", async (t) => {
  t.mock.method(Date, "now", () => now);
  const load = modules(async () => [row("xe", { recipient_amount: 240 }), row("wise", { recipient_amount: 260 }), row("remitly", { recipient_amount: 260 }), row("estimate", { recipient_amount: 900, quote_type: "indicative" }), row("promotion", { recipient_amount: 800, promotion: 1 }), row("card", { recipient_amount: 700, funding_method: "Debit card" }), row("cash", { recipient_amount: 600, payout_method: "Cash pickup" })]);
  const result = await load("lib/public-rates.ts").getPublicRates(corridor, 14);
  assert.equal(result.available, true);
  assert.equal(result.current.rates[0].providerSlug, "xe");
  assert.equal(result.current.rankedRateCount, 3);
  assert.deepEqual(Object.fromEntries(result.current.rates.map((rate) => [rate.providerSlug, rate.priceRank])), { xe: 3, wise: 1, remitly: 1, estimate: null, promotion: null, card: null, cash: null });
  assert.equal(result.current.rates[0].capturedAt, "2026-10-06T11:00:00.123456Z");
});

test("a newer indicative result does not borrow the provider's older verified rank", async (t) => {
  t.mock.method(Date, "now", () => now);
  const load = modules(async () => [row("wise", { id: "older", captured_at: "2026-10-06T09:00:00Z" }), row("wise", { id: "latest", quote_type: "indicative" })]);
  const { current } = await load("lib/public-rates.ts").getPublicRates(corridor, 14);
  assert.equal(current.rates.length, 1);
  assert.equal(current.rates[0].id, "latest");
  assert.equal(current.rates[0].priceRank, null);
  assert.equal(current.rankedRateCount, 0);
});

test("the API keeps its 36-hour policy and excludes stale or mismatched offers from ranks", async (t) => {
  t.mock.method(Date, "now", () => now);
  const load = modules(async () => [row("yesterday", { captured_at: "2026-10-05T01:00:00Z" }), row("old", { captured_at: "2026-10-04T23:59:59Z", crawl_run_id: "run-old" }), row("amount", { source_amount: 1000 }), row("currency", { recipient_currency: "EUR" })]);
  const result = await load("lib/public-rates.ts").getPublicRates(corridor, 14);
  assert.deepEqual(result.current.rates.map((rate) => [rate.providerSlug, rate.priceRank]), [["yesterday", 1]]);
  const old = result.history.find((entry) => entry.id === "run-old");
  assert.equal(old.rankedRateCount, 0);
  assert.equal(old.rates[0].status, "stale");
  assert.equal(old.rates[0].priceRank, null);
});

test("a successful empty query and an unavailable store remain distinguishable", async () => {
  const empty = await modules(async () => [])("lib/public-rates.ts").getPublicRates(corridor, 14);
  const failed = await modules(async () => { throw new Error("private database detail"); })("lib/public-rates.ts").getPublicRates(corridor, 14);
  assert.equal(empty.available, true);
  assert.equal(failed.available, false);
  assert.deepEqual(empty.current, failed.current);
  assert.doesNotMatch(JSON.stringify(failed), /private database detail/);
});

test("JSON returns an uncached 503 with availability metadata when the store fails", async () => {
  const load = modules(async () => { throw new Error("database failed"); });
  const response = await load("app/api/v1/rates/[route]/route.ts").GET(new Request(`https://example.test/api/v1/rates/${corridor.slug}`), { params: Promise.resolve({ route: corridor.slug }) });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-omt-data-available"), "false");
  const body = await response.json();
  assert.equal(body.available, false);
  assert.equal(body.error, "data_unavailable");
  assert.equal(body.apiVersion, "1.0");
  assert.equal(body.current.rankedRateCount, 0);
  assert.deepEqual(body.history, []);
  assert.equal(body.useTerms.requiredLink, `https://onlinemoneytransfer.co.uk/${corridor.slug}`);
});

test("empty available JSON stays successful and unknown corridors stay 404", async () => {
  const handler = modules(async () => [])("app/api/v1/rates/[route]/route.ts").GET;
  const response = await handler(new Request("https://example.test/"), { params: Promise.resolve({ route: corridor.slug }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).available, true);
  assert.equal((await handler(new Request("https://example.test/"), { params: Promise.resolve({ route: "missing" }) })).status, 404);
});

test("CSV preserves its columns while exposing available-empty versus unavailable state", async () => {
  const responses = [];
  for (const query of [async () => [], async () => { throw new Error("database failed"); }]) {
    const handler = modules(query)("app/api/v1/rates/[route]/csv/route.ts").GET;
    responses.push(await handler(new Request("https://example.test/"), { params: Promise.resolve({ route: corridor.slug }) }));
  }
  assert.equal(responses[0].status, 200);
  assert.equal(responses[0].headers.get("x-omt-data-available"), "true");
  assert.equal(responses[1].status, 503);
  assert.equal(responses[1].headers.get("x-omt-data-available"), "false");
  assert.equal(responses[1].headers.get("cache-control"), "no-store");
  assert.match(responses[1].headers.get("access-control-expose-headers"), /X-OMT-Data-Available/);
  const bodies = await Promise.all(responses.map((response) => response.text()));
  assert.equal(bodies[0], bodies[1]);
  assert.equal(bodies[0].trim().split(",").length, 19);
  assert.match(bodies[0], /^"snapshot_id","snapshot_kind","snapshot_time","provider"/);
});
