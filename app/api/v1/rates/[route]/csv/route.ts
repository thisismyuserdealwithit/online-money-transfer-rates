import { getCorridor } from "@/lib/data";
import { getPublicRates } from "@/lib/public-rates";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" } });
}

export async function GET(request: Request, { params }: { params: Promise<{ route: string }> }) {
  const { route } = await params;
  const corridor = getCorridor(route);
  if (!corridor) return Response.json({ error: "unknown_corridor" }, { status: 404 });
  const requested = Number(new URL(request.url).searchParams.get("history") ?? "14");
  const data = await getPublicRates(corridor, Number.isFinite(requested) ? Math.max(1, Math.min(30, Math.trunc(requested))) : 14);
  const rows = [data.current, ...data.history].flatMap((snapshot) => snapshot.rates.map((rate) => [
    snapshot.id, snapshot.kind, snapshot.capturedAt, rate.provider, rate.eligibleForPriceRanking, rate.sourceAmount,
    rate.sourceCurrency, rate.recipientAmount, rate.recipientCurrency, rate.exchangeRate, rate.feeAmount,
    rate.feeCurrency, rate.fundingMethod, rate.payoutMethod, rate.promotion, rate.capturedAt, rate.receiptUrl,
  ]));
  const header = ["snapshot_id", "snapshot_kind", "snapshot_time", "provider", "eligible_for_ranking", "source_amount", "source_currency", "recipient_amount", "recipient_currency", "exchange_rate", "fee_amount", "fee_currency", "funding_method", "payout_method", "promotion", "captured_at", "receipt_url"];
  const body = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${route}-rates.csv"`, "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=900" } });
}
