import { pathToFileURL } from "node:url";

export const REPOSITORY = "thisismyuserdealwithit/online-money-transfer-rates";
export const WORKFLOW_PATH = ".github/workflows/daily-rates.yml";
export const INGEST_ENDPOINT = "https://online-money-transfer-rates-1.onrender.com/api/ingest";
export const COVERAGE_URL = "https://onlinemoneytransfer.co.uk/api/coverage";
const API_ROOT = `https://api.github.com/repos/${REPOSITORY}`;

function timestamp(value, label) {
  const match = typeof value === "string" && /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
  const normalized = match && `${match[1]}.${(match[2] ?? "").padEnd(3, "0")}Z`;
  const parsed = normalized ? Date.parse(normalized) : NaN;
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== normalized) {
    throw new Error(`${label} must be a valid UTC timestamp`);
  }
  return parsed;
}

function positiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${label} must be a positive integer`);
  return value;
}

function crawlIdentifier(value) {
  if (typeof value !== "string" || !/^crawl-\d{4}-\d{2}-\d{2}-[a-f0-9]{8}$/.test(value)) {
    throw new Error("CRAWL_RUN_ID must identify one exact crawler run");
  }
  return value;
}

export function readMaintenanceConfig(env) {
  if (env.GITHUB_REPOSITORY !== REPOSITORY) throw new Error("GITHUB_REPOSITORY does not match the expected repository");
  if (env.GITHUB_EVENT_NAME && env.GITHUB_EVENT_NAME !== "workflow_dispatch") {
    throw new Error("Run interruption repair requires a manual dispatch");
  }
  const crawlRunId = crawlIdentifier(env.CRAWL_RUN_ID);
  if (typeof env.CANCELLED_WORKFLOW_RUN_ID !== "string" || !/^[1-9]\d*$/.test(env.CANCELLED_WORKFLOW_RUN_ID)) {
    throw new Error("CANCELLED_WORKFLOW_RUN_ID must be an explicit positive integer");
  }
  const workflowRunId = positiveInteger(Number(env.CANCELLED_WORKFLOW_RUN_ID), "CANCELLED_WORKFLOW_RUN_ID");
  if (env.INGEST_ENDPOINT !== INGEST_ENDPOINT) throw new Error("INGEST_ENDPOINT does not match the fixed ingestion endpoint");
  for (const name of ["GITHUB_TOKEN", "INGEST_TOKEN"]) {
    if (typeof env[name] !== "string" || !env[name] || /\s/.test(env[name])) throw new Error(`${name} is required and must not contain whitespace`);
  }
  return { crawlRunId, workflowRunId, githubToken: env.GITHUB_TOKEN, ingestToken: env.INGEST_TOKEN };
}

export function validateCancelledWorkflow(workflow, workflowRunId, now = Date.now()) {
  positiveInteger(workflowRunId, "Workflow run ID");
  if (workflow?.id !== workflowRunId || workflow.repository?.full_name !== REPOSITORY
    || workflow.head_repository?.full_name !== REPOSITORY || workflow.path !== WORKFLOW_PATH) {
    throw new Error("Cancelled workflow identity, repository or path does not match");
  }
  if (workflow.status !== "completed" || workflow.conclusion !== "cancelled") {
    throw new Error("The designated workflow must be completed with conclusion cancelled");
  }
  const started = timestamp(workflow.run_started_at, "Workflow start");
  const ended = timestamp(workflow.updated_at, "Workflow end");
  if (!Number.isFinite(now) || started > ended || ended > now) throw new Error("Workflow timing is invalid or in the future");
  return { started, ended, attempt: positiveInteger(workflow.run_attempt, "Workflow attempt") };
}

export function validateCollectionWindow(workflow, jobs, workflowRunId, now = Date.now()) {
  const window = validateCancelledWorkflow(workflow, workflowRunId, now);
  if (!Array.isArray(jobs?.jobs) || !Number.isSafeInteger(jobs.total_count)
    || jobs.total_count !== jobs.jobs.length || jobs.total_count < 1 || jobs.total_count > 100) {
    throw new Error("A complete job listing is required to identify the cancelled collection step");
  }
  const candidates = jobs.jobs.flatMap((job) => Array.isArray(job.steps)
    ? job.steps.filter((step) => step.name === "Collect public rates").map((step) => ({ job, step })) : []);
  if (candidates.length !== 1) throw new Error("Expected exactly one Collect public rates step");
  const { job, step } = candidates[0];
  if (job.run_id !== workflowRunId || job.run_attempt !== window.attempt || job.status !== "completed"
    || job.conclusion !== "cancelled" || step.status !== "completed" || step.conclusion !== "cancelled") {
    throw new Error("The collection step was not cancelled in the designated workflow attempt");
  }
  const jobStart = timestamp(job.started_at, "Job start");
  const jobEnd = timestamp(job.completed_at, "Job end");
  const started = timestamp(step.started_at, "Collection step start");
  const ended = timestamp(step.completed_at, "Collection step end");
  if (window.started > jobStart || jobStart > started || started > ended || ended > jobEnd || jobEnd > window.ended) {
    throw new Error("Collection step timestamps do not fit inside the cancelled workflow");
  }
  return { ...window, collectionStarted: started, collectionEnded: ended, completedAt: step.completed_at };
}

function findRun(coverage, crawlRunId) {
  if (!Array.isArray(coverage?.runs)) throw new Error("Coverage does not contain crawl runs");
  const matches = coverage.runs.filter((run) => run?.id === crawlRunId);
  if (matches.length !== 1) throw new Error("Coverage must contain exactly one matching crawl run");
  return matches[0];
}

function validateCounts(run) {
  for (const key of ["attempted", "succeeded", "failed"]) {
    if (!Number.isSafeInteger(run[key]) || run[key] < 0) throw new Error(`Stored ${key} count is invalid`);
  }
  if (run.attempted !== run.succeeded + run.failed) throw new Error("Stored counts do not balance");
}

export function planRunInterruption({ workflow, jobs, coverage, crawlRunId, workflowRunId, now = Date.now() }) {
  crawlIdentifier(crawlRunId);
  const window = validateCollectionWindow(workflow, jobs, workflowRunId, now);
  const run = findRun(coverage, crawlRunId);
  validateCounts(run);
  const started = timestamp(run.startedAt, "Stored crawl start");
  if (started < window.collectionStarted || started > window.collectionEnded) {
    throw new Error("Stored crawl start is outside the cancelled collection step");
  }
  const result = {
    crawlRunId, workflowRunId, startedAt: run.startedAt,
    attempted: run.attempted, succeeded: run.succeeded, failed: run.failed,
  };
  if (["completed", "partial", "failed"].includes(run.status)) {
    const ended = timestamp(run.completedAt, "Stored crawl completion");
    if (ended < started || ended > now) throw new Error("Stored completion timestamp is invalid");
    return { action: "already-finalized", result: { ...result, status: run.status, completedAt: run.completedAt } };
  }
  if (run.status !== "running" || run.completedAt !== null) throw new Error("Only an unfinished running crawl can be repaired");
  const errorSummary = `Collection interrupted by cancellation of GitHub Actions workflow run ${workflowRunId}. The Collect public rates step ended at ${window.completedAt}. Stored receipt counts were preserved; no unobserved attempts or failures were added.`;
  return {
    action: "finalize",
    payload: { kind: "run-interruption", ...result, completedAt: window.completedAt, errorSummary },
    result: { ...result, status: "partial", completedAt: window.completedAt },
  };
}
async function requestJson(url, options, fetchImpl, label) {
  let response;
  try {
    response = await fetchImpl(url, { ...options, redirect: "error", signal: AbortSignal.timeout(20_000) });
  } catch {
    throw new Error(`${label} request failed`);
  }
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }
}

export async function finalizeInterruptedRun({ env = process.env, fetchImpl = fetch, now = Date.now() } = {}) {
  const config = readMaintenanceConfig(env);
  const githubHeaders = {
    accept: "application/vnd.github+json", authorization: `Bearer ${config.githubToken}`,
    "x-github-api-version": "2022-11-28", "user-agent": "OMT-run-interruption-repair",
  };
  const workflowUrl = `${API_ROOT}/actions/runs/${config.workflowRunId}`;
  const workflow = await requestJson(workflowUrl, { headers: githubHeaders }, fetchImpl, "GitHub workflow");
  // Cancellation must be confirmed before reading site state or sending an ingestion request.
  validateCancelledWorkflow(workflow, config.workflowRunId, now);
  const jobs = await requestJson(`${workflowUrl}/jobs?filter=latest&per_page=100`, { headers: githubHeaders }, fetchImpl, "GitHub jobs");
  validateCollectionWindow(workflow, jobs, config.workflowRunId, now);
  const coverageOptions = { headers: { accept: "application/json", "cache-control": "no-cache" } };
  const coverage = await requestJson(COVERAGE_URL, coverageOptions, fetchImpl, "Public coverage");
  const plan = planRunInterruption({ workflow, jobs, coverage, ...config, now });
  if (plan.action === "already-finalized") return { action: plan.action, ...plan.result };
  const acknowledgement = await requestJson(INGEST_ENDPOINT, {
    method: "POST",
    headers: { authorization: `Bearer ${config.ingestToken}`, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(plan.payload),
  }, fetchImpl, "Run interruption update");
  if (acknowledgement?.crawlRunId !== config.crawlRunId || acknowledgement.status !== "partial"
    || acknowledgement.stored !== true || acknowledgement.interrupted !== true) {
    throw new Error("Run interruption update did not acknowledge the requested partial state");
  }
  const confirmed = findRun(await requestJson(COVERAGE_URL, coverageOptions, fetchImpl, "Post-update coverage"), config.crawlRunId);
  validateCounts(confirmed);
  if (confirmed.status !== "partial" || confirmed.startedAt !== plan.result.startedAt
    || timestamp(confirmed.completedAt, "Confirmed completion") !== timestamp(plan.result.completedAt, "Expected completion")
    || ["attempted", "succeeded", "failed"].some((key) => confirmed[key] !== plan.result[key])) {
    throw new Error("Update acknowledged but public coverage did not confirm the preserved counts and partial state");
  }
  return { action: "finalized", ...plan.result };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await finalizeInterruptedRun(), null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Run interruption repair failed");
    process.exitCode = 1;
  }
}
