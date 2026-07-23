import { env } from "cloudflare:workers";
import type { Quote } from "@/lib/data";

type D1Row = {
  id: string;
  provider_slug: string;
  provider_name: string;
  quote_type: "verified" | "indicative";
  status: "current" | "stale" | "invalid";
  source_amount: number;
  recipient_amount: number;
  fee_amount: number;
  exchange_rate: number;
  delivery_estimate: string | null;
  plan_name: string | null;
  promotion: number;
  captured_at: string;
};

export type HistoryQuote = {
  id: string;
  provider: string;
  providerSlug: string;
  quoteType: "verified" | "indicative";
  recipientAmount: number;
  recipientCurrency: string;
  capturedAt: string;
};

export type CorridorCoverage = {
  corridorSlug: string;
  providerCount: number;
  verifiedCount: number;
  indicativeCount: number;
  latestCapturedAt: string | null;
};

export type CrawlRunSummary = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: "running" | "completed" | "partial" | "failed";
  attempted: number;
  succeeded: number;
  failed: number;
};

export type ProviderCoverage = {
  providerSlug: string;
  providerName: string;
  corridorCount: number;
  verifiedCount: number;
  indicativeCount: number;
  latestCapturedAt: string | null;
};

export type ProviderRateEvidence = {
  id: string;
  corridorSlug: string;
  sourceAmount: number;
  sourceCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  feeAmount: number;
  feeCurrency: string;
  exchangeRate: number;
  quoteType: "verified" | "indicative";
  capturedAt: string;
  deliveryEstimate: string | null;
  fundingMethod: string;
  payoutMethod: string;
  bestVerifiedRecipient: number | null;
  bestVerifiedProvider: string | null;
  matchedCompetitors: number;
};

function markFor(slug: string) {
  const marks: Record<string, string> = { wise: "WI", revolut: "RE", currencyfair: "CF", xe: "XE", remitly: "RM", paysend: "PS", westernunion: "WU", worldremit: "WR", singx: "SX", transfergo: "TG", instarem: "IR", ria: "RIA", atlanticmoney: "AM", taptapsend: "TS", ace: "ACE", profee: "PF", xoom: "XM", orbitremit: "OR", moneygram: "MG", ofx: "OFX", lemfi: "LF", starling: "ST", natwestbusiness: "NWB", lloydsbusiness: "LB", santanderuk: "SAN", hsbcuk: "HSBC", barclays: "BAR", natwest: "NW", rbs: "RBS", nationwide: "NWD", monese: "MO", skrill: "SK", paypal: "PP", asda: "AS", lloyds: "LL", santander: "SAN", hsbc: "HSBC" };
  return marks[slug] ?? slug.slice(0, 2).toUpperCase();
}

function asQuote(row: D1Row): Quote {
  const age = Date.now() - Date.parse(row.captured_at);
  const stale = row.status === "stale" || age > 36 * 60 * 60 * 1000;
  const promotion = Number(row.promotion) === 1;
  return {
    provider: row.provider_name,
    providerSlug: row.provider_slug,
    mark: markFor(row.provider_slug),
    sourceAmount: row.source_amount,
    rate: row.exchange_rate,
    fee: row.fee_amount,
    recipientGets: row.recipient_amount,
    delivery: row.delivery_estimate ?? "Ask the provider for timing",
    checkedAt: new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(row.captured_at)) + " UTC",
    status: stale ? "stale" : row.quote_type,
    proofId: row.id,
    note: promotion
      ? `${row.plan_name ?? "Introductory quote"}. We keep the receipt, but a price available only to selected customers cannot win the standard table.`
      : row.quote_type === "indicative"
        ? `${row.plan_name ? `${row.plan_name}. ` : ""}This evidence does not complete a like-for-like transfer, so it stays out of the winner calculation.`
        : undefined,
  };
}

export async function getLatestQuotes(corridorSlug: string): Promise<Quote[]> {
  try {
    const result = await env.DB.prepare(`
      SELECT q.* FROM quotes q
      INNER JOIN (
        SELECT provider_slug, MAX(captured_at) AS latest_capture
        FROM quotes
        WHERE corridor_slug = ? AND status != 'invalid'
        GROUP BY provider_slug
      ) latest
      ON q.provider_slug = latest.provider_slug AND q.captured_at = latest.latest_capture
      WHERE q.corridor_slug = ?
      ORDER BY q.recipient_amount DESC
    `).bind(corridorSlug, corridorSlug).all<D1Row>();
    return result.results.map(asQuote);
  } catch {
    return [];
  }
}

export async function getLiveProof(id: string) {
  try {
    return await env.DB.prepare("SELECT * FROM quotes WHERE id = ? LIMIT 1").bind(id).first<Record<string, string | number | null>>();
  } catch {
    return null;
  }
}

export async function getQuoteHistory(corridorSlug: string): Promise<HistoryQuote[]> {
  try {
    const result = await env.DB.prepare(`
      SELECT id, provider_slug, provider_name, quote_type, recipient_amount, recipient_currency, captured_at
      FROM quotes
      WHERE corridor_slug = ? AND status != 'invalid'
      ORDER BY captured_at DESC, recipient_amount DESC
      LIMIT 80
    `).bind(corridorSlug).all<{
      id: string;
      provider_slug: string;
      provider_name: string;
      quote_type: "verified" | "indicative";
      recipient_amount: number;
      recipient_currency: string;
      captured_at: string;
    }>();
    return result.results.map((row) => ({
      id: row.id,
      provider: row.provider_name,
      providerSlug: row.provider_slug,
      quoteType: row.quote_type,
      recipientAmount: row.recipient_amount,
      recipientCurrency: row.recipient_currency,
      capturedAt: row.captured_at,
    }));
  } catch {
    return [];
  }
}

export async function getCoverageDashboard(): Promise<{ corridors: CorridorCoverage[]; runs: CrawlRunSummary[] }> {
  try {
    const [coverage, runs] = await Promise.all([
      env.DB.prepare(`
        WITH latest AS (
          SELECT corridor_slug, provider_slug, MAX(captured_at) AS latest_capture
          FROM quotes
          WHERE status != 'invalid'
          GROUP BY corridor_slug, provider_slug
        )
        SELECT
          q.corridor_slug,
          COUNT(*) AS provider_count,
          SUM(CASE WHEN q.quote_type = 'verified' THEN 1 ELSE 0 END) AS verified_count,
          SUM(CASE WHEN q.quote_type = 'indicative' THEN 1 ELSE 0 END) AS indicative_count,
          MAX(q.captured_at) AS latest_captured_at
        FROM quotes q
        INNER JOIN latest l
          ON q.corridor_slug = l.corridor_slug
          AND q.provider_slug = l.provider_slug
          AND q.captured_at = l.latest_capture
        GROUP BY q.corridor_slug
        ORDER BY q.corridor_slug
      `).all<{
        corridor_slug: string;
        provider_count: number;
        verified_count: number;
        indicative_count: number;
        latest_captured_at: string | null;
      }>(),
      env.DB.prepare(`
        SELECT id, started_at, completed_at, status, attempted, succeeded, failed
        FROM crawl_runs
        ORDER BY started_at DESC
        LIMIT 12
      `).all<{
        id: string;
        started_at: string;
        completed_at: string | null;
        status: "running" | "completed" | "partial" | "failed";
        attempted: number;
        succeeded: number;
        failed: number;
      }>(),
    ]);
    return {
      corridors: coverage.results.map((row) => ({
        corridorSlug: row.corridor_slug,
        providerCount: Number(row.provider_count),
        verifiedCount: Number(row.verified_count),
        indicativeCount: Number(row.indicative_count),
        latestCapturedAt: row.latest_captured_at,
      })),
      runs: runs.results.map((row) => ({
        id: row.id,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        status: row.status,
        attempted: Number(row.attempted),
        succeeded: Number(row.succeeded),
        failed: Number(row.failed),
      })),
    };
  } catch {
    return { corridors: [], runs: [] };
  }
}

export async function getProviderCoverage(): Promise<ProviderCoverage[]> {
  try {
    const result = await env.DB.prepare(`
      WITH latest AS (
        SELECT corridor_slug, provider_slug, MAX(captured_at) AS latest_capture
        FROM quotes
        WHERE status != 'invalid'
        GROUP BY corridor_slug, provider_slug
      )
      SELECT
        q.provider_slug,
        q.provider_name,
        COUNT(*) AS corridor_count,
        SUM(CASE WHEN q.quote_type = 'verified' THEN 1 ELSE 0 END) AS verified_count,
        SUM(CASE WHEN q.quote_type = 'indicative' THEN 1 ELSE 0 END) AS indicative_count,
        MAX(q.captured_at) AS latest_captured_at
      FROM quotes q
      INNER JOIN latest l
        ON q.corridor_slug = l.corridor_slug
        AND q.provider_slug = l.provider_slug
        AND q.captured_at = l.latest_capture
      GROUP BY q.provider_slug, q.provider_name
      ORDER BY corridor_count DESC, q.provider_name
    `).all<{
      provider_slug: string;
      provider_name: string;
      corridor_count: number;
      verified_count: number;
      indicative_count: number;
      latest_captured_at: string | null;
    }>();
    return result.results.map((row) => ({
      providerSlug: row.provider_slug,
      providerName: row.provider_name,
      corridorCount: Number(row.corridor_count),
      verifiedCount: Number(row.verified_count),
      indicativeCount: Number(row.indicative_count),
      latestCapturedAt: row.latest_captured_at,
    }));
  } catch {
    return [];
  }
}

export async function getProviderRateEvidence(providerSlug: string): Promise<ProviderRateEvidence[]> {
  try {
    const result = await env.DB.prepare(`
      WITH latest AS (
        SELECT corridor_slug, provider_slug, MAX(captured_at) AS latest_capture
        FROM quotes
        WHERE status != 'invalid'
        GROUP BY corridor_slug, provider_slug
      ),
      current_quotes AS (
        SELECT q.*
        FROM quotes q
        INNER JOIN latest l
          ON q.corridor_slug = l.corridor_slug
          AND q.provider_slug = l.provider_slug
          AND q.captured_at = l.latest_capture
        WHERE q.status != 'invalid'
      )
      SELECT
        p.id,
        p.corridor_slug,
        p.source_amount,
        p.source_currency,
        p.recipient_amount,
        p.recipient_currency,
        p.fee_amount,
        p.fee_currency,
        p.exchange_rate,
        p.quote_type,
        p.captured_at,
        p.delivery_estimate,
        p.funding_method,
        p.payout_method,
        (
          SELECT c.recipient_amount
          FROM current_quotes c
          WHERE c.corridor_slug = p.corridor_slug
            AND c.quote_type = 'verified'
            AND c.promotion = 0
            AND ABS(c.source_amount - p.source_amount) < 0.01
          ORDER BY c.recipient_amount DESC
          LIMIT 1
        ) AS best_verified_recipient,
        (
          SELECT c.provider_name
          FROM current_quotes c
          WHERE c.corridor_slug = p.corridor_slug
            AND c.quote_type = 'verified'
            AND c.promotion = 0
            AND ABS(c.source_amount - p.source_amount) < 0.01
          ORDER BY c.recipient_amount DESC
          LIMIT 1
        ) AS best_verified_provider,
        (
          SELECT COUNT(*)
          FROM current_quotes c
          WHERE c.corridor_slug = p.corridor_slug
            AND c.quote_type = 'verified'
            AND c.promotion = 0
            AND ABS(c.source_amount - p.source_amount) < 0.01
        ) AS matched_competitors
      FROM current_quotes p
      WHERE p.provider_slug = ?
      ORDER BY
        CASE WHEN p.quote_type = 'verified' THEN 0 ELSE 1 END,
        p.captured_at DESC,
        p.corridor_slug
    `).bind(providerSlug).all<{
      id: string;
      corridor_slug: string;
      source_amount: number;
      source_currency: string;
      recipient_amount: number;
      recipient_currency: string;
      fee_amount: number;
      fee_currency: string;
      exchange_rate: number;
      quote_type: "verified" | "indicative";
      captured_at: string;
      delivery_estimate: string | null;
      funding_method: string;
      payout_method: string;
      best_verified_recipient: number | null;
      best_verified_provider: string | null;
      matched_competitors: number;
    }>();
    return result.results.map((row) => ({
      id: row.id,
      corridorSlug: row.corridor_slug,
      sourceAmount: Number(row.source_amount),
      sourceCurrency: row.source_currency,
      recipientAmount: Number(row.recipient_amount),
      recipientCurrency: row.recipient_currency,
      feeAmount: Number(row.fee_amount),
      feeCurrency: row.fee_currency,
      exchangeRate: Number(row.exchange_rate),
      quoteType: row.quote_type,
      capturedAt: row.captured_at,
      deliveryEstimate: row.delivery_estimate,
      fundingMethod: row.funding_method,
      payoutMethod: row.payout_method,
      bestVerifiedRecipient: row.best_verified_recipient === null ? null : Number(row.best_verified_recipient),
      bestVerifiedProvider: row.best_verified_provider,
      matchedCompetitors: Number(row.matched_competitors),
    }));
  } catch {
    return [];
  }
}
