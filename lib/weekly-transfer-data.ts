import { query } from "@/lib/platform-runtime";
import type { DisplayQuoteRecord } from "@/lib/display-quotes";
import { buildWeeklyReport, reportPeriod, WEEKLY_ROUTES } from "@/lib/weekly-transfer-costs";

export async function getWeeklyReport(week: string, now = Date.now()) {
  const period = reportPeriod(week, now);
  if (!period) throw new RangeError("Unknown completed report week");
  try {
    const rows = await query<DisplayQuoteRecord>(`
      SELECT id, provider_slug, provider_name, quote_type, status, corridor_slug,
        source_amount, source_currency, recipient_amount, recipient_currency,
        fee_amount, fee_currency, exchange_rate, delivery_estimate, plan_name,
        promotion, funding_method, payout_method, captured_at
      FROM quotes WHERE status IN ('current', 'stale')
        AND corridor_slug IN (?, ?, ?, ?, ?) AND captured_at >= ? AND captured_at < ?
    `, [...WEEKLY_ROUTES,
      new Date(Date.parse(period.start) - 86_400_000).toISOString().slice(0, 10),
      new Date(Date.parse(period.endExclusive) + 86_400_000).toISOString().slice(0, 10)]);
    return { available: true as const, report: buildWeeklyReport(rows, week, now) };
  } catch {
    return { available: false as const, period };
  }
}
