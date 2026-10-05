import { getWeeklyReport } from "@/lib/weekly-transfer-data";
import { FIRST_WEEK, latestCompletedWeek, reportPeriod, weeklyReportCsv } from "@/lib/weekly-transfer-costs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const week = url.searchParams.get("week") ?? latestCompletedWeek();
  const format = url.searchParams.get("format") ?? "json";
  const time = Date.parse(week + "T00:00:00Z");
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(week) && Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === week && new Date(time).getUTCDay() === 0;
  const baseHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "X-OMT-Data-Available", "X-Content-Type-Options": "nosniff" };
  if (!validDate || !["json", "csv"].includes(format)) return Response.json({ error: "invalid_request", message: "Use a real Sunday in YYYY-MM-DD format and format=json or csv." }, { status: 400, headers: { ...baseHeaders, "Cache-Control": "no-store" } });
  if (!reportPeriod(week)) return Response.json({ error: "edition_not_found", firstWeek: FIRST_WEEK, latestWeek: latestCompletedWeek() }, { status: 404, headers: { ...baseHeaders, "Cache-Control": "no-store" } });
  const result = await getWeeklyReport(week);
  if (!result.available) return Response.json({ available: false, error: "data_unavailable", period: result.period }, { status: 503, headers: { ...baseHeaders, "Cache-Control": "no-store", "X-OMT-Data-Available": "false" } });
  const headers = { ...baseHeaders, "Cache-Control": "public, max-age=300", "X-OMT-Data-Available": "true" };
  if (format === "csv") return new Response(weeklyReportCsv(result.report), { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="omt-weekly-transfer-costs-${week}.csv"` } });
  return Response.json({ available: true, generatedAt: new Date().toISOString(), report: result.report }, { headers });
}
