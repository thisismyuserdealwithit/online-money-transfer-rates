import { NextResponse } from "next/server";
import { getCorridor } from "@/lib/data";
import {
  getPublicRates,
  OMT_API_VERSION,
  OMT_PUBLIC_ORIGIN,
} from "@/lib/public-rates";

export const dynamic = "force-dynamic";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200, available?: boolean) {
  return NextResponse.json(body, {
    status,
    headers: {
      ...cors,
      "Cache-Control": available === false ? "no-store" : "public, max-age=60, s-maxage=300, stale-while-revalidate=900",
      "Access-Control-Expose-Headers": "X-OMT-Data-Available",
      ...(available === undefined ? {} : { "X-OMT-Data-Available": String(available) }),
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ route: string }> },
) {
  const { route } = await context.params;
  const corridor = getCorridor(route);
  if (!corridor) {
    return json({ error: "unknown_corridor", message: "That OMT corridor does not exist." }, 404);
  }

  const requested = Number(new URL(request.url).searchParams.get("history") ?? "14");
  const historyLimit = Number.isFinite(requested)
    ? Math.max(1, Math.min(30, Math.trunc(requested)))
    : 14;
  const rates = await getPublicRates(corridor, historyLimit);
  const corridorUrl = `${OMT_PUBLIC_ORIGIN}/${route}`;

  return json({
    apiVersion: OMT_API_VERSION,
    available: rates.available,
    ...(!rates.available ? { error: "data_unavailable" } : {}),
    generatedAt: new Date().toISOString(),
    corridor: {
      route,
      fromCountry: corridor.fromCountry,
      fromCurrency: corridor.fromCurrency,
      toCountry: corridor.toCountry,
      toCurrency: corridor.toCurrency,
      standardTestAmount: corridor.testAmount,
      url: corridorUrl,
    },
    current: rates.current,
    history: rates.history,
    useTerms: {
      price: "Free",
      attributionRequired: true,
      requiredLink: corridorUrl,
      wording: "Rates supplied by Online Money Transfer",
      placement: "The link must be clearly visible on the page where the rates appear.",
      timestampRequired: true,
      statusRequired: true,
      context: "Keep each displayed rate's capture time and evidence status with the figure.",
    },
    evidencePolicy: {
      receiptLinksOnly: true,
      priceRanking: "priceRank compares recipient amounts only among eligible verified, non-promotional bank-transfer to bank-deposit offers for this transfer case. Equal amounts share a rank. Array order is presentation order, not price rank.",
      comparisonScope: "Ranks describe the observed eligible offers in each snapshot, not every offer in the market. Use rankedRateCount to see the size of that comparison.",
      freshness: "Quotes older than 36 hours are labelled stale.",
    },
  }, rates.available ? 200 : 503, rates.available);
}
