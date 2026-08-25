import { postman } from "@/lib/api-discovery";

export function GET() {
  return Response.json(postman, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
