import { query } from "@/lib/platform-runtime";
import type { Corridor } from "@/lib/data";
import { isFreshComparableCase, isRankEligible } from "@/lib/comparison-case";

export const OMT_PUBLIC_ORIGIN = "https://onlinemoneytransfer.co.uk";
export const OMT_API_VERSION = "1.0";

type RateRow = {
  id: string;
  crawl_run_id: string;
  provider_slug: string;
  provider_name: string;
  quote_type: "verified" | "indicative";
  status: "current" | "stale" | "invalid";
  source_amount: number;
  source_currency: string;
  recipient_amount: number;
  recipient_currency: string;
  fee_amount: number;
  fee_currency: string;
  exchange_rate: number;
  delivery_estimate: string | null;
  funding_method: string;
  payout_method: string;
  plan_name: string | null;
  promotion: number;
  captured_at: string;
};

export type PublicRate = {
  id: string;
  provider: string;
  providerSlug: string;
  quoteType: "verified" | "indicative";
  status: "verified" | "indicative" | "stale";
  eligibleForPriceRanking: boolean;
  sourceAmount: number;
  sourceCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  exchangeRate: number;
  feeAmount: number;
  feeCurrency: string;
  deliveryEstimate: string | null;
  fundingMethod: string;
  payoutMethod: string;
  pricingBasis: string | null;
  promotion: boolean;
  capturedAt: string;
  receiptUrl: string;
};

export type PublicSnapshot = {
  id: string;
  kind: "current" | "crawl-run";
  capturedAt: string | null;
  rates: PublicRate[];
};

function statusFor(row: RateRow, corridor: Corridor): PublicRate["status"] {
  if (!isFreshComparableCase(corridor, {
    corridorSlug: corridor.slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
    recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
  })) return "stale";
  return row.quote_type;
}

function toPublicRate(row: RateRow, corridor: Corridor): PublicRate {
  const status = statusFor(row, corridor);
  const promotion = Number(row.promotion) === 1;
  return {
    id: row.id,
    provider: row.provider_name,
    providerSlug: row.provider_slug,
    quoteType: row.quote_type,
    status,
    eligibleForPriceRanking: isRankEligible(corridor, {
      corridorSlug: corridor.slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
    recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
      recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
      fundingMethod: row.funding_method, payoutMethod: row.payout_method,
      quoteType: row.quote_type, promotion, providerSlug: row.provider_slug,
    }),
    sourceAmount: Number(row.source_amount),
    sourceCurrency: row.source_currency,
    recipientAmount: Number(row.recipient_amount),
    recipientCurrency: row.recipient_currency,
    exchangeRate: Number(row.exchange_rate),
    feeAmount: Number(row.fee_amount),
    feeCurrency: row.fee_currency,
    deliveryEstimate: row.delivery_estimate,
    fundingMethod: row.funding_method,
    payoutMethod: row.payout_method,
    pricingBasis: row.plan_name,
    promotion,
    capturedAt: row.captured_at,
    receiptUrl: `${OMT_PUBLIC_ORIGIN}/${corridor.slug}/receipts/${encodeURIComponent(row.id)}`,
  };
}

function compareRates(a: PublicRate, b: PublicRate) {
  if (a.eligibleForPriceRanking !== b.eligibleForPriceRanking) {
    return a.eligibleForPriceRanking ? -1 : 1;
  }
  if (a.providerSlug === "xe" && b.providerSlug !== "xe") return -1;
  if (b.providerSlug === "xe" && a.providerSlug !== "xe") return 1;
  if (a.status !== "stale" && b.status === "stale") return -1;
  if (b.status !== "stale" && a.status === "stale") return 1;
  return b.recipientAmount - a.recipientAmount;
}

function snapshot(
  id: string,
  kind: PublicSnapshot["kind"],
  rows: RateRow[],
  corridor: Corridor,
): PublicSnapshot {
  const latestByProvider = new Map<string, RateRow>();
  for (const row of rows) {
    if (kind === "current" && !isFreshComparableCase(corridor, {
      corridorSlug: corridor.slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
      recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
    })) continue;
    const saved = latestByProvider.get(row.provider_slug);
    if (!saved || Date.parse(row.captured_at) > Date.parse(saved.captured_at)) {
      latestByProvider.set(row.provider_slug, row);
    }
  }
  const selected = [...latestByProvider.values()];
  const rates = selected
    .map((row) => toPublicRate(row, corridor))
    .sort(compareRates);
  const capturedAt = rates.map((rate) => rate.capturedAt).sort().at(-1) ?? null;
  return { id, kind, capturedAt, rates };
}

export async function getPublicRates(corridor: Corridor, limit: number) {
  const corridorSlug = corridor.slug;
  const historyLimit = Math.max(1, Math.min(30, Math.trunc(limit)));
  try {
    const rows = await query<RateRow>(`
      WITH recent_runs AS (
        SELECT crawl_run_id, MAX(captured_at) AS snapshot_at
        FROM quotes
        WHERE corridor_slug = ? AND status != 'invalid'
        GROUP BY crawl_run_id
        ORDER BY snapshot_at DESC
        LIMIT ?
      )
      SELECT
        q.id, q.crawl_run_id, q.provider_slug, q.provider_name,
        q.quote_type, q.status, q.source_amount, q.source_currency,
        q.recipient_amount, q.recipient_currency, q.fee_amount,
        q.fee_currency, q.exchange_rate, q.delivery_estimate,
        q.funding_method, q.payout_method, q.plan_name, q.promotion,
        q.captured_at
      FROM quotes q
      INNER JOIN recent_runs r ON q.crawl_run_id = r.crawl_run_id
      WHERE q.corridor_slug = ? AND q.status != 'invalid'
      ORDER BY r.snapshot_at DESC, q.captured_at DESC, q.recipient_amount DESC
    `, [corridorSlug, Math.max(30, historyLimit), corridorSlug]);

    const byRun = new Map<string, RateRow[]>();
    for (const row of rows) {
      const run = byRun.get(row.crawl_run_id) ?? [];
      run.push(row);
      byRun.set(row.crawl_run_id, run);
    }
    const history = [...byRun.entries()]
      .map(([id, run]) => snapshot(id, "crawl-run", run, corridor))
      .sort((a, b) => Date.parse(b.capturedAt ?? "") - Date.parse(a.capturedAt ?? ""))
      .slice(0, historyLimit);

    return {
      current: snapshot("current", "current", rows, corridor),
      history,
    };
  } catch {
    return {
      current: { id: "current", kind: "current" as const, capturedAt: null, rates: [] },
      history: [] as PublicSnapshot[],
    };
  }
}
