import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceModules = new Map();

// Load the real TypeScript data and registry, without a build or database.
function loadSource(path) {
  const filename = [path, path + ".ts"].find((candidate) => existsSync(candidate));
  assert.ok(filename, "Application module must exist: " + path);
  if (sourceModules.has(filename)) return sourceModules.get(filename).exports;
  const loadedModule = { exports: {} };
  sourceModules.set(filename, loadedModule);
  const { outputText, diagnostics } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  assert.equal(diagnostics?.filter((entry) => entry.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
  const localRequire = (specifier) => specifier.startsWith(".")
    ? loadSource(resolve(dirname(filename), specifier))
    : nativeRequire(specifier);
  new Function("require", "module", "exports", outputText)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { customerReviewEvidence, getCustomerReviewEvidence, providerComparisonProfiles } =
  loadSource(resolve(projectRoot, "lib/customer-reviews.ts"));
const { providerReviews } = loadSource(resolve(projectRoot, "lib/reviews.ts"));

test("all 40 registered providers have one evidence record, with no orphan or duplicate", () => {
  const expected = providerReviews.map((provider) => provider.slug).sort();
  const actual = customerReviewEvidence.map((evidence) => evidence.providerSlug).sort();
  assert.equal(expected.length, 40);
  assert.equal(actual.length, 40);
  assert.equal(new Set(actual).size, actual.length);
  assert.deepEqual(actual, expected);
  for (const evidence of customerReviewEvidence) {
    assert.equal(getCustomerReviewEvidence(evidence.providerSlug), evidence);
  }
  assert.equal(getCustomerReviewEvidence("provider-without-a-review"), null);
});

test("research metadata has valid dates, source links and bounded platform values", () => {
  const scopes = new Set(["transfer-service", "whole-company", "parent-company", "limited"]);
  for (const evidence of customerReviewEvidence) {
    const label = evidence.providerSlug;
    assert.ok(scopes.has(evidence.scope), label + ": scope");
    assert.match(evidence.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(evidence.checkedAt + "T00:00:00.000Z").toISOString().slice(0, 10), evidence.checkedAt);
    for (const key of ["sourceLabel", "summary", "comparisonTakeaway", "evidenceNote"]) {
      assert.ok(evidence[key].trim().length > 0, label + ": " + key);
    }
    assert.equal(evidence.praise.length, 2, label + ": praise");
    assert.equal(evidence.concerns.length, 2, label + ": concerns");
    assert.ok([...evidence.praise, ...evidence.concerns].every((theme) => typeof theme === "string" && theme.trim()));
    assert.ok(evidence.score === null || (Number.isFinite(evidence.score) && evidence.score >= 0 && evidence.score <= 5), label + ": score");
    assert.ok(evidence.reviewCount === null || (Number.isInteger(evidence.reviewCount) && evidence.reviewCount >= 0), label + ": review count");
    assert.ok(evidence.sources.length > 0, label + ": sources");
    assert.ok(evidence.sources.some((source) => source.url === evidence.sourceUrl), label + ": primary source");
    for (const source of [{ label: evidence.sourceLabel, url: evidence.sourceUrl }, ...evidence.sources]) {
      assert.ok(source.label.trim());
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:", label + ": secure source URL");
      assert.ok(url.hostname.includes("."), label + ": source hostname");
    }
  }
});

test("comparison profiles preserve each provider's product facts and correctly attach evidence", () => {
  assert.equal(providerComparisonProfiles.length, providerReviews.length);
  for (const provider of providerReviews) {
    const profile = providerComparisonProfiles.find((item) => item.slug === provider.slug);
    assert.ok(profile, provider.slug);
    for (const key of ["slug", "name", "category", "bestFor", "lessSuitableFor", "rateModel", "feeModel", "delivery", "access"]) {
      assert.equal(profile[key], provider[key], provider.slug + ": " + key);
    }
    assert.equal(profile.customer, getCustomerReviewEvidence(provider.slug));
    assert.ok(profile.customer, provider.slug + ": customer evidence");
  }
});

test("broad bank and app ratings remain distinct from transfer-specific customer evidence", () => {
  const broad = ["starling", "natwestbusiness", "lloydsbusiness", "santanderuk", "hsbcuk",
    "barclays", "natwest", "rbs", "nationwide", "revolut", "monese", "paypal", "asda"];
  for (const slug of broad) {
    assert.ok(["whole-company", "parent-company"].includes(getCustomerReviewEvidence(slug).scope), slug);
  }
  const retail = getCustomerReviewEvidence("natwest");
  const business = getCustomerReviewEvidence("natwestbusiness");
  assert.equal(business.scope, "parent-company");
  assert.equal(retail.sourceUrl, business.sourceUrl);
  assert.match(business.evidenceNote, /shared/i);
  assert.equal(getCustomerReviewEvidence("moneyfex").scope, "limited");
  assert.equal(getCustomerReviewEvidence("moneyfex").score, null);
  assert.equal(getCustomerReviewEvidence("moneyfex").reviewCount, null);
  assert.equal(new URL(getCustomerReviewEvidence("skrill").sourceUrl).pathname, "/review/transfers.skrill.com");
});
