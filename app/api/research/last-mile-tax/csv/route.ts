import study from "@/lib/last-mile-data.json";

function field(value: string | number | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const header = [
    "destination_code", "destination_country", "income_group", "period", "service_observations", "distinct_firms",
    "estimated_cost_gbp_on_gbp_200", "estimated_total_cost_pct", "cash_service_count", "account_service_count", "mobile_wallet_service_count", "cash_service_share_pct",
    "cash_average_cost_pct", "account_average_cost_pct", "mobile_wallet_average_cost_pct",
    "account_ownership_pct", "account_ownership_year", "unbanked_adults_pct", "control_of_corruption_score_0_100", "control_of_corruption_year",
    "political_stability_score_0_100", "political_stability_year", "internet_use_pct", "internet_use_year", "rural_population_pct", "rural_population_year",
    "atms_per_100k_adults", "atm_year", "commercial_bank_branches_per_100k_adults", "branch_year", "gdp_per_capita_usd", "gdp_year",
    "price_source", "financial_inclusion_source", "governance_source",
  ];
  const rows = study.corridorRows.map((row) => [
    row.code, row.country, row.income, study.period, row.services, row.firms,
    row.avgCostGbp200, row.avgCostPct, row.cashServices, row.accountServices, row.walletServices, row.cashSharePct,
    row.cashAvgCostPct, row.accountAvgCostPct, row.walletAvgCostPct,
    row.accountOwnershipPct, row.accountOwnershipPctYear, row.unbankedPct, row.corruptionControlScore, row.corruptionControlScoreYear,
    row.politicalStabilityScore, row.politicalStabilityScoreYear, row.internetUsePct, row.internetUsePctYear, row.ruralPopulationPct, row.ruralPopulationPctYear,
    row.atmsPer100k, row.atmsPer100kYear, row.branchesPer100k, row.branchesPer100kYear, row.gdpPerCapitaUsd, row.gdpPerCapitaUsdYear,
    "https://datacatalog.worldbank.org/search/dataset/0037898/remittance-prices-worldwide",
    "https://data.worldbank.org/indicator/FX.OWN.TOTL.ZS",
    "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
  ].map(field).join(","));
  return new Response([header.join(","), ...rows].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=uk-remittance-last-mile-country-panel-2026.csv",
      "cache-control": "public, max-age=3600",
    },
  });
}
