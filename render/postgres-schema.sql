CREATE TABLE IF NOT EXISTS corridors (
  slug TEXT PRIMARY KEY,
  source_country TEXT NOT NULL,
  source_currency TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_currency TEXT NOT NULL,
  test_amount DOUBLE PRECISION NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS providers (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  homepage TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crawl_runs (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'partial', 'failed')),
  attempted INTEGER NOT NULL DEFAULT 0,
  succeeded INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT
);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  crawl_run_id TEXT NOT NULL,
  corridor_slug TEXT NOT NULL,
  provider_slug TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  quote_type TEXT NOT NULL CHECK (quote_type IN ('verified', 'indicative')),
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'stale', 'invalid')),
  source_amount DOUBLE PRECISION NOT NULL,
  source_currency TEXT NOT NULL,
  recipient_amount DOUBLE PRECISION NOT NULL,
  recipient_currency TEXT NOT NULL,
  fee_amount DOUBLE PRECISION NOT NULL,
  fee_currency TEXT NOT NULL,
  exchange_rate DOUBLE PRECISION NOT NULL,
  delivery_estimate TEXT,
  funding_method TEXT NOT NULL,
  payout_method TEXT NOT NULL,
  plan_name TEXT,
  promotion INTEGER NOT NULL DEFAULT 0,
  captured_at TEXT NOT NULL,
  quote_url TEXT NOT NULL,
  screenshot_key TEXT NOT NULL,
  screenshot_sha256 TEXT NOT NULL,
  raw_payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS quotes_corridor_captured_idx
  ON quotes (corridor_slug, captured_at);
CREATE INDEX IF NOT EXISTS quotes_provider_captured_idx
  ON quotes (provider_slug, captured_at);
CREATE UNIQUE INDEX IF NOT EXISTS quotes_capture_unique_idx
  ON quotes (corridor_slug, provider_slug, captured_at);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY,
  provider_slug TEXT NOT NULL,
  corridor_slug TEXT,
  placement TEXT NOT NULL,
  destination_host TEXT NOT NULL,
  commercial INTEGER NOT NULL DEFAULT 0,
  consent_mode TEXT NOT NULL CHECK (consent_mode IN ('essential', 'analytics')),
  session_hash TEXT,
  referrer_path TEXT,
  clicked_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_provider_date_idx
  ON affiliate_clicks (provider_slug, clicked_at);
CREATE INDEX IF NOT EXISTS affiliate_clicks_corridor_date_idx
  ON affiliate_clicks (corridor_slug, clicked_at);

CREATE TABLE IF NOT EXISTS proof_objects (
  object_key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  cache_control TEXT,
  etag TEXT NOT NULL,
  body BYTEA NOT NULL,
  created_at TEXT NOT NULL
);
