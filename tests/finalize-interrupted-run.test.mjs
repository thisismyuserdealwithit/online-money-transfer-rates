import assert from "node:assert/strict";
import test from "node:test";
import {
  REPOSITORY, WORKFLOW_PATH, INGEST_ENDPOINT, COVERAGE_URL,
  readMaintenanceConfig, validateCancelledWorkflow, validateCollectionWindow,
  planRunInterruption, finalizeInterruptedRun,
} from "../scripts/finalize-interrupted-run.mjs";

const now = Date.parse("2026-10-08T13:00:00Z");
const workflowRunId = 37774364479;
const crawlRunId = "crawl-2026-10-08-12345678";
const workflow = {
  id: workflowRunId, repository: { full_name: REPOSITORY }, head_repository: { full_name: REPOSITORY },
  path: WORKFLOW_PATH, run_attempt: 1, status: "completed", conclusion: "cancelled",
  run_started_at: "2026-10-08T12:04:51Z", updated_at: "2026-10-08T12:18:56Z",
};
const jobs = { total_count: 1, jobs: [{
  id: 113301411529, run_id: workflowRunId, run_attempt: 1, status: "completed", conclusion: "cancelled",
  started_at: "2026-10-08T12:04:54Z", completed_at: "2026-10-08T12:18:55Z",
  steps: [{ name: "Collect public rates", status: "completed", conclusion: "cancelled",
    started_at: "2026-10-08T12:18:25Z", completed_at: "2026-10-08T12:18:53Z" }],
}] };
const run = {
  id: crawlRunId, status: "running", startedAt: "2026-10-08T12:18:25.999Z", completedAt: null,
  attempted: 47, succeeded: 47, failed: 0,
};
const coverage = { runs: [run] };
const env = {
  CRAWL_RUN_ID: crawlRunId, CANCELLED_WORKFLOW_RUN_ID: String(workflowRunId), GITHUB_REPOSITORY: REPOSITORY,
  GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_TOKEN: "test-github-secret", INGEST_TOKEN: "test-ingest-secret", INGEST_ENDPOINT,
};
const inputs = { workflow, jobs, coverage, crawlRunId, workflowRunId, now };
const clone = (value) => structuredClone(value);
const plan = (changes = {}) => planRunInterruption({ ...inputs, ...changes });
const acknowledged = { crawlRunId, status: "partial", stored: true, interrupted: true };
const confirmed = { runs: [{ ...run, status: "partial", completedAt: "2026-10-08T12:18:53Z" }] };
function responses(values) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    assert.ok(values.length, "No unplanned request is allowed");
    const value = values.shift();
    if (value instanceof Error) throw value;
    return value instanceof Response ? value : Response.json(value);
  };
  return { calls, fetchImpl };
}

test("repair preserves all 47 stored receipts and uses actual collection cancellation time", () => {
  const result = plan();
  assert.equal(result.action, "finalize");
  assert.equal(result.payload.kind, "run-interruption");
  assert.equal(result.payload.interrupted, undefined);
  assert.equal(result.payload.crawlRunId, crawlRunId);
  assert.equal(result.payload.startedAt, run.startedAt);
  assert.equal(result.payload.completedAt, jobs.jobs[0].steps[0].completed_at);
  assert.deepEqual([result.payload.attempted, result.payload.succeeded, result.payload.failed], [47, 47, 0]);
  assert.match(result.payload.errorSummary, /37774364479/);
  assert.match(result.payload.errorSummary, /2026-10-08T12:18:53Z/);
  assert.match(result.payload.errorSummary, /no unobserved attempts or failures were added/);
});

test("workflow identity and confirmed cancellation are mandatory", () => {
  for (const change of [
    { id: workflowRunId + 1 }, { repository: { full_name: "different/repo" } },
    { head_repository: { full_name: "different/repo" } }, { path: ".github/workflows/other.yml" },
    { status: "in_progress" }, { conclusion: "success" }, { run_attempt: 0 },
    { run_started_at: "invalid" }, { updated_at: "2026-02-30T12:00:00Z" },
    { updated_at: "2026-10-08T14:00:00Z" }, { updated_at: "2026-10-08T12:00:00Z" },
  ]) assert.throws(() => validateCancelledWorkflow({ ...workflow, ...change }, workflowRunId, now));
});

test("only one cancelled collection step in the exact latest attempt can establish the window", () => {
  const cases = [];
  const changed = (mutate) => { const value = clone(jobs); mutate(value); cases.push(value); };
  changed((x) => { x.total_count = 2; });
  changed((x) => { x.jobs[0].steps = []; });
  changed((x) => { x.jobs[0].steps.push(clone(x.jobs[0].steps[0])); });
  changed((x) => { x.jobs[0].run_id += 1; });
  changed((x) => { x.jobs[0].run_attempt = 2; });
  changed((x) => { x.jobs[0].conclusion = "success"; });
  changed((x) => { x.jobs[0].steps[0].conclusion = "success"; });
  changed((x) => { x.jobs[0].steps[0].status = "in_progress"; });
  changed((x) => { x.jobs[0].steps[0].completed_at = null; });
  changed((x) => { x.jobs[0].steps[0].started_at = "2026-10-08T12:00:00Z"; });
  changed((x) => { x.jobs[0].steps[0].completed_at = "2026-10-08T12:18:57Z"; });
  for (const value of cases) assert.throws(() => validateCollectionWindow(workflow, value, workflowRunId, now));
});

test("missing, duplicated, misidentified or inconsistent stored runs cannot be repaired", () => {
  for (const runs of [[], [run, run], [{ ...run, id: "another" }],
    [{ ...run, startedAt: "2026-10-08T12:18:24Z" }], [{ ...run, startedAt: "2026-10-08T12:18:54Z" }],
    [{ ...run, status: "unknown" }], [{ ...run, completedAt: "2026-10-08T12:18:53Z" }],
    [{ ...run, attempted: 48 }], [{ ...run, succeeded: 46.5 }], [{ ...run, failed: -1 }],
    [{ ...run, succeeded: "47" }], [{ ...run, attempted: Infinity }]]) {
    assert.throws(() => plan({ coverage: { runs } }));
  }
});

test("every finalized state is a non-mutating no-op, without claiming its cause", () => {
  for (const status of ["partial", "completed", "failed"]) {
    const result = plan({ coverage: { runs: [{ ...run, status, completedAt: "2026-10-08T12:18:53Z" }] } });
    assert.equal(result.action, "already-finalized");
    assert.equal(result.payload, undefined);
    assert.equal(result.result.status, status);
  }
  assert.throws(() => plan({ coverage: { runs: [{ ...run, status: "partial" }] } }));
});

test("manual configuration pins repository and endpoint without disclosing credential values", () => {
  assert.equal(readMaintenanceConfig(env).workflowRunId, workflowRunId);
  for (const change of [{ CRAWL_RUN_ID: "" }, { CANCELLED_WORKFLOW_RUN_ID: "" },
    { CANCELLED_WORKFLOW_RUN_ID: "37junk" }, { CANCELLED_WORKFLOW_RUN_ID: "9007199254740992" },
    { GITHUB_REPOSITORY: "different/repo" }, { GITHUB_EVENT_NAME: "schedule" },
    { INGEST_ENDPOINT: "https://example.invalid/ingest" }, { GITHUB_TOKEN: "" }, { INGEST_TOKEN: "" }]) {
    assert.throws(() => readMaintenanceConfig({ ...env, ...change }));
  }
});
test("verified repair sends one fail-closed update, preserves counts and confirms public state", async () => {
  const mock = responses([workflow, jobs, coverage, acknowledged, confirmed]);
  const result = await finalizeInterruptedRun({ env, fetchImpl: mock.fetchImpl, now });
  assert.equal(result.action, "finalized");
  assert.deepEqual([result.attempted, result.succeeded, result.failed], [47, 47, 0]);
  assert.equal(mock.calls.length, 5);
  assert.equal(mock.calls[0].url, `https://api.github.com/repos/${REPOSITORY}/actions/runs/${workflowRunId}`);
  assert.match(mock.calls[1].url, /jobs\?filter=latest&per_page=100$/);
  assert.equal(mock.calls[2].url, COVERAGE_URL);
  assert.equal(mock.calls[3].url, INGEST_ENDPOINT);
  assert.equal(mock.calls[3].options.method, "POST");
  assert.equal(mock.calls[4].url, COVERAGE_URL);
  assert.deepEqual(JSON.parse(mock.calls[3].options.body), plan().payload);
  for (const call of mock.calls) {
    assert.equal(call.options.redirect, "error");
    assert.ok(call.options.signal instanceof AbortSignal);
  }
  assert.equal(mock.calls[0].options.headers.authorization, `Bearer ${env.GITHUB_TOKEN}`);
  assert.equal(mock.calls[3].options.headers.authorization, `Bearer ${env.INGEST_TOKEN}`);
  assert.equal(mock.calls[2].options.headers.authorization, undefined);
  assert.equal(mock.calls[4].options.headers.authorization, undefined);
  assert.doesNotMatch(JSON.stringify(result), /test-github-secret|test-ingest-secret/);
});

test("unconfirmed workflow or collection cancellation stops before public coverage and writes", async () => {
  const active = responses([{ ...workflow, status: "in_progress", conclusion: null }]);
  await assert.rejects(finalizeInterruptedRun({ env, fetchImpl: active.fetchImpl, now }), /completed with conclusion cancelled/);
  assert.equal(active.calls.length, 1);
  const badJobs = clone(jobs);
  badJobs.jobs[0].steps[0].conclusion = "success";
  const finishedCollection = responses([workflow, badJobs]);
  await assert.rejects(finalizeInterruptedRun({ env, fetchImpl: finishedCollection.fetchImpl, now }), /collection step was not cancelled/);
  assert.equal(finishedCollection.calls.length, 2);
});

test("already finalized runs do not issue any ingestion request", async () => {
  const mock = responses([workflow, jobs, confirmed]);
  const result = await finalizeInterruptedRun({ env, fetchImpl: mock.fetchImpl, now });
  assert.equal(result.action, "already-finalized");
  assert.equal(mock.calls.length, 3);
  assert.ok(mock.calls.every((call) => call.options.method !== "POST"));
});

test("old-deployment rejection and concurrent-state conflict do not cause retries", async () => {
  for (const status of [400, 409]) {
    const mock = responses([workflow, jobs, coverage, new Response("untrusted response body", { status })]);
    await assert.rejects(finalizeInterruptedRun({ env, fetchImpl: mock.fetchImpl, now }), new RegExp(`returned HTTP ${status}`));
    assert.equal(mock.calls.length, 4);
  }
});

test("incorrect acknowledgements or changed saved counts cannot be reported as success", async () => {
  for (const change of [{ status: "completed" }, { interrupted: false }, { crawlRunId: "different" }, { stored: false }]) {
    const mock = responses([workflow, jobs, coverage, { ...acknowledged, ...change }]);
    await assert.rejects(finalizeInterruptedRun({ env, fetchImpl: mock.fetchImpl, now }), /did not acknowledge/);
    assert.equal(mock.calls.length, 4);
  }
  const altered = { runs: [{ ...confirmed.runs[0], attempted: 48, succeeded: 48 }] };
  const mock = responses([workflow, jobs, coverage, acknowledged, altered]);
  await assert.rejects(finalizeInterruptedRun({ env, fetchImpl: mock.fetchImpl, now }), /did not confirm/);
  assert.equal(mock.calls.length, 5);
});

test("transport and parse failures expose no response body or credential-bearing exception", async () => {
  for (const [value, message] of [
    [new Error("internal diagnostic containing test-github-secret"), "GitHub workflow request failed"],
    [new Response("test-github-secret", { status: 403 }), "GitHub workflow returned HTTP 403"],
    [new Response("not-json test-github-secret", { status: 200 }), "GitHub workflow returned invalid JSON"],
  ]) {
    const mock = responses([value]);
    await assert.rejects(finalizeInterruptedRun({ env, fetchImpl: mock.fetchImpl, now }), (error) => error.message === message);
    assert.equal(mock.calls.length, 1);
  }
});
