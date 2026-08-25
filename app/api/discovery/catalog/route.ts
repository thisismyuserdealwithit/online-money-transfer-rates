import { apiCatalog } from "@/lib/api-discovery";

const headers = {
  "Content-Type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
  "Access-Control-Allow-Origin": "*",
  Link: '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
};

export function GET() {
  return new Response(JSON.stringify(apiCatalog), { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
