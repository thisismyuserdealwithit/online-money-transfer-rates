import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const nativeRequire = createRequire(import.meta.url);
const root = process.cwd();
const modules = new Map();
let apiResult = { available: false, period: { weekEnding: "2026-10-04" } };
function load(file) {
  const filename = [file, file + ".ts", file + ".tsx"].find((name) => fs.existsSync(name));
  assert.ok(filename, file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = { exports: {} }; modules.set(filename, mod);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const localRequire = (name) => {
    if (name === "@/lib/weekly-transfer-data") return { getWeeklyReport: async () => apiResult };
    if (name.endsWith(".module.css")) return new Proxy({}, { get: (_, key) => key === "__esModule" ? false : String(key) });
    if (name === "next/link") return function TestLink({ children, href, ...props }) { return React.createElement("a", { href, ...props }, children); };
    if (["@/components/SiteHeader", "@/components/SiteFooter", "@/components/AuthorPanel"].includes(name)) return { [name.split("/").at(-1)]: () => null };
    if (name.startsWith("@/")) return load(resolve(root, name.slice(2)));
    if (name.startsWith(".")) return load(resolve(dirname(filename), name));
    return nativeRequire(name);
  };
  new Function("require", "module", "exports", output)(localRequire, mod, mod.exports);
  return mod.exports;
}
const { buildWeeklyReport } = load(resolve(root, "lib/weekly-transfer-costs.ts"));
const { WeeklyTransferReport } = load(resolve(root, "components/WeeklyTransferReport.tsx"));
const { CorridorEvidenceSummary } = load(resolve(root, "components/CorridorEvidenceSummary.tsx"));
const { corridors } = load(resolve(root, "lib/data.ts"));
const { GET } = load(resolve(root, "app/api/research/weekly-transfer-costs/route.ts"));
const now = Date.parse("2026-10-06T12:00:00Z");
const week = "2026-10-04";
const report = buildWeeklyReport([], week, now);
function receipt(changes = {}) {
  return { id: "wise-receipt", provider_slug: "wise", provider_name: "Wise", corridor_slug: "uk-to-spain", source_amount: 200, source_currency: "GBP", recipient_amount: 230, recipient_currency: "EUR", exchange_rate: 1.15, fee_amount: 1, fee_currency: "GBP", status: "stale", quote_type: "verified", promotion: 0, funding_method: "Bank transfer", payout_method: "Bank deposit", captured_at: "2026-10-01T10:00:00Z", delivery_estimate: null, plan_name: null, ...changes };
}
test("report failure does not present zero counts or a Dataset", () => {
  const html = renderToStaticMarkup(React.createElement(WeeklyTransferReport, { week, result: { available: false, period: report.period } }));
  assert.match(html, /temporarily unavailable/);
  assert.doesNotMatch(html, /provider-day records<\/span>/);
  assert.doesNotMatch(html, /application\/ld\+json/);
});
test("empty but available report explains the absence of comparable evidence", () => {
  const html = renderToStaticMarkup(React.createElement(WeeklyTransferReport, { week, result: { available: true, report } }));
  assert.match(html, /No saved observation/);
  assert.match(html, /does not support a daily price comparison/);
  assert.doesNotMatch(html, /application\/ld\+json/);
  for (const slug of report.corridors.map((item) => item.route)) assert.ok(html.includes('id="' + slug + '"'));
});
test("nonempty report exposes citation, raw evidence, scope and matching schema", () => {
  const realReport = buildWeeklyReport([receipt(), receipt({ id: "other", provider_slug: "other", provider_name: "Other", recipient_amount: 220 })], week, now);
  const html = renderToStaticMarkup(React.createElement(WeeklyTransferReport, { week, result: { available: true, report: realReport } }));
  assert.match(html, /4\.35%/);
  assert.match(html, /Across 1 comparable day/);
  assert.match(html, /not today&#x27;s prices/);
  assert.match(html, /cite-this-report/);
  assert.match(html, /weekly-transfer-costs\/2026-10-04/);
  assert.match(html, /uk-to-spain\/receipts\/wise-receipt/);
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(json["@type"], "Dataset");
  assert.ok(json.temporalCoverage.startsWith("2026-09-28"));
  assert.equal(json.distribution.length, 2);
});
test("all 52 corridor summaries render without inventing a cheapest provider", () => {
  for (const corridor of corridors) {
    const html = renderToStaticMarkup(React.createElement(CorridorEvidenceSummary, { corridor: { ...corridor, quotes: [] }, available: true }));
    assert.match(html, /does not support a cheapest-provider claim/);
    assert.ok(html.includes("evidence-summary"));
  }
});
test("one provider is explicitly insufficient to establish a price winner", () => {
  const quote = { provider: "Wise", providerSlug: "wise", recipientGets: 230, status: "verified", eligibleForPriceRanking: true, checkedAt: "1 Oct 2026, 10:00 UTC", proofId: "source" };
  const html = renderToStaticMarkup(React.createElement(CorridorEvidenceSummary, { corridor: { ...corridors[0], quotes: [quote] }, available: true }));
  assert.match(html, /One qualifying result is not enough/);
  assert.match(html, /receipts\/source/);
});
test("API rejects malformed, impossible and non-Sunday dates and unknown formats", async () => {
  for (const suffix of ["week=2026-02-30", "week=2026-10-05", "week=bad", "week=2026-10-04&format=xml"]) {
    const response = await GET(new Request("https://example.test/api?" + suffix));
    assert.equal(response.status, 400);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.equal((await GET(new Request("https://example.test/api?week=2026-09-27"))).status, 404);
});
test("API database failure is an explicit uncached 503", async () => {
  apiResult = { available: false, period: report.period };
  for (const format of ["json", "csv"]) {
    const response = await GET(new Request("https://example.test/api?week=" + week + "&format=" + format));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).available, false);
  }
});
test("available empty JSON and CSV are successful and keep the period", async () => {
  apiResult = { available: true, report };
  const response = await GET(new Request("https://example.test/api?week=" + week));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.available, true);
  assert.equal(payload.report.period.weekEnding, week);
  const csv = await GET(new Request("https://example.test/api?week=" + week + "&format=csv"));
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get("content-type"), /text\/csv/);
  assert.match(await csv.text(), /eligible_for_comparison/);
});
