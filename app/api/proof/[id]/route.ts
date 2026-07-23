import { env } from "cloudflare:workers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await env.DB.prepare("SELECT screenshot_key FROM quotes WHERE id = ? LIMIT 1").bind(id).first<{ screenshot_key: string }>();
  if (!row) return new Response("Not found", { status: 404 });
  const object = await env.BUCKET.get(row.screenshot_key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
