import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/research/", "/api/v1/rates/"],
      disallow: [
        "/api/affiliate/",
        "/api/health",
        "/api/ingest",
        "/api/proof/",
        "/go/",
        "/proof/",
        "/*/receipts/",
        "/corridors/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
