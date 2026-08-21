import { query, queryOne } from "@/lib/platform-runtime";
import { corridors, getCorridor, type Quote } from "@/lib/data";
import { COMPARISON_FRESHNESS_MS, hasIndexableComparison, isFreshComparableCase, isRankEligible } from "@/lib/comparison-case";

type D1Row = {
  id: string;
  provider_slug: string;
  provider_name: string;
  quote_type: "verified" | "indicative";
  status: "current" | "stale" | "invalid";
  corridor_slug: string;
  source_amount: number;
  source_currency: string;
  recipient_amount: number;
  recipient_currency: string;
  fee_amount: number;
  fee_currency: string;
  exchange_rate: number;
  delivery_estimate: string | null;
  plan_name: string | null;
  promotion: number;
  funding_method: string;
  payout_method: string;
  captured_at: string;
};

export type HistoryQuote = {
  id: string;
  provider: string;
  providerSlug: string;
  quoteType: "verified" | "indicative";
  sourceAmount: number;
  sourceCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  fundingMethod: string;
  payoutMethod: string;
  promotion: boolean;
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
  promotion: boolean;
  eligibleForPriceRanking: boolean;
  bestVerifiedRecipient: number | null;
  bestVerifiedProvider: string | null;
  matchedCompetitors: number;
};

function markFor(slug: string) {
  const marks: Record<string, string> = { wise: "WI", revolut: "RE", currencyfair: "CF", xe: "XE", remitly: "RM", paysend: "PS", westernunion: "WU", worldremit: "WR", singx: "SX", transfergo: "TG", instarem: "IR", ria: "RIA", atlanticmoney: "AM", taptapsend: "TS", ace: "ACE", profee: "PF", xoom: "XM", orbitremit: "OR", moneygram: "MG", ofx: "OFX", lemfi: "LF", starling: "ST", natwestbusiness: "NWB", lloydsbusiness: "LB", santanderuk: "SAN", hsbcuk: "HSBC", barclays: "BAR", natwest: "NW", rbs: "RBS", nationwide: "NWD", monese: "MO", skrill: "SK", paypal: "PP", asda: "AS", lloyds: "LL", santander: "SAN", hsbc: "HSBC" };
  return marks[slug] ?? slug.slice(0, 2).toUpperCase();
}

function comparisonCutoff(now = Date.now()) {
  return new Date(now - COMPARISON_FRESHNESS_MS).toISOString();
}

function rankEligibleRow(row: D1Row) {
  const corridor = getCorridor(row.corridor_slug);
  return Boolean(corridor && isRankEligible(corridor, {
    corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
    recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
    recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
    fundingMethod: row.funding_method, payoutMethod: row.payout_method,
    quoteType: row.quote_type, promotion: row.promotion, providerSlug: row.provider_slug,
  }));
}

function asQuote(row: D1Row): Quote {
  const corridor = getCorridor(row.corridor_slug);
  const comparable = Boolean(corridor && isFreshComparableCase(corridor, {
    corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
    recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
  }));
  const promotion = Number(row.promotion) === 1;
  const eligibleForPriceRanking = Boolean(corridor && isRankEligible(corridor, {
    corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
    recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
    recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
    fundingMethod: row.funding_method, payoutMethod: row.payout_method,
    quoteType: row.quote_type, promotion, providerSlug: row.provider_slug,
  }));
  return {
    provider: row.provider_name,
    providerSlug: row.provider_slug,
    mark: markFor(row.provider_slug),
    sourceAmount: row.source_amount,
    sourceCurrency: row.source_currency,
    recipientCurrency: row.recipient_currency,
    rate: row.exchange_rate,
    fee: row.fee_amount,
    feeCurrency: row.fee_currency,
    recipientGets: row.recipient_amount,
    delivery: row.delivery_estimate ?? "Ask the provider for timing",
    checkedAt: new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(row.captured_at)) + " UTC",
    status: comparable ? row.quote_type : "stale",
    capturedAt: row.captured_at,
    proofId: row.id,
    fundingMethod: row.funding_method,
    payoutMethod: row.payout_method,
    promotion,
    eligibleForPriceRanking,
    note: promotion
      ? `${row.plan_name ?? "Introductory quote"}. We keep the receipt, but a price available only to selected customers cannot win the standard table.`
      : row.quote_type === "indicative"
        ? `${row.plan_name ? `${row.plan_name}. ` : ""}This evidence does not complete a like-for-like transfer, so it stays out of the winner calculation.`
        : undefined,
  };
}

export async function getLatestQuotes(corridorSlug: string): Promise<Quote[]> {
  const corridor = getCorridor(corridorSlug);
  if (!corridor) return [];
  try {
    const rows = await query<D1Row>(`
      SELECT q.* FROM quotes q
      WHERE q.corridor_slug = ? AND q.status != 'invalid'
      ORDER BY q.captured_at DESC, q.recipient_amount DESC
    `, [corridorSlug]);
    const latest = new Map<string, D1Row>();
    for (const row of rows) {
      if (!isFreshComparableCase(corridor, { corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency, recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at })) continue;
      if (!latest.has(row.provider_slug)) latest.set(row.provider_slug, row);
    }
    return [...latest.values()].map(asQuote).sort((a, b) => Number(b.eligibleForPriceRanking) - Number(a.eligibleForPriceRanking) || b.recipientGets - a.recipientGets);
  } catch {
    return [];
  }
}

export async function getLiveProof(id: string) {
  try {
    return await queryOne<Record<string, string | number | null>>("SELECT * FROM quotes WHERE id = ? LIMIT 1", [id]);
  } catch {
    return null;
  }
}

export async function getQuoteHistory(corridorSlug: string): Promise<HistoryQuote[]> {
  try {
    const rows = await query<{
      id: string;
      provider_slug: string;
      provider_name: string;
      quote_type: "verified" | "indicative";
      source_amount: number;
      source_currency: string;
      recipient_amount: number;
      recipient_currency: string;
      funding_method: string;
      payout_method: string;
      promotion: number;
      captured_at: string;
    }>(`
      SELECT id, provider_slug, provider_name, quote_type, source_amount, source_currency, recipient_amount, recipient_currency, funding_method, payout_method, promotion, captured_at
      FROM quotes
      WHERE corridor_slug = ? AND status != 'invalid'
      ORDER BY captured_at DESC, recipient_amount DESC
      LIMIT 80
    `, [corridorSlug]);
    return rows.map((row) => ({
      id: row.id,
      provider: row.provider_name,
      providerSlug: row.provider_slug,
      quoteType: row.quote_type,
      sourceAmount: Number(row.source_amount),
      sourceCurrency: row.source_currency,
      recipientAmount: row.recipient_amount,
      recipientCurrency: row.recipient_currency,
      fundingMethod: row.funding_method,
      payoutMethod: row.payout_method,
      promotion: Number(row.promotion) === 1,
      capturedAt: row.captured_at,
    }));
  } catch {
    return [];
  }
}

export async function getCoverageDashboard(): Promise<{ corridors: CorridorCoverage[]; runs: CrawlRunSummary[] }> {
  try {
    const [quoteRows, runs] = await Promise.all([
      query<D1Row>(`SELECT q.* FROM quotes q WHERE q.status != 'invalid' AND q.captured_at >= ? ORDER BY q.captured_at DESC`, [comparisonCutoff()]),
      query<{
        id: string;
        started_at: string;
        completed_at: string | null;
        status: "running" | "completed" | "partial" | "failed";
        attempted: number;
        succeeded: number;
        failed: number;
      }>(`
        SELECT id, started_at, completed_at, status, attempted, succeeded, failed
        FROM crawl_runs
        ORDER BY started_at DESC
        LIMIT 12
      `),
    ]);
    const latest = new Map<string, D1Row>();
    for (const row of quoteRows) {
      const corridor = getCorridor(row.corridor_slug);
      if (!corridor || !isFreshComparableCase(corridor, { corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency, recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at })) continue;
      const key = `${row.corridor_slug}:${row.provider_slug}`;
      if (!latest.has(key)) latest.set(key, row);
    }
    const coverage = new Map<string, CorridorCoverage>();
    for (const row of latest.values()) {
      const summary = coverage.get(row.corridor_slug) ?? { corridorSlug: row.corridor_slug, providerCount: 0, verifiedCount: 0, indicativeCount: 0, latestCapturedAt: null };
      summary.providerCount += 1;
      const eligible = rankEligibleRow(row);
      summary.verifiedCount += eligible ? 1 : 0;
      summary.indicativeCount += eligible ? 0 : 1;
      if (!summary.latestCapturedAt || row.captured_at > summary.latestCapturedAt) summary.latestCapturedAt = row.captured_at;
      coverage.set(row.corridor_slug, summary);
    }
    return {
      corridors: [...coverage.values()].sort((a, b) => a.corridorSlug.localeCompare(b.corridorSlug)),
      runs: runs.map((row) => ({
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
    const rows = await query<D1Row>(`SELECT q.* FROM quotes q WHERE q.status != 'invalid' AND q.captured_at >= ? ORDER BY q.captured_at DESC`, [comparisonCutoff()]);
    const latest = new Map<string, D1Row>();
    for (const row of rows) {
      const corridor = getCorridor(row.corridor_slug);
      if (!corridor || !isFreshComparableCase(corridor, { corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency, recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at })) continue;
      const key = `${row.provider_slug}:${row.corridor_slug}`;
      if (!latest.has(key)) latest.set(key, row);
    }
    const result = new Map<string, ProviderCoverage>();
    for (const row of latest.values()) {
      const summary = result.get(row.provider_slug) ?? { providerSlug: row.provider_slug, providerName: row.provider_name, corridorCount: 0, verifiedCount: 0, indicativeCount: 0, latestCapturedAt: null };
      summary.corridorCount += 1;
      const eligible = rankEligibleRow(row);
      summary.verifiedCount += eligible ? 1 : 0;
      summary.indicativeCount += eligible ? 0 : 1;
      if (!summary.latestCapturedAt || row.captured_at > summary.latestCapturedAt) summary.latestCapturedAt = row.captured_at;
      result.set(row.provider_slug, summary);
    }
    return [...result.values()].sort((a, b) => b.corridorCount - a.corridorCount || a.providerName.localeCompare(b.providerName));
  } catch {
    return [];
  }
}

export async function getProviderRateEvidence(providerSlug: string): Promise<ProviderRateEvidence[]> {
  try {
    const rows = await query<D1Row>(`SELECT q.* FROM quotes q WHERE q.status != 'invalid' AND q.captured_at >= ? ORDER BY q.captured_at DESC`, [comparisonCutoff()]);
    const latest = new Map<string, D1Row>();
    for (const row of rows) {
      const corridor = getCorridor(row.corridor_slug);
      if (!corridor || !isFreshComparableCase(corridor, { corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency, recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at })) continue;
      const key = `${row.corridor_slug}:${row.provider_slug}`;
      if (!latest.has(key)) latest.set(key, row);
    }
    return [...latest.values()].filter((row) => row.provider_slug === providerSlug).map((row) => {
      const corridor = getCorridor(row.corridor_slug)!;
      const competitors = [...latest.values()].filter((candidate) => candidate.corridor_slug === row.corridor_slug && isRankEligible(corridor, {
        corridorSlug: candidate.corridor_slug, sourceAmount: candidate.source_amount, sourceCurrency: candidate.source_currency,
        recipientCurrency: candidate.recipient_currency, status: candidate.status, capturedAt: candidate.captured_at,
        recipientAmount: candidate.recipient_amount, exchangeRate: candidate.exchange_rate,
        fundingMethod: candidate.funding_method, payoutMethod: candidate.payout_method,
        quoteType: candidate.quote_type, promotion: candidate.promotion, providerSlug: candidate.provider_slug,
      })).sort((a, b) => b.recipient_amount - a.recipient_amount);
      const promotion = Number(row.promotion) === 1;
      const eligibleForPriceRanking = isRankEligible(corridor, {
        corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
        recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
        recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
        fundingMethod: row.funding_method, payoutMethod: row.payout_method,
        quoteType: row.quote_type, promotion, providerSlug: row.provider_slug,
      });
      return {
        id: row.id, corridorSlug: row.corridor_slug, sourceAmount: Number(row.source_amount), sourceCurrency: row.source_currency,
        recipientAmount: Number(row.recipient_amount), recipientCurrency: row.recipient_currency, feeAmount: Number(row.fee_amount),
        feeCurrency: row.fee_currency, exchangeRate: Number(row.exchange_rate), quoteType: row.quote_type, capturedAt: row.captured_at,
        deliveryEstimate: row.delivery_estimate, fundingMethod: row.funding_method, payoutMethod: row.payout_method,
        promotion, eligibleForPriceRanking,
        bestVerifiedRecipient: competitors[0]?.recipient_amount ?? null, bestVerifiedProvider: competitors[0]?.provider_name ?? null,
        matchedCompetitors: competitors.length,
      };
    }).sort((a, b) => Number(b.quoteType === "verified") - Number(a.quoteType === "verified") || b.capturedAt.localeCompare(a.capturedAt));
  } catch {
    return [];
  }
}

export async function getIndexableCorridorSlugs(): Promise<string[]> {
  try {
    const rows = await query<D1Row>(`
      SELECT q.* FROM quotes q
      WHERE q.status != 'invalid' AND q.captured_at >= ?
      ORDER BY q.captured_at DESC
    `, [comparisonCutoff()]);
    const byCorridor = new Map<string, D1Row[]>();
    for (const row of rows) {
      const bucket = byCorridor.get(row.corridor_slug) ?? [];
      bucket.push(row);
      byCorridor.set(row.corridor_slug, bucket);
    }
    return corridors.filter((corridor) => hasIndexableComparison(corridor, (byCorridor.get(corridor.slug) ?? []).map((row) => ({
      corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
      recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
      recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
      fundingMethod: row.funding_method, payoutMethod: row.payout_method,
      quoteType: row.quote_type, promotion: row.promotion, providerSlug: row.provider_slug,
    })))).map((corridor) => corridor.slug);
  } catch {
    return [];
  }
}

export async function isCorridorIndexable(corridorSlug: string) {
  const corridor = getCorridor(corridorSlug);
  if (!corridor) return false;
  try {
    const rows = await query<D1Row>(`
      SELECT q.* FROM quotes q
      WHERE q.corridor_slug = ? AND q.status != 'invalid' AND q.captured_at >= ?
      ORDER BY q.captured_at DESC
    `, [corridorSlug, comparisonCutoff()]);
    return hasIndexableComparison(corridor, rows.map((row) => ({
      corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
      recipientCurrency: row.recipient_currency, status: row.status, capturedAt: row.captured_at,
      recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
      fundingMethod: row.funding_method, payoutMethod: row.payout_method,
      quoteType: row.quote_type, promotion: row.promotion, providerSlug: row.provider_slug,
    })));
  } catch {
    return false;
  }
}
