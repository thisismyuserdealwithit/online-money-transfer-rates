import { NextResponse } from "next/server";
import { corridors } from "@/lib/data";
import { getCoverageDashboard } from "@/lib/live-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const coverage = await getCoverageDashboard();
  const populatedCorridors = coverage.corridors.filter((corridor) => corridor.providerCount > 0).length;
  const latestProviderRecords = coverage.corridors.reduce((sum, corridor) => sum + corridor.providerCount, 0);
  const newestCaptureAt = coverage.corridors
    .map((corridor) => corridor.latestCapturedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  return NextResponse.json({
    expectedCorridors: corridors.length,
    populatedCorridors,
    latestProviderRecords,
    newestCaptureAt,
    corridors: coverage.corridors,
    runs: coverage.runs,
  });
}
