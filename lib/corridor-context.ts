import { corridors, type Corridor } from "./data";
import lastMile from "./last-mile-data.json";

export function getHistoricalCorridorContext(corridor: Corridor) {
  if (corridor.fromCode !== "GB" || corridor.fromCurrency !== "GBP") return null;
  const row = lastMile.corridorRows.find((item) => item.code === corridor.toCode);
  if (!row) return null;
  const ordered = [...lastMile.corridorRows].sort((a, b) => a.avgCostPct - b.avgCostPct);
  // Only licensed price fields are selected; internet-use indicators are excluded.
  const peers = ordered.filter((item) => item.code !== row.code && corridors.some((route) => route.fromCode === "GB" && route.toCode === item.code)).sort((a,b) => Math.abs(a.avgCostPct-row.avgCostPct)-Math.abs(b.avgCostPct-row.avgCostPct)).slice(0,3).map((item) => ({ country: item.country, costGbp: item.avgCostGbp200, slug: corridors.find((route) => route.fromCode === "GB" && route.toCode === item.code)!.slug }));
  return { period: lastMile.period, amountGbp: lastMile.basket.displayAmountGbp, averageCostPct: row.avgCostPct, averageCostGbp: row.avgCostGbp200, services: row.services, firms: row.firms, rank: ordered.findIndex((item) => item.code === row.code)+1, totalCorridors: ordered.length,
    payouts: [{ name: "Bank account", services: row.accountServices, costPct: row.accountAvgCostPct }, { name: "Cash collection", services: row.cashServices, costPct: row.cashAvgCostPct }, { name: "Mobile wallet", services: row.walletServices, costPct: row.walletAvgCostPct }].filter((item) => item.services > 0 && item.costPct !== null), peers };
}
