import { openapi } from "@/lib/api-discovery";

export function GET() {
  return Response.json(openapi, {
    headers: {
      "Content-Type": "application/vnd.oai.openapi+json;version=3.1",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
