import { NextResponse } from "next/server";
import { corridors } from "@/lib/data";
import { OMT_API_VERSION, OMT_PUBLIC_ORIGIN } from "@/lib/public-rates";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET() {
  return NextResponse.json({
    apiVersion: OMT_API_VERSION,
    generatedAt: new Date().toISOString(),
    count: corridors.length,
    corridors: corridors.map((corridor) => ({
      route: corridor.slug,
      group: corridor.group,
      fromCountry: corridor.fromCountry,
      fromCode: corridor.fromCode,
      fromCurrency: corridor.fromCurrency,
      toCountry: corridor.toCountry,
      toCode: corridor.toCode,
      toCurrency: corridor.toCurrency,
      standardTestAmount: corridor.testAmount,
      url: `${OMT_PUBLIC_ORIGIN}/${corridor.slug}`,
      ratesUrl: `${OMT_PUBLIC_ORIGIN}/api/v1/rates/${corridor.slug}`,
    })),
  }, {
    headers: {
      ...cors,
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
