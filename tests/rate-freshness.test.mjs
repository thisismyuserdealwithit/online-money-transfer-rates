import assert from "node:assert/strict";
import test from "node:test";
import { fetchCoverage, inspectCoverage } from "../scripts/check-rate-freshness.mjs";

const now = Date.parse("2026-09-05T17:17:00Z");
const recent = "2026-09-05T05:20:00Z";
const healthy = {
  expectedCorridors: 52, populatedCorridors: 52, latestProviderRecords: 500,
  newestCaptureAt: recent,
  runs: [{ status: "completed", succeeded: 500, startedAt: "2026-09-05T05:17:00Z", completedAt: recent }],
};

test("a completed daily collection skips the recovery sweep", () => {
  assert.equal(inspectCoverage(healthy, { now }).healthy, true);
});

test("a missed morning sweep triggers recovery before receipts expire", () => {
  const yesterday = "2026-09-04T05:20:00Z";
  const coverage = { ...healthy, newestCaptureAt: yesterday,
    runs: [{ ...healthy.runs[0], startedAt: yesterday, completedAt: yesterday }] };
  assert.equal(inspectCoverage(coverage, { now }).healthy, false);
});

test("empty, incomplete, invalid and future-dated evidence triggers recovery", () => {
  for (const coverage of [null, {}, { ...healthy, populatedCorridors: 0 },
    { ...healthy, populatedCorridors: 51 }, { ...healthy, latestProviderRecords: 0 },
    { ...healthy, newestCaptureAt: "invalid" }, { ...healthy, newestCaptureAt: "2026-09-06T05:20:00Z" },
    { ...healthy, runs: [{ ...healthy.runs[0], status: "failed", succeeded: 0 }] }]) {
    assert.equal(inspectCoverage(coverage, { now }).healthy, false);
  }
});

test("post-crawl verification cannot pass using an older successful run", () => {
  assert.equal(inspectCoverage(healthy, { now, startedAfter: "2026-09-05T17:00:00Z" }).healthy, false);
  assert.equal(inspectCoverage(healthy, { now, startedAfter: "2026-09-05T05:16:00Z" }).healthy, true);
});

test("partial provider failures are acceptable when every route has fresh evidence", () => {
  const coverage = { ...healthy, runs: [{ ...healthy.runs[0], status: "partial", failed: 2 }] };
  assert.equal(inspectCoverage(coverage, { now }).healthy, true);
});

test("an unavailable coverage endpoint cannot look healthy", async () => {
  await assert.rejects(fetchCoverage("https://example.invalid/api/coverage", async () => new Response("Unavailable", { status: 503 })), /HTTP 503/);
});
