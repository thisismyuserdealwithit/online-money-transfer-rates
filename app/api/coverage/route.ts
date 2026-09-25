import { NextResponse } from "next/server";
import { corridors } from "@/lib/data";
import { getCoverageDashboard, getProviderCoverage } from "@/lib/live-data";

import { providerReviews, providerCollectionLabel } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  const [coverage, providerCoverage] = await Promise.all([getCoverageDashboard(), getProviderCoverage()]);
  const reviews = new Map(providerReviews.map((review) => [review.slug, review]));
  const observations = new Map(providerCoverage.map((row) => [row.providerSlug, row]));
  const providers = [...new Set([...reviews.keys(), ...observations.keys()])].map((providerSlug) => {
    const review = reviews.get(providerSlug);
    const live = observations.get(providerSlug);
    return {
      providerSlug,
      providerName: review?.name ?? live?.providerName ?? providerSlug,
      reviewUrl: review ? `https://onlinemoneytransfer.co.uk/reviews/${providerSlug}` : null,
      collectionMethod: review?.collectionMethod ?? null,
      collectionStatus: review?.collectionStatus ?? null,
      collectionLabel: providerCollectionLabel(review, Boolean(live)),
      corridorCount: live?.corridorCount ?? 0,
      verifiedCount: live?.verifiedCount ?? 0,
      indicativeCount: live?.indicativeCount ?? 0,
      latestCapturedAt: live?.latestCapturedAt ?? null,
    };
  });
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
    providers,
    runs: coverage.runs,
  });
}
