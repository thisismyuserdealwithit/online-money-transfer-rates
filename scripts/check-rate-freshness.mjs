import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const HOUR = 60 * 60 * 1000;

// Match the comparison pages: a result must belong to the current UTC day.
export function inspectCoverage(coverage, { now = Date.now(), maxAgeMs = 26 * HOUR, startedAfter } = {}) {
  const issues = [];
  const today = new Date(now).toISOString().slice(0, 10);
  const isCurrentCapture = (value) => {
    const time = Date.parse(value);
    return Number.isFinite(time) && time <= now && now - time <= maxAgeMs
      && new Date(time).toISOString().slice(0, 10) === today;
  };
  const expected = coverage?.expectedCorridors;
  const populated = coverage?.populatedCorridors;
  if (!Number.isInteger(expected) || expected < 1
    || !Number.isInteger(populated) || populated < expected) {
    issues.push(`Fresh route coverage is ${populated ?? "unknown"}/${expected ?? "unknown"}`);
  }
  if (!Number.isInteger(coverage?.latestProviderRecords) || coverage.latestProviderRecords < expected) {
    issues.push("Fresh provider records are missing");
  }
  if (!isCurrentCapture(coverage?.newestCaptureAt)) {
    issues.push("The latest receipt is missing or was not captured today (UTC)");
  }
  const routes = Array.isArray(coverage?.corridors) ? coverage.corridors : [];
  const currentRoutes = new Set(routes.filter((route) => typeof route.corridorSlug === "string"
    && route.corridorSlug && Number(route.providerCount) > 0
    && isCurrentCapture(route.latestCapturedAt)).map((route) => route.corridorSlug));
  if (!Number.isInteger(expected) || currentRoutes.size < expected) {
    issues.push(`Routes with a receipt today (UTC): ${currentRoutes.size}/${expected ?? "unknown"}`);
  }
  const runs = Array.isArray(coverage?.runs) ? coverage.runs : [];
  const completedRun = runs.find((run) => {
    const completedAt = Date.parse(run.completedAt);
    const runStartedAt = Date.parse(run.startedAt);
    return ["completed", "partial"].includes(run.status)
      && Number(run.succeeded) > 0
      && Number.isFinite(completedAt)
      && now - completedAt <= maxAgeMs
      && completedAt <= now + 5 * 60 * 1000
      && new Date(completedAt).toISOString().slice(0, 10) === today
      && (!startedAfter || (runStartedAt >= Date.parse(startedAfter) && completedAt >= runStartedAt));
  });
  if (!completedRun) issues.push("No recent completed collection with stored results");
  return { healthy: issues.length === 0, issues, expected, populated, newestCaptureAt: coverage?.newestCaptureAt ?? null };
}

export async function fetchCoverage(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    headers: { accept: "application/json", "cache-control": "no-cache" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Coverage endpoint returned HTTP ${response.status}`);
  return response.json();
}

async function main() {
  const mode = process.argv[2] ?? "verify";
  if (!["guard", "verify"].includes(mode)) throw new Error("Use guard or verify");
  let report;
  try {
    const coverage = await fetchCoverage(process.env.OMT_COVERAGE_URL ?? "https://onlinemoneytransfer.co.uk/api/coverage");
    report = inspectCoverage(coverage, { startedAfter: mode === "verify" ? process.env.OMT_CRAWL_STARTED_AT : undefined });
  } catch (error) {
    report = { healthy: false, issues: [error instanceof Error ? error.message : String(error)] };
  }
  console.log(JSON.stringify(report, null, 2));
  if (mode === "guard") {
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `should_crawl=${!report.healthy}\n`);
  } else if (!report.healthy) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
