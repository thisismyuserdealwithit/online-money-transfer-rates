import assert from "node:assert/strict";
import test from "node:test";
import { UnsupportedRouteError } from "./providers/shared.mjs";
import { cacheCaptureFailure, cachedCaptureError, summarizeProviders } from "./reporting.mjs";

test("comparison quotes are counted under every emitted provider, not their source", () => {
  const providers = [{ slug: "wise" }, { slug: "wisecomparison", captureAll() {} }];
  const outcomes = [
    { provider: "wise", status: "stored" },
    { provider: "barclays", status: "stored" },
    { provider: "barclays", status: "stored" },
    { provider: "hsbc", status: "stored" },
    { provider: "wise", status: "superseded" },
    { provider: "wisecomparison", status: "unsupported" },
  ];
  const summary = summarizeProviders(providers, outcomes);
  assert.deepEqual(summary.map((row) => row.provider), ["wise", "wisecomparison", "barclays", "hsbc"]);
  assert.equal(summary.reduce((total, row) => total + row.stored, 0), 4);
  assert.deepEqual(summary.find((row) => row.provider === "wisecomparison"), {
    provider: "wisecomparison", kind: "comparison-source", stored: 0, failed: 0, unsupported: 1, errors: [],
  });
  assert.deepEqual(summary.find((row) => row.provider === "barclays"), {
    provider: "barclays", kind: "provider", stored: 2, failed: 0, unsupported: 0, errors: [],
  });
});

test("providers without quotes remain visible and failure reasons stay grouped", () => {
  const summary = summarizeProviders([{ slug: "idle" }, { slug: "failed" }], [
    { provider: "failed", status: "failed", error: "HTTP 503" },
    { provider: "failed", status: "failed", error: "HTTP 503" },
    { provider: "failed", status: "unsupported", reason: "Currency not offered" },
    { provider: "unregistered", status: "failed" },
  ]);
  assert.deepEqual(summary[0], {
    provider: "idle", kind: "provider", stored: 0, failed: 0, unsupported: 0, errors: [],
  });
  assert.equal(summary[1].failed, 2);
  assert.equal(summary[1].unsupported, 1);
  assert.deepEqual(summary[1].errors, [{ error: "HTTP 503", count: 2 }]);
  assert.deepEqual(summary[2].errors, [{ error: "Unknown failure", count: 1 }]);
});

test("an unsupported cached route remains unsupported on equivalent corridors", () => {
  const first = new UnsupportedRouteError("Bank deposit is unavailable");
  const reused = cachedCaptureError(cacheCaptureFailure(first));
  assert.ok(reused instanceof UnsupportedRouteError);
  assert.match(reused.message, /Bank deposit is unavailable/);
  const outcomes = [first, reused].map((error) => ({
    provider: "example",
    status: error instanceof UnsupportedRouteError ? "unsupported" : "failed",
  }));
  const [summary] = summarizeProviders([{ slug: "example" }], outcomes);
  assert.equal(summary.unsupported, 2);
  assert.equal(summary.failed, 0);
});

test("cached transport and parser errors remain failures", () => {
  for (const original of [new Error("ETIMEDOUT"), "Invalid provider response"]) {
    const reused = cachedCaptureError(cacheCaptureFailure(original));
    assert.ok(reused instanceof Error);
    assert.equal(reused instanceof UnsupportedRouteError, false);
    assert.ok(reused.message.includes(original instanceof Error ? original.message : original));
  }
});
