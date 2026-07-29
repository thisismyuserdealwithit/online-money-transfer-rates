import type { MetadataRoute } from "next";
import { corridors } from "@/lib/data";
import { guides } from "@/lib/guides";
import { providerReviews } from "@/lib/reviews";
import { getCoverageDashboard, getProviderCoverage } from "@/lib/live-data";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const contentUpdated = new Date("2026-07-29T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dashboard, providerCoverage] = await Promise.all([
    getCoverageDashboard(),
    getProviderCoverage(),
  ]);
  const corridorUpdated = new Map(
    dashboard.corridors.map((row) => [row.corridorSlug, row.latestCapturedAt]),
  );
  const providerUpdated = new Map(
    providerCoverage.map((row) => [row.providerSlug, row.latestCapturedAt]),
  );
  const latestCapture = dashboard.corridors
    .map((row) => row.latestCapturedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  const currentDataUpdated = latestCapture ? new Date(latestCapture) : contentUpdated;

  return [
    { url: siteUrl, lastModified: currentDataUpdated, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/methodology`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/coverage`, lastModified: currentDataUpdated, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/guides`, lastModified: contentUpdated, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/api`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.7 },
    ...guides.map((guide) => ({
      url: `${siteUrl}/guides/${guide.slug}`,
      lastModified: contentUpdated,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    { url: `${siteUrl}/reviews`, lastModified: currentDataUpdated, changeFrequency: "daily", priority: 0.85 },
    ...providerReviews.map((review) => ({
      url: `${siteUrl}/reviews/${review.slug}`,
      lastModified: providerUpdated.get(review.slug)
        ? new Date(providerUpdated.get(review.slug)!)
        : contentUpdated,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    { url: `${siteUrl}/research`, lastModified: contentUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/research/uk-remittance-vulnerability-index`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/research/last-mile-tax`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: contentUpdated, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/authors/alon-rajic`, lastModified: contentUpdated, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/authors/russell-gous`, lastModified: contentUpdated, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/editorial-policy`, lastModified: contentUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/affiliate-disclosure`, lastModified: contentUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/cookie-policy`, lastModified: contentUpdated, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, lastModified: contentUpdated, changeFrequency: "yearly", priority: 0.2 },
    ...corridors.map((corridor) => ({
      url: `${siteUrl}/${corridor.slug}/`,
      lastModified: corridorUpdated.get(corridor.slug)
        ? new Date(corridorUpdated.get(corridor.slug)!)
        : contentUpdated,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
  ];
}
