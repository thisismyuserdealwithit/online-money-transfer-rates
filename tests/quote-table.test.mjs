import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Exercise the actual components without a production build or a database.
// TypeScript is already a project dependency; only Cloudflare's environment
// module is replaced. React, Next Link and local application modules are real.
// Run: node --test tests/quote-table.test.mjs
const nativeRequire = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceModules = new Map();

function loadSource(path) {
  const filename = [path, `${path}.ts`, `${path}.tsx`].find((candidate) => existsSync(candidate));
  assert.ok(filename, `Application module must exist: ${path}`);
  if (sourceModules.has(filename)) return sourceModules.get(filename).exports;
  const loadedModule = { exports: {} };
  sourceModules.set(filename, loadedModule);
  const { outputText, diagnostics } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  assert.equal(diagnostics?.filter((entry) => entry.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
  const localRequire = (specifier) => {
    if (specifier === "cloudflare:workers") return { env: {} };
    if (specifier.startsWith("@/")) return loadSource(resolve(projectRoot, specifier.slice(2)));
    if (specifier.startsWith(".")) return loadSource(resolve(dirname(filename), specifier));
    return nativeRequire(specifier);
  };
  new Function("require", "module", "exports", outputText)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { QuoteTable } = loadSource(resolve(projectRoot, "components/QuoteTable.tsx"));
const { getCorridor, monitoredProviders } = loadSource(resolve(projectRoot, "lib/data.ts"));
const corridor = getCorridor("uk-to-spain");

export function quote(overrides = {}) {
  return {
    provider: "Wise",
    providerSlug: "wise",
    mark: "WI",
    sourceAmount: 200,
    sourceCurrency: "GBP",
    recipientCurrency: "EUR",
    rate: 1.16,
    fee: 1.25,
    feeCurrency: "GBP",
    recipientGets: 230.55,
    delivery: "Within one business day",
    capturedAt: "2026-09-28T11:00:00.000Z",
    checkedAt: "28 Sept 2026, 11:00 UTC",
    status: "verified",
    proofId: "wise-today",
    fundingMethod: "bank transfer",
    payoutMethod: "bank deposit",
    promotion: false,
    eligibleForPriceRanking: true,
    ...overrides,
  };
}

export const historicalXe = quote({
  provider: "Xe",
  providerSlug: "xe",
  mark: "XE",
  recipientGets: 999,
  capturedAt: "2026-09-27T11:00:00.000Z",
  checkedAt: "27 Sept 2026, 11:00 UTC",
  status: "stale",
  proofId: "xe-yesterday",
  eligibleForPriceRanking: false,
});

export function render(quotes, compact = false, resultsAvailable = true) {
  return renderToStaticMarkup(createElement(QuoteTable, { corridor: { ...corridor, quotes }, compact, resultsAvailable }));
}

function providerRows(html) {
  return [...html.matchAll(/<article\b[^>]*class="quote-row\b[^\"]*"[^>]*>[\s\S]*?<\/article>/g)]
    .map((match) => match[0]);
}

function tmcCount(html) {
  return [...html.matchAll(/class="tmc-compare-row"/g)].length;
}

test("shows current records before an older Xe result and preserves its dated receipt", () => {
  const indicative = quote({
    provider: "TransferGo", providerSlug: "transfergo", mark: "TG",
    status: "indicative", eligibleForPriceRanking: false, proofId: "transfergo-today",
  });
  const rows = providerRows(render([historicalXe, indicative, quote()]));
  assert.equal(rows.length, 3, "only providers with stored results get rows");
  assert.match(rows[0], /href="\/reviews\/wise"/);
  assert.match(rows[0], /Comparable completed bank-transfer quote/);
  assert.match(rows[1], /href="\/reviews\/transfergo"/);
  assert.match(rows[1], /Calculator evidence only/);
  assert.doesNotMatch(rows[0] + rows[1], /quote-historical/);

  const older = rows[2];
  assert.match(older, /href="\/reviews\/xe"/);
  assert.match(older, /quote-historical/);
  assert.match(older, /quote-muted/);
  assert.match(older, /Previous result · not a current quote/);
  assert.match(older, /27 Sept 2026, 11:00 UTC/);
  assert.match(older, /<a\b(?=[^>]*href="\/uk-to-spain\/receipts\/xe-yesterday")(?=[^>]*class="proof-link")[^>]*>Open receipt<\/a>/);
  assert.doesNotMatch(older, /disabled-proof|aria-disabled|Pending|Comparable completed bank-transfer quote/);
});

test("a historical promotion is labelled as an older result while retaining its qualification", () => {
  const html = render([quote({
    provider: "Remitly", providerSlug: "remitly", mark: "RM", status: "stale",
    eligibleForPriceRanking: false, promotion: true, proofId: "remitly-older-promotion",
    capturedAt: "2026-09-20T10:00:00.000Z", checkedAt: "20 Sept 2026, 10:00 UTC",
    note: "First-transfer promotion; not available to every customer.",
  })]);
  const [older] = providerRows(html);
  assert.match(older, /Previous result · not a current quote/);
  assert.match(older, /20 Sept 2026, 10:00 UTC/);
  assert.match(older, /First-transfer promotion; not available to every customer/);
  assert.match(older, /href="\/uk-to-spain\/receipts\/remitly-older-promotion"/);
});

test("providers without history have no placeholder rows and one collapsed explanatory note", () => {
  const html = render([]);
  assert.equal(providerRows(html).length, 0);
  assert.doesNotMatch(html, /quote-unavailable|Not quoted|No rate to compare|No receipt/);
  const notes = [...html.matchAll(/<details\b[^>]*class="quote-missing-note"[^>]*>[\s\S]*?<\/details>/g)];
  assert.equal(notes.length, 1);
  assert.doesNotMatch(notes[0][0].match(/^<details[^>]*>/)[0], /\bopen(?:\s|=|>)/);
  assert.match(notes[0][0], new RegExp(`${monitoredProviders.length} monitored providers have no saved result for this transfer`));
  assert.match(notes[0][0], /This does not mean the provider cannot offer the transfer/);
  assert.doesNotMatch(html, /href="\/reviews\/(?:xe|wise)"/);
  assert.match(html, /No saved results for this transfer yet/);
});

test("the omitted-provider note excludes providers whose older results remain visible", () => {
  const html = render([quote(), historicalXe]);
  const note = html.match(/<details\b[^>]*class="quote-missing-note"[^>]*>([\s\S]*?)<\/details>/)[1];
  assert.match(note, new RegExp(`${monitoredProviders.length - 2} monitored providers have no saved result`));
  assert.doesNotMatch(note, /\bWise\b|\bXe\b/);
});

test("a failed results lookup is not described as missing provider history", () => {
  const html = render([], false, false);
  assert.match(html, /Saved results are temporarily unavailable\. Please try again shortly\./);
  assert.equal(providerRows(html).length, 0);
  assert.doesNotMatch(html, /quote-missing-note|No saved results for this transfer yet|providers have no saved result/);
  assert.equal(tmcCount(html), 1);
});

test("a stored provider without a review remains plain text with a working receipt", () => {
  const html = render([quote({
    provider: "Unreviewed Transfer", providerSlug: "unreviewed-transfer", mark: "UT",
    proofId: "unreviewed-transfer-today",
  })]);
  assert.match(html, /<strong>Unreviewed Transfer<\/strong>/);
  assert.doesNotMatch(html, /href="\/reviews\/unreviewed-transfer"/);
  assert.match(html, /href="\/uk-to-spain\/receipts\/unreviewed-transfer-today"/);
});

test("full tables keep exactly one TopMoneyCompare link with, without or before Xe history", () => {
  for (const quotes of [[], [quote()], [historicalXe], [quote(), historicalXe]]) {
    const html = render(quotes);
    assert.equal(tmcCount(html), 1);
    assert.match(html, /href="https:\/\/www\.topmoneycompare\.co\.uk\/transfer-money\/united-kingdom-to-spain\?amount=200"/);
  }
});

test("compact tables never show TopMoneyCompare, including empty and historical-only tables", () => {
  for (const quotes of [[], [quote()], [historicalXe], [quote(), historicalXe]]) {
    assert.equal(tmcCount(render(quotes, true)), 0);
  }
});

test("Xe placement uses its stable slug when its display name changes", () => {
  const html = render([quote(), { ...historicalXe, provider: "XE" }]);
  const older = providerRows(html)[1];
  assert.match(older, /quote-featured/);
  assert.match(older, /href="\/reviews\/xe"/);
  assert.equal(tmcCount(html), 1);
});
