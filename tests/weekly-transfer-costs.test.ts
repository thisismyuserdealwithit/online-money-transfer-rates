import test from "node:test";
import assert from "node:assert/strict";
import { buildWeeklyReport, latestCompletedWeek, reportPeriod, publishedWeeks, weeklyReportCsv, WEEKLY_ROUTES } from "../lib/weekly-transfer-costs.ts";
import type { DisplayQuoteRecord } from "../lib/display-quotes.ts";
const now = Date.parse("2026-10-06T12:00:00Z");
const week = "2026-10-04";
function row(changes: Partial<DisplayQuoteRecord> = {}): DisplayQuoteRecord {
  return { id: "a", provider_slug: "wise", provider_name: "Wise", quote_type: "verified", status: "stale",
    corridor_slug: "uk-to-spain", source_amount: 200, source_currency: "GBP", recipient_amount: 230,
    recipient_currency: "EUR", fee_amount: 1, fee_currency: "GBP", exchange_rate: 1.15,
    delivery_estimate: null, plan_name: null, promotion: 0, funding_method: "Bank transfer", payout_method: "Bank deposit",
    captured_at: "2026-10-01T10:00:00.123456Z", ...changes };
}
const route = (rows: DisplayQuoteRecord[]) => buildWeeklyReport(rows, week, now).corridors[0];
test("only completed real Sunday weeks are published", () => {
  assert.equal(latestCompletedWeek(Date.parse("2026-10-04T23:59:59Z")), "2026-09-27");
  assert.equal(latestCompletedWeek(Date.parse("2026-10-05T00:00:00Z")), week);
  assert.deepEqual(reportPeriod(week, now), { weekEnding: week, start: "2026-09-28T00:00:00.000Z", endExclusive: "2026-10-05T00:00:00.000Z" });
  for (const invalid of ["2026-10-05", "2026-10-11", "2026-09-27", "2026-02-30", "2026-1-4", "not-a-date"]) assert.equal(reportPeriod(invalid, now), null);
  assert.deepEqual(publishedWeeks(now), [week]);
});
test("missing observations yield null gaps across five routes and seven days", () => {
  const report = buildWeeklyReport([], week, now);
  assert.equal(report.corridors.length, 5);
  assert.deepEqual(report.corridors.map((item) => item.route), [...WEEKLY_ROUTES]);
  assert.deepEqual(report.totals, { routes: 5, daysWithEvidence: 0, observations: 0, comparableRouteDays: 0 });
  assert.ok(report.corridors.every((item) => item.days.length === 7 && item.medianGapPercent === null));
});
test("historical superseded evidence qualifies on its own day, while invalid evidence never qualifies", () => {
  const report = route([row(), row({ id: "b", provider_slug: "other", recipient_amount: 220 }), row({ id: "invalid", provider_slug: "invalid", status: "invalid", recipient_amount: 999 })]);
  assert.equal(report.observations, 2);
  assert.equal(report.comparableDays, 1);
  assert.ok(Math.abs(report.medianGapPercent! - 10 / 230 * 100) < 1e-10);
});
test("UTC boundaries and microseconds are retained accurately", () => {
  const report = route([
    row({ id: "before", provider_slug: "before", captured_at: "2026-09-27T23:59:59.999Z" }),
    row({ id: "start", provider_slug: "start", captured_at: "2026-09-28T01:00:00+01:00" }),
    row({ id: "end", provider_slug: "end", captured_at: "2026-10-04T23:59:59.999999Z" }),
    row({ id: "next", provider_slug: "next", captured_at: "2026-10-05T00:00:00Z" }),
  ]);
  assert.equal(report.observations, 2);
  assert.equal(report.days[0].receipts[0].id, "start");
  assert.equal(report.days[6].receipts[0].id, "end");
});
test("latest usable receipt wins deterministically, even when it is an estimate", () => {
  const rows = [row({ id: "old", captured_at: "2026-10-01T09:00:00Z" }),
    row({ id: "estimate", quote_type: "indicative" }),
    row({ id: "bad", captured_at: "2026-10-01T11:00:00Z", recipient_amount: NaN }),
    row({ id: "b", provider_slug: "other", recipient_amount: 220 })];
  const report = route(rows);
  assert.equal(report.observations, 2);
  assert.equal(report.comparableDays, 0);
  assert.equal(report.providers.find((item) => item.providerSlug === "wise")!.latestReceipt.id, "estimate");
  assert.deepEqual(route([...rows].reverse()), report);
});
test("wrong cases are removed; promotions and other methods remain evidence only", () => {
  const report = route([row(), row({ id: "amount", provider_slug: "amount", source_amount: 100 }),
    row({ id: "currency", provider_slug: "currency", recipient_currency: "USD" }),
    row({ id: "promo", provider_slug: "promo", promotion: 1 }),
    row({ id: "card", provider_slug: "card", funding_method: "Debit card" }),
    row({ id: "cash", provider_slug: "cash", payout_method: "Cash pickup" })]);
  assert.equal(report.observations, 4);
  assert.equal(report.days[3].qualifyingProviders, 1);
  assert.equal(report.comparableDays, 0);
});
test("the one-hour limit includes its boundary but rejects wider checks without cherry-picking", () => {
  const base = row({ captured_at: "2026-10-01T10:00:00Z" });
  assert.equal(route([base, row({ id: "b", provider_slug: "b", captured_at: "2026-10-01T11:00:00Z" })]).comparableDays, 1);
  const report = route([base, row({ id: "b", provider_slug: "b", captured_at: "2026-10-01T10:30:00Z" }), row({ id: "c", provider_slug: "c", captured_at: "2026-10-01T11:00:00.001Z" })]);
  assert.equal(report.comparableDays, 0);
  assert.equal(report.days[3].reason, "captures_more_than_one_hour_apart");
  assert.equal(report.days[3].highestRecipient, null);
});
test("ties produce a real zero gap, with all tied providers named", () => {
  const day = route([row(), row({ id: "b", provider_slug: "b", provider_name: "Second" })]).days[3];
  assert.equal(day.gapPercent, 0);
  assert.deepEqual(day.highestProviders, ["Second", "Wise"]);
});
test("weekly medians count comparable days, not individual quotes", () => {
  const report = route([row({ recipient_amount: 200 }), row({ id: "b", provider_slug: "b", recipient_amount: 180 }),
    row({ id: "next-a", recipient_amount: 200, captured_at: "2026-10-02T10:00:00Z" }),
    row({ id: "next-b", provider_slug: "b", recipient_amount: 160, captured_at: "2026-10-02T10:00:00Z" })]);
  assert.equal(report.comparableDays, 2);
  assert.equal(report.medianGapPercent, 15);
  assert.equal(report.providers[0].daysObserved, 2);
});
test("CSV exports record qualification and canonical receipts with correct quoting", () => {
  const report = buildWeeklyReport([row({ provider_name: 'A, "Provider"' })], week, now);
  const csv = weeklyReportCsv(report);
  assert.match(csv, /eligible_for_comparison,captured_at,receipt_url/);
  assert.ok(csv.includes('"A, ""Provider"""'));
  assert.ok(csv.includes("https://onlinemoneytransfer.co.uk/uk-to-spain/receipts/a"));
  assert.equal(csv.trim().split("\r\n").length, 2);
});
