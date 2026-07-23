import { getObject, queryOne } from "@/lib/platform-runtime";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne<{ screenshot_key: string }>("SELECT screenshot_key FROM quotes WHERE id = ? LIMIT 1", [id]);
  if (!row) return new Response("Not found", { status: 404 });
  const object = await getObject(row.screenshot_key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  if (object.contentType) headers.set("content-type", object.contentType);
  if (object.cacheControl) headers.set("cache-control", object.cacheControl);
  if (object.etag) headers.set("etag", object.etag);
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
