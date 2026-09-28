import type { Corridor, Quote } from "./data.ts";
import { matchesConfiguredTransferCase } from "./comparison-case.ts";

export type DisplayQuoteRecord = {
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

type DisplayQuery = (sql: string, params: unknown[]) => Promise<DisplayQuoteRecord[]>;
const columns = "id, provider_slug, provider_name, quote_type, status, corridor_slug, source_amount, source_currency, recipient_amount, recipient_currency, fee_amount, fee_currency, exchange_rate, delivery_estimate, plan_name, promotion, funding_method, payout_method, captured_at";
const canonicalTimestampPattern = "____-__-__T__:__:__.___Z";

function captureTime(value: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
  const localDate = Date.parse(`${value.slice(0, 10)}T00:00:00.000Z`);
  if (!Number.isFinite(localDate) || new Date(localDate).toISOString().slice(0, 10) !== value.slice(0, 10)) return NaN;
  if (Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59 || Number(value.slice(17, 19)) > 59) return NaN;
  return Date.parse(value);
}

export function isUsableDisplayRecord(corridor: Corridor, row: DisplayQuoteRecord, now: number) {
  if (!row || ![row.id, row.provider_slug, row.provider_name, row.funding_method, row.payout_method].every((value) => typeof value === "string" && value.trim())) return false;
  if (![row.source_currency, row.recipient_currency, row.fee_currency].every((value) => typeof value === "string" && /^[A-Z]{3}$/i.test(value))) return false;
  if (![row.source_amount, row.recipient_amount, row.fee_amount, row.exchange_rate].every((value) => typeof value === "number" && Number.isFinite(value))) return false;
  if (row.source_amount <= 0 || row.recipient_amount <= 0 || row.exchange_rate <= 0 || row.fee_amount < 0) return false;
  if (![0, 1].includes(row.promotion) || !["current", "stale"].includes(row.status) || !["verified", "indicative"].includes(row.quote_type)) return false;
  const captured = captureTime(row.captured_at);
  return Number.isFinite(captured) && captured <= now && matchesConfiguredTransferCase(corridor, {
    corridorSlug: row.corridor_slug,
    sourceAmount: row.source_amount,
    sourceCurrency: row.source_currency,
    recipientCurrency: row.recipient_currency,
  });
}

export function selectDisplayQuotes(
  corridor: Corridor,
  rows: DisplayQuoteRecord[],
  toQuote: (row: DisplayQuoteRecord) => Quote,
  now = Date.now(),
): Quote[] {
  const latest = new Map<string, DisplayQuoteRecord>();
  for (const row of rows) {
    if (!isUsableDisplayRecord(corridor, row, now)) continue;
    const existing = latest.get(row.provider_slug);
    const captured = captureTime(row.captured_at);
    const existingTime = existing ? captureTime(existing.captured_at) : -Infinity;
    if (captured > existingTime || (captured === existingTime && row.id > existing!.id)) latest.set(row.provider_slug, row);
  }
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  return [...latest.values()].map((row) => {
    const quote = toQuote(row);
    const historical = row.status === "stale" || captureTime(row.captured_at) < today.getTime();
    const status = historical ? "stale" : row.quote_type;
    return {
      ...quote,
      status,
      eligibleForPriceRanking: status === "verified" && quote.eligibleForPriceRanking === true,
    } satisfies Quote;
  }).sort((a, b) => Number(b.eligibleForPriceRanking) - Number(a.eligibleForPriceRanking)
    || Number(a.status === "stale") - Number(b.status === "stale")
    || b.recipientGets - a.recipientGets);
}

// The usual path transfers one narrow record per provider, not the full archive.
// Ingest also accepts timestamps with offsets or without milliseconds; read those
// exceptions separately so lexical UTC ordering cannot choose the wrong receipt.
export async function loadDisplayQuoteRecords(query: DisplayQuery, corridor: Corridor, now = Date.now()) {
  const where = `corridor_slug = ? AND status IN ('current', 'stale')
    AND source_amount >= ? AND source_amount <= ?
    AND UPPER(source_currency) = ? AND UPPER(recipient_currency) = ?
    AND quote_type IN ('verified', 'indicative')
    AND recipient_amount > 0 AND exchange_rate > 0 AND fee_amount >= 0`;
  const params: unknown[] = [corridor.slug, corridor.testAmount - 0.01, corridor.testAmount + 0.01, corridor.fromCurrency, corridor.toCurrency];
  const canonicalWhere = `${where} AND captured_at LIKE ? AND captured_at <= ?`;
  const canonicalParams = [...params, canonicalTimestampPattern, new Date(now).toISOString()];
  const [heads, otherTimestamps] = await Promise.all([
    query(`WITH display_candidates AS (
      SELECT ${columns}, ROW_NUMBER() OVER (PARTITION BY provider_slug ORDER BY captured_at DESC, id DESC) AS display_rank
      FROM quotes WHERE ${canonicalWhere}
    ) SELECT ${columns} FROM display_candidates WHERE display_rank = 1`, canonicalParams),
    query(`SELECT ${columns} FROM quotes WHERE ${where} AND captured_at NOT LIKE ?`, [...params, canonicalTimestampPattern]),
  ]);
  const usableHeads = await Promise.all(heads.map(async (head) => {
    let candidate: DisplayQuoteRecord | undefined = head;
    while (candidate && !isUsableDisplayRecord(corridor, candidate, now)) {
      // Walk only this provider's older records when the newest stored row is malformed.
      // The capture/provider indexes support this cursor; there is no fixed history cap.
      const older: DisplayQuoteRecord[] = await query(`SELECT ${columns} FROM quotes
        WHERE ${canonicalWhere} AND provider_slug = ?
          AND (captured_at < ? OR (captured_at = ? AND id < ?))
        ORDER BY captured_at DESC, id DESC LIMIT 1`, [
        ...canonicalParams, candidate.provider_slug, candidate.captured_at, candidate.captured_at, candidate.id,
      ]);
      candidate = older[0];
    }
    return candidate;
  }));
  return [...usableHeads.filter((row): row is DisplayQuoteRecord => Boolean(row)), ...otherTimestamps];
}
