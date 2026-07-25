import type { MetadataRoute } from "next";
import { corridors } from "@/lib/data";
import { guides } from "@/lib/guides";
import { providerReviews } from "@/lib/reviews";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://onlinemoneytransfer.co.uk";
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/methodology`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/coverage`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/api`, changeFrequency: "monthly", priority: 0.7 },
    ...guides.map((guide) => ({ url: `${base}/guides/${guide.slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    { url: `${base}/reviews`, changeFrequency: "daily", priority: 0.85 },
    ...providerReviews.map((review) => ({ url: `${base}/reviews/${review.slug}`, changeFrequency: "daily" as const, priority: 0.85 })),
    { url: `${base}/research`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/research/uk-remittance-vulnerability-index`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/research/last-mile-tax`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/authors/alon-rajic`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/authors/russell-gous`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/editorial-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/affiliate-disclosure`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookie-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...corridors.map((corridor) => ({ url: `${base}/${corridor.slug}/`, changeFrequency: "daily" as const, priority: 0.85 })),
  ];
}
