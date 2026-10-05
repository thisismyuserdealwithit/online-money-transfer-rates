import { corridors } from "./data.ts";
import { isRankEligible } from "./comparison-case.ts";
import { isUsableDisplayRecord, type DisplayQuoteRecord } from "./display-quotes.ts";

export const FIRST_WEEK = "2026-10-04";
export const WEEKLY_ROUTES = ["uk-to-spain", "uk-to-united-states", "uk-to-india", "uk-to-pakistan", "uk-to-philippines"] as const;
const DAY = 86_400_000;
export const MAX_COMPARISON_SKEW_MS = 60 * 60 * 1000;
const ORIGIN = "https://onlinemoneytransfer.co.uk";

export function latestCompletedWeek(now = Date.now()) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() || 7));
  return date.toISOString().slice(0, 10);
}

export function reportPeriod(week: string, now = Date.now()) {
  const end = Date.parse(`${week}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week) || !Number.isFinite(end)
    || new Date(end).toISOString().slice(0, 10) !== week || new Date(end).getUTCDay() !== 0) return null;
  if (week < FIRST_WEEK || week > latestCompletedWeek(now)) return null;
  return { weekEnding: week, start: new Date(end - 6 * DAY).toISOString(), endExclusive: new Date(end + DAY).toISOString() };
}

export function publishedWeeks(now = Date.now(), limit = 12) {
  const weeks: string[] = [];
  for (let time = Date.parse(`${latestCompletedWeek(now)}T00:00:00Z`); weeks.length < limit; time -= 7 * DAY) {
    const week = new Date(time).toISOString().slice(0, 10);
    if (week < FIRST_WEEK) break;
    weeks.push(week);
  }
  return weeks;
}

export type WeeklyObservation = {
  id: string; route: string; date: string; provider: string; providerSlug: string;
  sourceAmount: number; sourceCurrency: string; recipientAmount: number; recipientCurrency: string;
  fee: number; feeCurrency: string; evidenceType: string; promotion: boolean;
  eligibleForComparison: boolean; capturedAt: string; receiptUrl: string;
};

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function buildWeeklyReport(rows: DisplayQuoteRecord[], week: string, now = Date.now()) {
  const period = reportPeriod(week, now);
  if (!period) throw new RangeError("Unknown completed report week");
  const start = Date.parse(period.start);
  const end = Date.parse(period.endExclusive);
  const selectedCorridors = WEEKLY_ROUTES.map((slug) => corridors.find((item) => item.slug === slug)!);
  const bySlug = new Map(selectedCorridors.map((corridor) => [corridor.slug, corridor]));
  const latest = new Map<string, DisplayQuoteRecord>();
  for (const row of rows) {
    if (!row) continue;
    const corridor = bySlug.get(row.corridor_slug);
    const captured = Date.parse(row.captured_at);
    if (!corridor || !isUsableDisplayRecord(corridor, row, now) || captured < start || captured >= end) continue;
    const day = new Date(captured).toISOString().slice(0, 10);
    const key = `${corridor.slug}|${day}|${row.provider_slug}`;
    const previous = latest.get(key);
    if (!previous || captured > Date.parse(previous.captured_at)
      || (captured === Date.parse(previous.captured_at) && row.id > previous.id)) latest.set(key, row);
  }
  const observations: WeeklyObservation[] = [...latest.values()].map((row) => {
    const date = new Date(row.captured_at).toISOString().slice(0, 10);
    // A superseded receipt can describe its historical day. Invalid evidence never enters this selection.
    const eligibleForComparison = isRankEligible(bySlug.get(row.corridor_slug)!, {
      corridorSlug: row.corridor_slug, sourceAmount: row.source_amount, sourceCurrency: row.source_currency,
      recipientCurrency: row.recipient_currency, recipientAmount: row.recipient_amount, exchangeRate: row.exchange_rate,
      fundingMethod: row.funding_method, payoutMethod: row.payout_method, status: "current", capturedAt: row.captured_at,
      quoteType: row.quote_type, promotion: row.promotion, providerSlug: row.provider_slug,
    }, Date.parse(`${date}T00:00:00Z`) + DAY - 1);
    return {
      id: row.id, route: row.corridor_slug, date, provider: row.provider_name, providerSlug: row.provider_slug,
      sourceAmount: row.source_amount, sourceCurrency: row.source_currency, recipientAmount: row.recipient_amount,
      recipientCurrency: row.recipient_currency, fee: row.fee_amount, feeCurrency: row.fee_currency,
      evidenceType: row.quote_type, promotion: Boolean(row.promotion), eligibleForComparison,
      capturedAt: row.captured_at, receiptUrl: `${ORIGIN}/${row.corridor_slug}/receipts/${encodeURIComponent(row.id)}`,
    };
  }).sort((a, b) => a.route.localeCompare(b.route) || a.date.localeCompare(b.date) || a.providerSlug.localeCompare(b.providerSlug));
  const reports = selectedCorridors.map((corridor) => {
    const records = observations.filter((row) => row.route === corridor.slug);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start + index * DAY).toISOString().slice(0, 10);
      const daily = records.filter((row) => row.date === date);
      const eligible = daily.filter((row) => row.eligibleForComparison);
      const times = eligible.map((row) => Date.parse(row.capturedAt));
      const captureSpreadMinutes = times.length >= 2 ? (Math.max(...times) - Math.min(...times)) / 60_000 : null;
      const comparable = eligible.length >= 2 && captureSpreadMinutes! <= MAX_COMPARISON_SKEW_MS / 60_000;
      const best = comparable ? Math.max(...eligible.map((row) => row.recipientAmount)) : null;
      const worst = comparable ? Math.min(...eligible.map((row) => row.recipientAmount)) : null;
      return {
        date, observations: daily.length, qualifyingProviders: eligible.length, captureSpreadMinutes, comparable,
        reason: comparable ? "comparable" : !daily.length ? "no_observations" : eligible.length < 2 ? "fewer_than_two_qualifying_providers" : "captures_more_than_one_hour_apart",
        recipientGap: comparable ? best! - worst! : null,
        gapPercent: comparable ? (best! - worst!) / best! * 100 : null,
        highestRecipient: best, lowestRecipient: worst,
        highestProviders: comparable ? eligible.filter((row) => row.recipientAmount === best).map((row) => row.provider) : [],
        receipts: daily,
      };
    });
    const providers = [...new Set(records.map((row) => row.providerSlug))].map((providerSlug) => {
      const providerRows = records.filter((row) => row.providerSlug === providerSlug);
      const newest = [...providerRows].sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt))[0];
      return { providerSlug, provider: newest.provider, daysObserved: providerRows.length,
        qualifyingDays: providerRows.filter((row) => row.eligibleForComparison).length, latestReceipt: newest };
    }).sort((a, b) => a.provider.localeCompare(b.provider));
    return {
      route: corridor.slug, destination: corridor.toCountry, sourceAmount: corridor.testAmount,
      sourceCurrency: corridor.fromCurrency, recipientCurrency: corridor.toCurrency,
      daysWithEvidence: days.filter((day) => day.observations > 0).length, observations: records.length,
      comparableDays: days.filter((day) => day.comparable).length,
      medianGapPercent: median(days.flatMap((day) => day.gapPercent === null ? [] : [day.gapPercent])),
      providers, days,
    };
  });
  return {
    schemaVersion: "1.0" as const, period,
    methodology: {
      title: "Weekly UK transfer-cost evidence", canonical: `${ORIGIN}/research/weekly-transfer-costs/${week}`,
      source: "Retained OMT provider receipts", timezone: "UTC", sourceAmount: 200, sourceCurrency: "GBP",
      selection: "Latest usable matching receipt per provider, corridor and UTC day. A later indicative or promotional receipt supersedes an earlier qualifying receipt.",
      qualification: "Stored verified, non-promotional bank-transfer-to-bank-deposit observations. Historical superseded records are assessed for their capture day; invalid records are excluded.",
      comparison: "At least two qualifying providers, with all their daily final observations captured within 60 minutes. This is a comparison of observed offers, not a claim of a simultaneous market quote.",
      maxCaptureSpreadMinutes: 60,
      gapFormula: "100 * (highest recipient amount - lowest recipient amount) / highest recipient amount",
      limits: "Historical observations, not today's prices. Gaps are not exchange-rate markups or total costs against a mid-market rate. No pooled nominal payouts across currencies. Coverage is not the whole market. Rebuilt from retained receipts; corrections can change a dated report.",
    },
    totals: { routes: reports.length, daysWithEvidence: reports.reduce((sum, item) => sum + item.daysWithEvidence, 0),
      observations: observations.length, comparableRouteDays: reports.reduce((sum, item) => sum + item.comparableDays, 0) },
    corridors: reports,
  };
}

export type WeeklyReport = ReturnType<typeof buildWeeklyReport>;

export function weeklyReportCsv(report: WeeklyReport) {
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const header = ["route", "date", "provider", "source_amount", "source_currency", "recipient_amount", "recipient_currency", "fee", "fee_currency", "evidence_type", "promotion", "eligible_for_comparison", "captured_at", "receipt_url"];
  const rows = report.corridors.flatMap((corridor) => corridor.days.flatMap((day) => day.receipts.map((row) => [
    row.route, row.date, row.provider, row.sourceAmount, row.sourceCurrency, row.recipientAmount, row.recipientCurrency,
    row.fee, row.feeCurrency, row.evidenceType, row.promotion, row.eligibleForComparison, row.capturedAt, row.receiptUrl,
  ].map(escape).join(","))));
  return [header.join(","), ...rows].join("\r\n") + "\r\n";
}
