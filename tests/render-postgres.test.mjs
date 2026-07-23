import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { newDb } from "pg-mem";

const schema = await readFile(new URL("../render/postgres-schema.sql", import.meta.url), "utf8");

test("the Render schema accepts a complete quote, proof and affiliate click", async () => {
  const memory = newDb();
  memory.public.none(schema);
  const adapter = memory.adapters.createPg();
  const client = new adapter.Client();
  await client.connect();

  const now = "2026-07-24T08:30:00.000Z";
  await client.query(
    "INSERT INTO corridors (slug, source_country, source_currency, destination_country, destination_currency, test_amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT(slug) DO NOTHING",
    ["uk-to-usa", "United Kingdom", "GBP", "United States", "USD", 200, now],
  );
  await client.query(
    "INSERT INTO providers (slug, name, homepage, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT(slug) DO NOTHING",
    ["wise", "Wise", "https://wise.com/", now],
  );
  await client.query(
    "INSERT INTO crawl_runs (id, started_at, status) VALUES ($1, $2, 'running')",
    ["run-test", now],
  );
  await client.query(
    `INSERT INTO quotes (
      id, crawl_run_id, corridor_slug, provider_slug, provider_name, quote_type,
      source_amount, source_currency, recipient_amount, recipient_currency,
      fee_amount, fee_currency, exchange_rate, funding_method, payout_method,
      captured_at, quote_url, screenshot_key, screenshot_sha256, raw_payload, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, 'verified', $6, 'GBP', $7, 'USD',
      $8, 'GBP', $9, 'bank', 'bank', $10, $11, $12, $13, '{}', $14
    )`,
    ["quote-test", "run-test", "uk-to-usa", "wise", "Wise", 200, 257.64, 1.2, 1.296, now, "https://wise.com/", "proof/test.png", "abc123", now],
  );
  await client.query(
    "INSERT INTO proof_objects (object_key, content_type, cache_control, etag, body, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    ["proof/test.png", "image/png", "public, max-age=31536000, immutable", "abc123", Buffer.from("proof"), now],
  );
  await client.query(
    "INSERT INTO affiliate_clicks (id, provider_slug, placement, destination_host, commercial, consent_mode, clicked_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    ["click-test", "wise", "corridor-table", "wise.com", 0, "essential", now],
  );

  const quote = await client.query("SELECT recipient_amount, screenshot_key FROM quotes WHERE id = $1", ["quote-test"]);
  assert.equal(Number(quote.rows[0].recipient_amount), 257.64);
  assert.equal(quote.rows[0].screenshot_key, "proof/test.png");

  const proof = await client.query("SELECT body FROM proof_objects WHERE object_key = $1", ["proof/test.png"]);
  assert.equal(Buffer.from(proof.rows[0].body).toString(), "proof");

  const click = await client.query("SELECT COUNT(*) AS total FROM affiliate_clicks");
  assert.equal(Number(click.rows[0].total), 1);
  await client.end();
});
