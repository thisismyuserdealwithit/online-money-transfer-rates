import { siteUrl } from "@/lib/seo";

export function GET() {
  return new Response(
    `Contact: ${siteUrl}/about\nCanonical: ${siteUrl}/.well-known/security.txt\nPreferred-Languages: en\nExpires: 2027-07-29T00:00:00.000Z\n`,
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=86400",
      },
    },
  );
}
