import study from "@/lib/last-mile-data.json";

function field(value: string | number | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const header = [
    "destination_code", "destination_country", "provider", "funding_instrument", "speed",
    "estimated_account_cost_pct", "estimated_account_cost_gbp_on_gbp_200",
    "estimated_cash_cost_pct", "estimated_cash_cost_gbp_on_gbp_200",
    "cash_premium_percentage_points", "cash_premium_gbp_on_gbp_200", "fee_difference_gbp", "fx_margin_difference_percentage_points",
    "matching_rule", "price_source",
  ];
  const rows = study.strictPairs.map((row) => [
    row.code, row.country, row.provider, row.funding, row.speed,
    row.accountCostPct, row.accountCostPct * 2, row.cashCostPct, row.cashCostPct * 2,
    row.premiumPp, row.premiumGbp200, row.feeDifferenceGbp, row.fxDifferencePp,
    "Same provider, corridor, funding instrument, access point, speed, collection date and receiving network coverage",
    "https://datacatalog.worldbank.org/search/dataset/0037898/remittance-prices-worldwide",
  ].map(field).join(","));
  return new Response([header.join(","), ...rows].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=uk-remittance-matched-cash-account-offers-q3-2025.csv",
      "cache-control": "public, max-age=3600",
    },
  });
}
