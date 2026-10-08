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
let returnedEvidence = [];
function loadSource(path) {
  const filename = [path, path + ".ts", path + ".tsx", path + ".json"].find(existsSync);
  assert.ok(filename, "Actual application source must exist: " + path);
  if (modules.has(filename)) return modules.get(filename).exports;
  if (filename.endsWith(".json")) return JSON.parse(readFileSync(filename, "utf8"));
  const mod = { exports: {} };
  modules.set(filename, mod);
  const { outputText, diagnostics } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  assert.equal(diagnostics?.filter((d) => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
  const localRequire = (specifier) => {
    if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => key }) };
    // Keep the page and all rendering code real; replace only its database-backed input.
    if (specifier === "@/lib/live-data") return { getProviderRateEvidence: async () => returnedEvidence };
    if (specifier.startsWith("@/")) return loadSource(resolve(root, specifier.slice(2)));
    if (specifier.startsWith(".")) return loadSource(resolve(dirname(filename), specifier));
    return nativeRequire(specifier);
  };
  new Function("require", "module", "exports", outputText)(localRequire, mod, mod.exports);
  return mod.exports;
}

const { getReviewMaterialUpdatedAt, getReviewServiceUpdatedAt, reviewDateLabel, summariseProviderRateEvidence } = loadSource(resolve(root, "lib/provider-evidence-summary.ts"));
const { ProviderEvidenceSummary } = loadSource(resolve(root, "components/ProviderEvidenceSummary.tsx"));
const { providerReviews, getProviderReview } = loadSource(resolve(root, "lib/reviews.ts"));
const { getCustomerReviewEvidence } = loadSource(resolve(root, "lib/customer-reviews.ts"));
const { default: ReviewPage, generateMetadata } = loadSource(resolve(root, "app/reviews/[slug]/page.tsx"));

const quote = (extra = {}) => ({
  id: "sample-quote", corridorSlug: "uk-to-india",
  sourceAmount: 200, sourceCurrency: "GBP", recipientAmount: 22000, recipientCurrency: "INR",
  feeAmount: 1, feeCurrency: "GBP", exchangeRate: 110,
  quoteType: "verified", capturedAt: "2026-10-05T12:00:00.000Z", deliveryEstimate: "Check provider",
  fundingMethod: "bank transfer", payoutMethod: "bank deposit", promotion: false,
  eligibleForPriceRanking: true, bestVerifiedRecipient: 22000, bestVerifiedProvider: "Wise", matchedCompetitors: 2,
  ...extra,
});
const wise = getProviderReview("wise");
const wiseCustomer = getCustomerReviewEvidence("wise");
const renderSummary = (changes = {}) => renderToStaticMarkup(createElement(ProviderEvidenceSummary, {
  review: wise, customer: wiseCustomer, evidence: [], ...changes,
}));
const extractReview = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1])).find((item) => item["@type"] === "Review");

test("material dates use the later real assessment date, not a fixed preference for customer evidence", () => {
  assert.equal(getReviewMaterialUpdatedAt({ reviewedAt: "2026-10-01" }, { checkedAt: "2026-09-29" }), "2026-10-01");
  assert.equal(getReviewMaterialUpdatedAt({ reviewedAt: "2026-09-25" }, { checkedAt: "2026-09-29" }), "2026-09-29");
  assert.equal(getReviewMaterialUpdatedAt({}, null), "2026-07-23");
  assert.equal(getReviewServiceUpdatedAt(wise), "2026-07-23");
  assert.equal(getReviewMaterialUpdatedAt(wise, wiseCustomer), "2026-09-29");
  assert.equal(reviewDateLabel("2026-09-29"), "29 September 2026");
});

test("invalid or rollover dates cannot replace the recorded assessment date", () => {
  assert.equal(getReviewMaterialUpdatedAt({ reviewedAt: "2026-02-30" }, { checkedAt: "unknown" }), "2026-07-23");
  assert.equal(getReviewMaterialUpdatedAt({ reviewedAt: "2026-02-28" }, { checkedAt: "2026-02-29" }), "2026-02-28");
  assert.equal(getReviewMaterialUpdatedAt({ reviewedAt: "2024-02-29" }, null), "2024-02-29");
});

test("counts preserve eligibility and require a like-for-like rival before claiming a price win", () => {
  const result = summariseProviderRateEvidence("Wise", [
    quote(),
    quote({ id: "second", corridorSlug: "uk-to-spain", bestVerifiedProvider: "Another provider" }),
    quote({ id: "alone", corridorSlug: "uk-to-france", matchedCompetitors: 1 }),
    quote({ id: "estimate", corridorSlug: "uk-to-germany", quoteType: "indicative", eligibleForPriceRanking: false }),
  ]);
  assert.equal(result.routeCount, 4);
  assert.equal(result.quoteCount, 3);
  assert.equal(result.comparableCount, 2);
  assert.equal(result.wins, 1);
  assert.match(result.finding, /recorded amount, currencies and payment methods/);
  assert.equal(summariseProviderRateEvidence("Wise", [quote({ matchedCompetitors: 1 })]).comparableCount, 0);
});

test("latest capture uses the timestamp rather than lexicographic order", () => {
  const result = summariseProviderRateEvidence("Wise", [
    quote({ capturedAt: "2026-10-05T22:05:00+01:00" }),
    quote({ capturedAt: "2026-10-05T21:45:00Z" }),
    quote({ capturedAt: "invalid" }),
  ]);
  assert.equal(result.latest, "2026-10-05T21:45:00Z");
});

test("collected estimates are explicit before the limit on price ranking", () => {
  const evidence = Array.from({ length: 48 }, (_, index) => quote({
    id: "estimate-" + index, corridorSlug: "route-" + index,
    quoteType: "indicative", eligibleForPriceRanking: false,
  }));
  const result = summariseProviderRateEvidence("Wise", evidence);
  assert.equal(result.routeCount, 48);
  assert.equal(result.indicativeCount, 48);
  assert.equal(result.quoteCount, 0);
  assert.equal(result.otherUnrankedCount, 0);
  assert.equal(result.comparableCount, 0);
  assert.equal(result.wins, 0);
  assert.match(result.finding, /^We have collected 48 recent route records for Wise: 48 indicative estimates\./);
  assert.ok(result.finding.indexOf("48 indicative estimates") < result.finding.indexOf("none qualifies"));
  const html = renderSummary({ evidence });
  assert.match(html, /Collected route records in the past 36 hours<\/dt><dd>48<\/dd>/);
  assert.match(html, /Indicative estimates<\/dt><dd>48<\/dd>/);
  assert.match(html, /Quotes eligible for price ranking<\/dt><dd>0<\/dd>/);
  assert.match(html, /rolling 36-hour window/);
  assert.match(html, /Route tables rank today’s UTC records and retain older results in grey/);
  assert.match(html, /Modelled prices, converter rates and introductory offers cannot win/);
  assert.match(html, /Not assessed/);
  assert.doesNotMatch(html, /No recent price evidence|Other records not ranked/);
});

test("mixed evidence uses exclusive count categories and labels promotions as a subset", () => {
  const evidence = [
    quote(),
    quote({ quoteType: "indicative", eligibleForPriceRanking: false }),
    quote({ quoteType: "indicative", promotion: true, eligibleForPriceRanking: false }),
    quote({ fundingMethod: "debit card", eligibleForPriceRanking: false }),
    quote({ promotion: true, eligibleForPriceRanking: false }),
  ];
  const result = summariseProviderRateEvidence("Wise", evidence);
  assert.equal(result.routeCount, 5);
  assert.equal(result.indicativeCount, 2);
  assert.equal(result.quoteCount, 1);
  assert.equal(result.otherUnrankedCount, 2);
  assert.equal(result.promotionCount, 2);
  assert.equal(result.indicativeCount + result.quoteCount + result.otherUnrankedCount, result.routeCount);
  assert.equal(result.comparableCount, 1);
  assert.equal(result.wins, 1);
  assert.match(result.finding, /2 indicative estimates, 1 eligible bank-transfer quote and 2 other unranked records/);
  assert.match(result.finding, /2 of these records are promotional/);
  assert.match(renderSummary({ evidence }), /Other records not ranked<\/dt><dd>2<\/dd>/);
  const single = summariseProviderRateEvidence("Wise", [evidence[2]]);
  assert.match(single.finding, /1 recent route record for Wise: 1 indicative estimate\./);
  assert.match(single.finding, /1 of these records is promotional/);
});

test("missing price evidence does not assert zero coverage or provider unavailability", () => {
  const html = renderSummary({ customer: null });
  assert.match(html, /No recent price evidence is available for Wise in this review/);
  assert.match(html, /does not establish that the provider cannot offer your transfer/);
  assert.match(html, /No sourced customer-feedback assessment is available/);
  assert.match(html, /Not available/);
  assert.doesNotMatch(html, /<dd>0<\/dd>|0 monitored|0 routes|0\/0|Published customer score/);
});

test("customer source, assessment dates and transfer versus broader-company scopes remain explicit", () => {
  const html = renderSummary({ evidence: [quote()] });
  assert.match(html, /Service assessment dated/);
  assert.match(html, /datetime="2026-07-23"/i);
  assert.match(html, /datetime="2026-09-29"/i);
  assert.match(html, /datetime="2026-10-05T12:00:00.000Z"/i);
  assert.ok(html.includes(wiseCustomer.sourceUrl));
  assert.match(html, /whole company, including products beyond transfers/);
  assert.match(html, /self-selected reports, not independently verified transfer outcomes/);
  assert.match(html, /href="#provider-rate-evidence"/);
  assert.match(html, /href="#provider-sources"/);
  assert.match(html, /href="#customer-reviews"/);
  assert.match(renderSummary({ customer: { ...wiseCustomer, scope: "transfer-service" } }), /reports may cover other routes and payment methods/);
  assert.match(renderSummary({ customer: { ...wiseCustomer, scope: "parent-company" } }), /cannot rate this service separately/);
  assert.match(renderSummary({ customer: { ...wiseCustomer, scope: "limited" } }), /too limited to describe a typical customer/);
  assert.doesNotMatch(html, /aggregateRating|application\/ld\+json|Best Rated|4\.7/);
});

test("broker summaries preserve the need for a customer-specific quote", () => {
  const review = getProviderReview("currenciesdirect");
  assert.ok(review);
  const html = renderSummary({ review, customer: getCustomerReviewEvidence(review.slug) });
  assert.match(html, /customer-specific rate requires an account or a quote/);
  assert.match(html, /Published pricing model/);
  assert.doesNotMatch(html, /captured quote available|price winner/);
});

test("all 40 actual review pages render the summary and agree on visible, metadata and schema dates", async () => {
  assert.equal(providerReviews.length, 40);
  returnedEvidence = [];
  for (const review of providerReviews) {
    const customer = getCustomerReviewEvidence(review.slug);
    const expectedDate = getReviewMaterialUpdatedAt(review, customer);
    const params = Promise.resolve({ slug: review.slug });
    const html = renderToStaticMarkup(await ReviewPage({ params }));
    const metadata = await generateMetadata({ params });
    const schema = extractReview(html);
    assert.ok(schema, review.slug + " Review schema");
    assert.equal(schema.dateModified, expectedDate, review.slug);
    assert.equal(metadata.openGraph.modifiedTime, expectedDate, review.slug);
    assert.ok(html.includes('Updated <time dateTime="' + expectedDate + '"') || html.includes('Updated <time datetime="' + expectedDate + '"'), review.slug + " visible date");
    assert.equal((html.match(/id="provider-evidence-summary"/g) ?? []).length, 1, review.slug);
    for (const id of ["provider-rate-evidence", "provider-sources", "customer-reviews"]) assert.ok(html.includes('id="' + id + '"'), review.slug + " link target " + id);
    assert.match(html, /What this evidence shows/);
    assert.match(html, /rolling 36-hour window/);
    assert.ok(html.includes('href="/go/' + review.slug + '?placement=review-hero"'), review.slug + " commercial placement preserved");
    assert.equal(schema.author.name, review.byline ?? "Russell Gous");
    if (review.rating === null) assert.equal(schema.reviewRating, undefined);
    else assert.equal(schema.reviewRating.ratingValue, review.rating);
    assert.ok(html.includes(customer.checkedAt), review.slug + " source date preserved");
  }
});

test("a new capture does not silently move the editorial update date", async () => {
  returnedEvidence = [quote({ capturedAt: "2026-10-06T09:00:00.000Z" })];
  try {
    const params = Promise.resolve({ slug: "wise" });
    const html = renderToStaticMarkup(await ReviewPage({ params }));
    assert.equal(extractReview(html).dateModified, "2026-09-29");
    assert.match(html, /6 Oct 2026/);
    assert.match(html, /29 September 2026/);
    assert.match(html, /id="provider-rate-evidence"/);
  } finally {
    returnedEvidence = [];
  }
});
