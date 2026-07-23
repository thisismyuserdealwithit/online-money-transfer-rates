import { query, queryOne, runtimeValue } from "@/lib/platform-runtime";

export async function GET(request: Request) {
  const configuredToken = runtimeValue("AFFILIATE_REPORT_TOKEN");
  const suppliedToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (typeof configuredToken !== "string" || !configuredToken || suppliedToken !== configuredToken) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const days = Math.min(365, Math.max(1, Number.parseInt(url.searchParams.get("days") ?? "30", 10) || 30));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  try {
    const [totals, providers, corridors, daily] = await Promise.all([
      queryOne(`SELECT COUNT(*) AS clicks,
        COUNT(DISTINCT CASE WHEN session_hash IS NOT NULL THEN session_hash END) AS consented_sessions,
        SUM(commercial) AS commercial_clicks
        FROM affiliate_clicks WHERE clicked_at >= ?`, [since]),
      query(`SELECT provider_slug, COUNT(*) AS clicks
        FROM affiliate_clicks WHERE clicked_at >= ?
        GROUP BY provider_slug ORDER BY clicks DESC`, [since]),
      query(`SELECT corridor_slug, COUNT(*) AS clicks
        FROM affiliate_clicks WHERE clicked_at >= ? AND corridor_slug IS NOT NULL
        GROUP BY corridor_slug ORDER BY clicks DESC LIMIT 100`, [since]),
      query(`SELECT substr(clicked_at, 1, 10) AS day, COUNT(*) AS clicks
        FROM affiliate_clicks WHERE clicked_at >= ?
        GROUP BY day ORDER BY day ASC`, [since]),
    ]);
    return Response.json({ periodDays: days, since, totals, providers, corridors, daily }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ periodDays: days, since, totals: { clicks: 0, consented_sessions: 0, commercial_clicks: 0 }, providers: [], corridors: [], daily: [] }, { headers: { "cache-control": "no-store" } });
  }
}
