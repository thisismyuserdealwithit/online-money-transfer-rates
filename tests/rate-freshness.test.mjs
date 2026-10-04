import assert from "node:assert/strict";
import test from "node:test";
import { fetchCoverage, inspectCoverage } from "../scripts/check-rate-freshness.mjs";

const now = Date.parse("2026-09-05T17:17:00Z");
const recent = "2026-09-05T05:20:00Z";
const healthy = {
  expectedCorridors: 52, populatedCorridors: 52, latestProviderRecords: 500,
  newestCaptureAt: recent,
  corridors: Array.from({ length: 52 }, (_, index) => ({ corridorSlug: `route-${index}`, providerCount: 1, latestCapturedAt: recent })),
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

test("yesterday's evening sweep cannot suppress today's recovery", () => {
  const yesterday = "2026-09-04T17:20:00Z";
  const coverage = { ...healthy, newestCaptureAt: yesterday,
    corridors: healthy.corridors.map((route) => ({ ...route, latestCapturedAt: yesterday })),
    runs: [{ ...healthy.runs[0], startedAt: yesterday, completedAt: yesterday }] };
  assert.equal(inspectCoverage(coverage, { now }).healthy, false);
});

test("one newly updated route cannot hide stale results on the other routes", () => {
  const coverage = { ...healthy, corridors: healthy.corridors.map((route, index) => ({
    ...route, latestCapturedAt: index === 0 ? recent : "2026-09-04T07:20:00Z",
  })) };
  for (const options of [{ now }, { now, startedAfter: "2026-09-05T05:16:00Z" }]) {
    const report = inspectCoverage(coverage, options);
    assert.equal(report.healthy, false);
    assert.ok(report.issues.some((issue) => issue.includes("1/52")));
  }
});

test("missing, duplicated and future-dated route receipts cannot pass recovery", () => {
  for (const corridors of [undefined, [], Array(52).fill(healthy.corridors[0]),
    healthy.corridors.map((route) => ({ ...route, latestCapturedAt: "2026-09-05T18:00:00Z" }))]) {
    assert.equal(inspectCoverage({ ...healthy, corridors }, { now }).healthy, false);
  }
});
