import { queryOne } from "@/lib/platform-runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await queryOne<{ ok: number }>("SELECT 1 AS ok");
    if (Number(result?.ok) !== 1) throw new Error("Database check failed");
    return Response.json({ status: "ok" }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json({ status: "unavailable" }, {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}
