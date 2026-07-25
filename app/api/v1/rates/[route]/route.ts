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

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      ...cors,
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=900",
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
  const rates = await getPublicRates(route, historyLimit);
  const corridorUrl = `${OMT_PUBLIC_ORIGIN}/${route}/`;

  return json({
    apiVersion: OMT_API_VERSION,
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
    },
    evidencePolicy: {
      receiptLinksOnly: true,
      priceRanking: "Verified, non-promotional bank-transfer quotes only.",
      freshness: "Quotes older than 36 hours are labelled stale.",
    },
  });
}
