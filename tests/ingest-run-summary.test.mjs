import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { newDb } from "pg-mem";
import ts from "typescript";

const routeSource = readFileSync(new URL("../app/api/ingest/route.ts", import.meta.url), "utf8");
const compiledRoute = ts.transpileModule(routeSource, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
} }).outputText;
const schema = readFileSync(new URL("../render/postgres-schema.sql", import.meta.url), "utf8");
const token = "test-only-ingest-token";
const explanation = "Interrupted after confirmed GitHub workflow cancellation; stored receipts retained.";

// Exercise the actual endpoint and SQL against the production schema.
function handler(runtime) {
  const loadedModule = { exports: {} };
  const load = (specifier) => {
    if (specifier === "next/cache") return { revalidatePath: runtime.revalidatePath };
    if (specifier === "@/lib/platform-runtime") return {
      ...runtime, runtimeValue: (name) => name === "INGEST_TOKEN" ? token : undefined,
    };
    if (["@/lib/data", "@/lib/comparison-case"].includes(specifier)) return {};
    throw new Error("Unexpected endpoint dependency: " + specifier);
  };
  new Function("require", "module", "exports", compiledRoute)(load, loadedModule, loadedModule.exports);
  return loadedModule.exports.POST;
}

function request(extra = {}, authorised = true) {
  return new Request("https://example.test/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...(authorised ? { authorization: "Bearer " + token } : {}) },
    body: JSON.stringify({ kind: "run-summary", crawlRunId: "cancelled-run",
      startedAt: "2026-10-08T12:18:26.140Z", completedAt: "2026-10-08T12:18:53.300Z",
      attempted: 47, succeeded: 47, failed: 0, ...extra }),
  });
}

async function database(t) {
  const memory = newDb();
  memory.public.none(schema);
  const adapter = memory.adapters.createPg();
  const client = new adapter.Client();
  await client.connect();
  t.after(() => client.end());
  const execute = async (sql, params) => {
    let index = 0;
    return client.query(sql.replace(/\?/g, () => "$" + ++index), params);
  };
  const invalidations = [];
  return { client, invalidations, POST: handler({ execute, queryOne: async (sql, params) => (await execute(sql, params)).rows[0] ?? null, revalidatePath: (path) => invalidations.push(path) }) };
}

async function seedRun(client, id = "cancelled-run") {
  await client.query("INSERT INTO crawl_runs (id, started_at, status, attempted, succeeded, failed) VALUES ($1, '2026-10-08T12:18:26.140Z', 'running', 47, 47, 0)", [id]);
}

test("an interruption retains 47 stored results and zero failures while finalizing the existing run as partial", async (t) => {
  const { client, POST, invalidations } = await database(t);
  await seedRun(client);
  await client.query("INSERT INTO quotes (id, crawl_run_id, corridor_slug, provider_slug, provider_name, quote_type, source_amount, source_currency, recipient_amount, recipient_currency, fee_amount, fee_currency, exchange_rate, funding_method, payout_method, captured_at, quote_url, screenshot_key, screenshot_sha256, raw_payload, created_at) VALUES ('saved-receipt', 'cancelled-run', 'uk-to-spain', 'wise', 'Wise', 'indicative', 200, 'GBP', 234, 'EUR', 1, 'GBP', 1.175, 'bank transfer', 'bank deposit', '2026-10-08T12:18:26.140Z', 'https://example.test/quote', 'proof/saved.png', 'original-proof-hash', '{}', '2026-10-08T12:18:27.000Z')");
  const original = (await client.query("SELECT * FROM quotes")).rows;
  const response = await POST(request({ kind: "run-interruption", errorSummary: explanation }));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { crawlRunId: "cancelled-run", status: "partial", stored: true, interrupted: true });
  const saved = (await client.query("SELECT * FROM crawl_runs WHERE id = 'cancelled-run'")).rows[0];
  assert.equal(saved.status, "partial");
  assert.equal(saved.attempted, 47);
  assert.equal(saved.succeeded, 47);
  assert.equal(saved.failed, 0);
  assert.equal(saved.started_at, "2026-10-08T12:18:26.140Z");
  assert.equal(saved.completed_at, "2026-10-08T12:18:53.300Z");
  assert.equal(saved.error_summary, explanation);
  assert.deepEqual((await client.query("SELECT * FROM quotes")).rows, original);
  assert.deepEqual(invalidations, ["/coverage"]);
});

test("ordinary summaries keep completed, partial and failed derivation", async (t) => {
  const { client, POST, invalidations } = await database(t);
  for (const [index, input, expected] of [
    [0, {}, "completed"],
    [1, { succeeded: 46, failed: 1 }, "partial"],
    [2, { succeeded: 0, failed: 47 }, "failed"],
  ]) {
    const id = "ordinary-run-" + index;
    const response = await POST(request({ crawlRunId: id, ...input }));
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { crawlRunId: id, status: expected, stored: true });
    assert.equal((await client.query("SELECT status FROM crawl_runs WHERE id = $1", [id])).rows[0].status, expected);
  }
  assert.deepEqual(invalidations, []);
});

test("an interruption cannot create a run or overwrite terminal, completed or changed snapshots", async (t) => {
  const { client, POST, invalidations } = await database(t);
  await seedRun(client, "terminal");
  await client.query("UPDATE crawl_runs SET status = 'completed', completed_at = '2026-10-08T12:18:51.000Z' WHERE id = 'terminal'");
  await seedRun(client, "already-dated");
  await client.query("UPDATE crawl_runs SET completed_at = '2026-10-08T12:18:51.000Z' WHERE id = 'already-dated'");
  await seedRun(client, "changed");
  const before = (await client.query("SELECT * FROM crawl_runs ORDER BY id")).rows;
  for (const input of [
    { crawlRunId: "missing" }, { crawlRunId: "terminal" }, { crawlRunId: "already-dated" },
    { crawlRunId: "changed", attempted: 48 }, { crawlRunId: "changed", succeeded: 46 },
    { crawlRunId: "changed", failed: 1 }, { crawlRunId: "changed", startedAt: "2026-10-08T12:18:25.000Z" },
  ]) {
    const response = await POST(request({ kind: "run-interruption", errorSummary: explanation, ...input }));
    assert.equal(response.status, 409);
  }
  assert.deepEqual((await client.query("SELECT * FROM crawl_runs ORDER BY id")).rows, before);
  assert.deepEqual(invalidations, []);
});

test("an interruption requires a nonempty explanation before any write", async () => {
  let writes = 0;
  const write = async () => { writes += 1; };
  const invalidations = [];
  const POST = handler({ execute: write, queryOne: write, revalidatePath: (path) => invalidations.push(path) });
  for (const errorSummary of [undefined, null, "", "  ", 1, {}, [], "x".repeat(12001)]) {
    const response = await POST(request({ kind: "run-interruption", errorSummary }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "errorSummary is invalid" });
  }
  assert.equal(writes, 0);
  assert.deepEqual(invalidations, []);
});

test("an interruption requires authentication and an end time that does not precede its start", async () => {
  let writes = 0;
  const write = async () => { writes += 1; };
  const invalidations = [];
  const POST = handler({ execute: write, queryOne: write, revalidatePath: (path) => invalidations.push(path) });
  const input = { kind: "run-interruption", errorSummary: explanation };
  assert.equal((await POST(request(input, false))).status, 401);
  const invalidTime = await POST(request({ ...input, completedAt: "not-a-date" }));
  assert.equal(invalidTime.status, 400);
  const earlier = await POST(request({ ...input, completedAt: "2026-10-08T12:18:25.000Z" }));
  assert.equal(earlier.status, 400);
  assert.deepEqual(await earlier.json(), { error: "Run completion precedes its start" });
  assert.equal(writes, 0);
  assert.deepEqual(invalidations, []);
});
