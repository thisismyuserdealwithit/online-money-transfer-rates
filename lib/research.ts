import { query } from "@/lib/platform-runtime";
import {
  remittanceCountryInputs,
  rpwCorridorBenchmarks,
  type RpwCorridorBenchmark,
} from "@/lib/research-data";

type QuotePanelRow = {
  corridor_slug: string;
  provider_slug: string;
  recipient_amount: number;
  captured_at: string;
};

export type ResearchRow = {
  corridorSlug: string;
  country: string;
  code: string;
  dependencyPct: number | null;
  dependencyChange2019to2024Pp: number | null;
  remittancesReceivedUsd: number | null;
  growth2024Pct: number | null;
  cagr2019to2024Pct: number | null;
  remittancesToFdi2024: number | null;
  rpwBenchmark: RpwCorridorBenchmark | null;
  verifiedQuotes: number;
  nearBestQuotes: number;
  medianOpportunityGapPct: number | null;
  fullQuoteRangePct: number | null;
  latestCapture: string | null;
  liveEvidence: "awaiting" | "usable" | "strong";
};

export type RemittanceResearch = {
  rows: ResearchRow[];
  generatedAt: string;
  benchmarkedCorridors: number;
  measuredCorridors: number;
  comparableCorridors: number;
  latestCapture: string | null;
};

function median(values: number[]) {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

async function getCurrentVerifiedPanel() {
  try {
    const rows = await query<QuotePanelRow>(`
      SELECT q.corridor_slug, q.provider_slug, q.recipient_amount, q.captured_at
      FROM quotes q
      INNER JOIN (
        SELECT corridor_slug, provider_slug, MAX(captured_at) AS latest_capture
        FROM quotes
        WHERE corridor_slug LIKE 'uk-to-%'
          AND status != 'invalid'
          AND quote_type = 'verified'
          AND promotion = 0
        GROUP BY corridor_slug, provider_slug
      ) latest
        ON q.corridor_slug = latest.corridor_slug
        AND q.provider_slug = latest.provider_slug
        AND q.captured_at = latest.latest_capture
      WHERE q.status != 'invalid'
        AND q.quote_type = 'verified'
        AND q.promotion = 0
    `);
    const freshAfter = Date.now() - 36 * 60 * 60 * 1000;
    return rows.filter((row) => Date.parse(row.captured_at) >= freshAfter);
  } catch {
    return [];
  }
}

export async function getRemittanceResearch(): Promise<RemittanceResearch> {
  const panel = await getCurrentVerifiedPanel();
  const rows = remittanceCountryInputs.map((country) => {
    const quotes = panel.filter((quote) => quote.corridor_slug === country.corridorSlug);
    const amounts = quotes
      .map((quote) => Number(quote.recipient_amount))
      .filter((value) => Number.isFinite(value) && value > 0);
    const best = amounts.length ? Math.max(...amounts) : null;
    const worst = amounts.length ? Math.min(...amounts) : null;
    const middle = median(amounts);
    const hasComparablePanel = amounts.length >= 2;
    const medianOpportunityGapPct = hasComparablePanel && best && middle !== null ? ((best - middle) / best) * 100 : null;
    const fullQuoteRangePct = hasComparablePanel && best && worst !== null ? ((best - worst) / best) * 100 : null;
    const nearBestQuotes = best ? amounts.filter((amount) => amount >= best * 0.99).length : 0;
    const latestCapture = quotes.length ? quotes.map((quote) => quote.captured_at).sort().at(-1) ?? null : null;
    const dependencyChange2019to2024Pp = country.dependencyPct2024 === null || country.dependencyPct2019 === null
      ? null
      : country.dependencyPct2024 - country.dependencyPct2019;
    return {
      corridorSlug: country.corridorSlug,
      country: country.country,
      code: country.code,
      dependencyPct: country.dependencyPct2024,
      dependencyChange2019to2024Pp,
      remittancesReceivedUsd: country.remittancesReceivedUsd2024,
      growth2024Pct: country.growth2024Pct,
      cagr2019to2024Pct: country.cagr2019to2024Pct,
      remittancesToFdi2024: country.remittancesToFdi2024,
      rpwBenchmark: rpwCorridorBenchmarks[country.code] ?? null,
      verifiedQuotes: amounts.length,
      nearBestQuotes,
      medianOpportunityGapPct,
      fullQuoteRangePct,
      latestCapture,
      liveEvidence: amounts.length >= 5 ? "strong" : amounts.length >= 2 ? "usable" : "awaiting",
    } satisfies ResearchRow;
  }).sort((a, b) => (b.dependencyPct ?? -1) - (a.dependencyPct ?? -1));

  const captureDates = rows.flatMap((row) => row.latestCapture ? [row.latestCapture] : []).sort();
  return {
    rows,
    generatedAt: new Date().toISOString(),
    benchmarkedCorridors: rows.filter((row) => row.rpwBenchmark).length,
    measuredCorridors: rows.filter((row) => row.verifiedQuotes > 0).length,
    comparableCorridors: rows.filter((row) => row.verifiedQuotes >= 2).length,
    latestCapture: captureDates.at(-1) ?? null,
  };
}

export const getVulnerabilityIndex = getRemittanceResearch;

export function csvForVulnerabilityIndex(research: RemittanceResearch) {
  const heading = [
    "corridor", "country", "remittances_pct_gdp_2024", "dependency_change_2019_2024_pp",
    "remittances_received_usd_2024", "remittance_growth_2024_pct", "remittance_cagr_2019_2024_pct",
    "remittances_to_fdi_2024_ratio", "rpw_period", "rpw_avg_cost_200_pct", "rpw_avg_cost_500_pct",
    "rpw_services", "rpw_share_services_at_or_below_5_pct", "rpw_change_since_2015_pp",
    "fresh_verified_quotes", "quotes_within_1pct_of_best", "live_median_to_best_gap_pct",
    "live_full_quote_range_pct", "latest_capture_utc", "live_evidence",
  ];
  const lines = research.rows.map((row) => [
    row.corridorSlug, row.country, row.dependencyPct ?? "", row.dependencyChange2019to2024Pp ?? "",
    row.remittancesReceivedUsd ?? "", row.growth2024Pct ?? "", row.cagr2019to2024Pct ?? "",
    row.remittancesToFdi2024 ?? "", row.rpwBenchmark?.period ?? "", row.rpwBenchmark?.avgCost200Pct ?? "",
    row.rpwBenchmark?.avgCost500Pct ?? "", row.rpwBenchmark?.services ?? "",
    row.rpwBenchmark?.servicesAtOrBelow5Pct ?? "", row.rpwBenchmark?.changeSince2015Pp ?? "",
    row.verifiedQuotes, row.nearBestQuotes, row.medianOpportunityGapPct ?? "", row.fullQuoteRangePct ?? "",
    row.latestCapture ?? "", row.liveEvidence,
  ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
  return [heading.join(","), ...lines].join("\n");
}

export function formatUsd(value: number | null, digits = 1) {
  if (value === null) return "Not reported";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(digits)}bn`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(digits)}m`;
  return `$${Math.round(value).toLocaleString("en-GB")}`;
}
