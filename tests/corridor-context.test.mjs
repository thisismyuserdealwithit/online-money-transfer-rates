import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const modules = new Map();
const database = { rows: [], error: null, calls: [] };
const environment = {
  DB: {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async all() {
              database.calls.push({ sql, params });
              if (database.error) throw database.error;
              return { results: database.rows };
            },
          };
        },
      };
    },
  },
};

// Load actual application modules, including JSON and client components.
// Only platform bindings and CSS module class names need local stand-ins.
function loadSource(path) {
  const filename = [path, path + ".ts", path + ".tsx", path + ".json"].find(existsSync);
  assert.ok(filename, "Actual application module must exist: " + path);
  if (modules.has(filename)) return modules.get(filename).exports;
  if (filename.endsWith(".json")) {
    const value = JSON.parse(readFileSync(filename, "utf8"));
    modules.set(filename, { exports: value });
    return value;
  }
  const mod = { exports: {} };
  modules.set(filename, mod);
  const { outputText, diagnostics } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  });
  assert.equal(diagnostics?.filter((item) => item.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
  const localRequire = (specifier) => {
    if (specifier === "cloudflare:workers") return { env: environment };
    if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => key }) };
    if (specifier.startsWith("@/")) return loadSource(resolve(root, specifier.slice(2)));
    if (specifier.startsWith(".")) return loadSource(resolve(dirname(filename), specifier));
    return nativeRequire(specifier);
  };
  new Function("require", "module", "exports", outputText)(localRequire, mod, mod.exports);
  return mod.exports;
}

const { corridors, getCorridor } = loadSource(resolve(root, "lib/data.ts"));
const { CorridorContext } = loadSource(resolve(root, "components/CorridorContext.tsx"));
const { CorridorComparisonExplorer } = loadSource(resolve(root, "components/CorridorComparisonExplorer.tsx"));
const { getHistoricalCorridorContext } = loadSource(resolve(root, "lib/corridor-context.ts"));
const { buildCorridorSnapshots } = loadSource(resolve(root, "lib/corridor-comparison.ts"));
const { getCorridorComparisonSnapshots } = loadSource(resolve(root, "lib/live-data.ts"));
const study = loadSource(resolve(root, "lib/last-mile-data.json"));
const now = Date.parse("2026-09-29T12:00:00.000Z");
const india = getCorridor("uk-to-india");
const pakistan = getCorridor("uk-to-pakistan");
const emptySnapshots = buildCorridorSnapshots([], now);

function record(changes = {}) {
  return {
    id: "wise-india", provider_slug: "wise", provider_name: "Wise", quote_type: "verified", status: "current",
    corridor_slug: india.slug, source_amount: 200, source_currency: "GBP", recipient_amount: 22000,
    recipient_currency: "INR", fee_amount: 1, fee_currency: "GBP", exchange_rate: 110,
    delivery_estimate: null, plan_name: null, promotion: 0,
    funding_method: "Bank transfer", payout_method: "Bank deposit", captured_at: "2026-09-29T11:00:00.000Z",
    ...changes,
  };
}

const renderContext = (corridor, snapshots = emptySnapshots, available = true) =>
  renderToStaticMarkup(createElement(CorridorContext, { corridor, snapshots, available }));
const renderExplorer = (props = {}) => renderToStaticMarkup(createElement(CorridorComparisonExplorer, {
  current: india, routes: corridors, snapshots: emptySnapshots, available: true,
  initialPeer: pakistan.slug, ...props,
}));
const cellValues = (html, label) => [...html.matchAll(new RegExp("<dt>" + label + "</dt><dd>(.*?)</dd>", "g"))].map((match) => match[1]);

test("all 52 routes render useful initial HTML, crawlable links and the route selector", () => {
  assert.equal(corridors.length, 52);
  for (const corridor of corridors) {
    const html = renderContext(corridor);
    assert.match(html, new RegExp("Comparing transfers from (?:the )?" + corridor.fromCountry + " to (?:the )?" + corridor.toCountry));
    assert.match(html, /Choose the payment method before the headline rate/);
    assert.match(html, /Read customer feedback for the problem you need solved/);
    assert.match(html, /How does this route compare/);
    assert.match(html, /href="\/compare"/);
    assert.equal((html.match(/<select\b/g) ?? []).length, 1);
    assert.equal((html.match(/<option\b/g) ?? []).length, 51);
    assert.doesNotMatch(html, /href="\/corridors\//, "links must use canonical flat route paths");
    for (const link of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const slug = link[1].slice(1);
      if (!slug.includes("/") && slug !== "compare") assert.ok(getCorridor(slug), "linked route must exist: " + slug);
    }
  }
});

test("historical benchmarks appear only on matching UK GBP outbound routes", () => {
  const withHistory = corridors.filter((corridor) => getHistoricalCorridorContext(corridor));
  assert.deepEqual(withHistory.map((corridor) => corridor.slug).sort(), [
    "uk-to-india", "uk-to-nigeria", "uk-to-pakistan", "uk-to-philippines", "uk-to-poland", "uk-to-south-africa",
  ]);
  for (const corridor of corridors) {
    const expected = corridor.fromCode === "GB" && corridor.fromCurrency === "GBP"
      && study.corridorRows.some((row) => row.code === corridor.toCode);
    assert.equal(getHistoricalCorridorContext(corridor) !== null, expected);
    assert.equal(renderContext(corridor).includes('id="historical-context-title"'), expected);
  }
  assert.equal(getHistoricalCorridorContext({ ...india, fromCode: "US" }), null);
  assert.equal(getHistoricalCorridorContext({ ...india, fromCurrency: "EUR" }), null);
  assert.equal(getHistoricalCorridorContext({ ...india, toCode: "ZZ" }), null);
});

test("study period, counts, ranking and payout observations retain their original meaning", () => {
  const context = getHistoricalCorridorContext(india);
  assert.equal(context.period, "Q3 2025");
  assert.equal(context.amountGbp, 200);
  assert.equal(context.averageCostGbp, 2.7693);
  assert.equal(context.averageCostPct, 1.3846);
  assert.equal(context.services, 28);
  assert.equal(context.firms, 12);
  assert.equal(context.rank, 1);
  assert.equal(context.totalCorridors, 33);
  assert.deepEqual(context.payouts.map(({ name, services }) => ({ name, services })), [
    { name: "Bank account", services: 19 }, { name: "Cash collection", services: 9 },
  ]);
  const philippines = getHistoricalCorridorContext(getCorridor("uk-to-philippines"));
  assert.equal(philippines.rank, 7);
  assert.deepEqual(philippines.payouts.map(({ name, services }) => ({ name, services })), [
    { name: "Bank account", services: 16 }, { name: "Cash collection", services: 17 }, { name: "Mobile wallet", services: 5 },
  ]);
  for (const corridor of corridors) {
    const result = getHistoricalCorridorContext(corridor);
    if (!result) continue;
    for (const payout of result.payouts) {
      assert.ok(payout.services > 0);
      assert.ok(Number.isFinite(payout.costPct));
    }
    assert.ok(Math.abs(result.averageCostPct * 2 - result.averageCostGbp) < 0.0002);
  }
});

test("historical peers use matching study countries and public fields exclude ITU or other unrelated indicators", () => {
  const allowed = ["period", "amountGbp", "averageCostPct", "averageCostGbp", "services", "firms", "rank", "totalCorridors", "payouts", "peers"].sort();
  for (const corridor of corridors) {
    const context = getHistoricalCorridorContext(corridor);
    if (!context) continue;
    assert.deepEqual(Object.keys(context).sort(), allowed);
    assert.doesNotMatch(JSON.stringify(context), /internetUse|ITU|accountOwnership|corruptionControl|politicalStability|ruralPopulation|gdpPerCapita|sourceUpdates/i);
    assert.equal(new Set(context.peers.map((peer) => peer.slug)).size, context.peers.length);
    assert.ok(context.peers.length <= 3);
    let previousDistance = -Infinity;
    for (const peer of context.peers) {
      const route = getCorridor(peer.slug);
      assert.equal(route.fromCode, "GB");
      assert.equal(route.fromCurrency, "GBP");
      assert.notEqual(route.toCode, corridor.toCode);
      const row = study.corridorRows.find((item) => item.code === route.toCode);
      assert.ok(row);
      assert.equal(peer.costGbp, row.avgCostGbp200);
      const distance = Math.abs(row.avgCostPct - context.averageCostPct);
      assert.ok(distance >= previousDistance);
      previousDistance = distance;
    }
  }
});

test("historical HTML preserves source credit, interpolation and limits without leaking unrelated source data", () => {
  const html = renderContext(india);
  for (const text of ["Q3 2025", "£2.77", "1.38%", "1 of 33", "£120 and £300", "linear interpolation", "not a customer transaction", "not weighted by market share", "different sets of offers", "not isolate the price", "Finofin Limited", "CC BY 4.0"]) {
    assert.ok(html.includes(text), text);
  }
  assert.match(html, /href="https:\/\/remittanceprices.worldbank.org\/"/);
  assert.match(html, /href="https:\/\/creativecommons.org\/licenses\/by\/4.0\/"/);
  assert.match(html, /href="\/research\/last-mile-tax"/);
  assert.doesNotMatch(html, /internetUsePct|IT.NET.USER.ZS|accountOwnershipPct|corruptionControlScore|politicalStabilityScore|sourceUpdates/);
});

test("an unavailable query is distinguished from a successful zero-coverage result", () => {
  const withPrices = buildCorridorSnapshots([record(), record({ id: "xe", provider_slug: "xe", recipient_amount: 21000 })], now);
  const unavailable = renderExplorer({ available: false, snapshots: withPrices });
  assert.match(unavailable, /coverage figures are temporarily unavailable/);
  assert.deepEqual(cellValues(unavailable, "Providers with a result today"), ["Unavailable", "Unavailable"]);
  assert.deepEqual(cellValues(unavailable, "Verified, standard bank offers today"), ["Unavailable", "Unavailable"]);
  assert.doesNotMatch(unavailable, /4\.55%|Latest included receipt/);
  const empty = renderExplorer();
  assert.doesNotMatch(empty, /temporarily unavailable/);
  assert.deepEqual(cellValues(empty, "Providers with a result today"), ["0", "0"]);
  assert.deepEqual(cellValues(empty, "Recipient amount spread"), ["Not enough comparable evidence", "Not enough comparable evidence"]);
  assert.doesNotMatch(empty, /0\.00%/);
});

test("one eligible provider has no spread, while two equal offers show zero without implying free transfers", () => {
  const one = renderExplorer({ snapshots: buildCorridorSnapshots([record()], now) });
  assert.equal(cellValues(one, "Verified, standard bank offers today")[0], "1");
  assert.equal(cellValues(one, "Recipient amount spread")[0], "Not enough comparable evidence");
  assert.doesNotMatch(one, /0\.00%/);
  const two = renderExplorer({ snapshots: buildCorridorSnapshots([record(), record({ id: "xe", provider_slug: "xe" })], now) });
  assert.equal(cellValues(two, "Recipient amount spread")[0], "0.00%");
  assert.match(two, /does not mean the transfer is free/);
});

test("live spreads remain identified as observed-offer ranges and different currencies are not presented as cheaper routes", () => {
  const snapshots = buildCorridorSnapshots([record(), record({ id: "xe", provider_slug: "xe", recipient_amount: 21000 })], now);
  const html = renderContext(india, snapshots);
  assert.match(html, /1,000 INR/);
  assert.match(html, /4\.55% of the highest recipient amount/);
  assert.match(html, /not the route’s total transfer cost/);
  assert.match(html, /not the exchange-rate margin/);
  assert.match(html, /Recipient amounts in different currencies are not a common measure of value/);
  const reverse = renderExplorer({ initialPeer: "india-to-uk", snapshots });
  assert.match(reverse, /different sending markets or test amounts/);
  assert.match(reverse, /cannot establish which destination is cheaper/);
});

test("the actual DB wrapper returns current validated snapshots with a bounded projection and preserves query failure", async (t) => {
  t.mock.method(Date, "now", () => now);
  t.after(() => { database.rows = []; database.error = null; database.calls = []; });
  database.rows = [
    record(),
    record({ id: "future", provider_slug: "future", captured_at: "2026-09-29T13:00:00.000Z" }),
    record({ id: "offset", provider_slug: "offset", recipient_amount: 21000, captured_at: "2026-09-29T00:30:00-01:00" }),
    record({ id: "wrong-case", provider_slug: "wrong-case", source_amount: 1000 }),
    record({ id: "invalid", provider_slug: "invalid", status: "invalid" }),
  ];
  database.error = null;
  database.calls = [];
  const result = await getCorridorComparisonSnapshots();
  assert.equal(result.available, true);
  assert.equal(result.snapshots.length, 52);
  const current = result.snapshots.find((item) => item.slug === india.slug);
  assert.equal(current.currentProviders, 2);
  assert.equal(current.verifiedProviders, 2);
  assert.equal(current.recipientGap, 1000);
  assert.equal(database.calls.length, 1);
  assert.deepEqual(database.calls[0].params, ["2026-09-27"]);
  assert.match(database.calls[0].sql, /status IN \('current', 'stale'\)/);
  assert.doesNotMatch(database.calls[0].sql, /SELECT\s+\*|raw_payload|screenshot_key|screenshot_sha256/i);

  database.rows = [];
  const empty = await getCorridorComparisonSnapshots();
  assert.equal(empty.available, true);
  assert.equal(empty.snapshots.length, 52);
  assert.ok(empty.snapshots.every((item) => item.currentProviders === 0 && item.gapPercent === null));

  database.error = new Error("Synthetic database failure");
  const unavailable = await getCorridorComparisonSnapshots();
  assert.deepEqual(unavailable, { snapshots: [], available: false });
});