import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const modules = new Map();
function loadSource(path) {
  const filename = [path, path + ".ts", path + ".tsx"].find(existsSync);
  assert.ok(filename, "Actual component source must exist");
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = { exports: {} };
  modules.set(filename, mod);
  const { outputText, diagnostics } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  assert.equal(diagnostics?.filter((d) => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
  const localRequire = (specifier) => {
    if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => key }) };
    if (specifier.startsWith("@/")) return loadSource(resolve(root, specifier.slice(2)));
    if (specifier.startsWith(".")) return loadSource(resolve(dirname(filename), specifier));
    return nativeRequire(specifier);
  };
  new Function("require", "module", "exports", outputText)(localRequire, mod, mod.exports);
  return mod.exports;
}

const { ProviderComparison } = loadSource(resolve(root, "components/ProviderComparison.tsx"));
const { CustomerReviewSection } = loadSource(resolve(root, "components/CustomerReviewSection.tsx"));
const evidence = {
  providerSlug: "alpha", checkedAt: "2026-09-29", scope: "transfer-service",
  sourceLabel: "Public review profile", sourceUrl: "https://example.com/reviews/alpha",
  score: 4.2, reviewCount: 12345, summary: "Customers describe helpful service, with some delays.",
  praise: ["Clear status updates."], concerns: ["Check recipient deductions."],
  comparisonTakeaway: "Check the payout method before choosing.",
  evidenceNote: "This synthetic sample is used only in component tests.",
  sources: [{ label: "Review methodology", url: "https://example.com/methodology" }],
};
const profile = (slug, name, customer = null) => ({
  slug, name, category: "Transfer service", bestFor: "Bank-account transfers.",
  lessSuitableFor: "Cash collection.", rateModel: "Quoted rate includes a margin.",
  feeModel: "Funding and payout methods affect fees.", delivery: "Depends on route.",
  access: "Eligibility must be checked.", customer,
});
const profiles = [profile("alpha", "Alpha Transfer", evidence), profile("beta", "Beta Transfer"), profile("gamma", "Gamma Transfer")];
const renderComparison = (props = {}) => renderToStaticMarkup(createElement(ProviderComparison, { profiles, initialLeft: "alpha", initialRight: "beta", ...props }));
const renderCustomer = (changes = {}) => renderToStaticMarkup(createElement(CustomerReviewSection, { providerName: "Alpha Transfer", evidence: { ...evidence, ...changes } }));

test("initial HTML contains useful pairwise comparisons and labelled focus controls", () => {
  const html = renderComparison();
  for (const text of ["Best suited to", "Where it may not fit", "Exchange-rate model", "Fees to compare", "Delivery", "Access and eligibility", "Quoted rate includes a margin."]) assert.ok(html.includes(text), text);
  assert.equal((html.match(/<select\b/g) ?? []).length, 2);
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1);
  assert.match(html, /These are service and pricing models, not live quotes/);
  assert.match(html, /href="\/reviews\/alpha"/);
  assert.match(html, /href="\/reviews\/beta"/);
});

test("same or invalid initial choices resolve to two distinct existing providers", () => {
  for (const props of [{ initialRight: "alpha" }, { initialLeft: "missing", initialRight: "missing" }]) {
    const html = renderComparison(props);
    const headings = [...html.matchAll(/<h3>(.*?)<\/h3>/g)].map((m) => m[1]);
    assert.deepEqual(headings, ["Alpha Transfer", "Beta Transfer"]);
  }
  const html = renderComparison({ profiles: [profiles[0]] });
  assert.match(html, /needs two published provider profiles/);
  assert.doesNotMatch(html, /<select\b/);
});

test("comparison attributes customer evidence and leaves missing assessments unscored", () => {
  const html = renderComparison();
  assert.match(html, /Published score: 4.2/);
  assert.match(html, /12,345 reviews/);
  assert.match(html, /29 September 2026/);
  assert.match(html, /https:\/\/example.com\/reviews\/alpha/);
  assert.match(html, /not yet published a sourced customer-feedback assessment for Beta Transfer/);
  assert.match(html, /separate from our editorial ratings/);
  assert.match(html, /scores do not establish an overall winner/);
  assert.doesNotMatch(html, /aggregateRating|itemprop="ratingValue"|Best Rated/);
});

test("customer section exposes date, source, themes, caveats and meaningful takeaway", () => {
  const html = renderCustomer();
  assert.match(html, /id="customer-reviews"/);
  assert.match(html, /Published customer score/);
  assert.match(html, /12,345/);
  assert.match(html, /29 September 2026/);
  assert.match(html, /Clear status updates/);
  assert.match(html, /Check recipient deductions/);
  assert.match(html, /Check the payout method before choosing/);
  assert.match(html, /self-selected reports, not a representative customer survey/);
  assert.match(html, /https:\/\/example.com\/methodology/);
  assert.doesNotMatch(html, /application\/ld\+json|aggregateRating/);
});

test("missing customer metrics stay absent and broad profile scopes stay explicit", () => {
  const html = renderCustomer({ score: null, reviewCount: null, scope: "whole-company" });
  assert.doesNotMatch(html, /Published customer score|Reviews on that profile/);
  assert.match(html, /not a transfer-only rating/);
  assert.match(renderCustomer({ scope: "parent-company" }), /not be treated as a rating of this service alone/);
  assert.match(renderCustomer({ scope: "limited" }), /available review evidence is limited/);
  assert.match(renderCustomer({ score: null, reviewCount: 0 }), /<strong>0<\/strong>/);
});