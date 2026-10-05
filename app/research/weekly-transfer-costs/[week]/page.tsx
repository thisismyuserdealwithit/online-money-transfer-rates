import { notFound } from "next/navigation";
import { WeeklyTransferReport } from "@/components/WeeklyTransferReport";
import { reportPeriod } from "@/lib/weekly-transfer-costs";
import { getWeeklyReport } from "@/lib/weekly-transfer-data";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  if (!reportPeriod(week)) return {};
  return pageMetadata({ title: `UK Transfer-Cost Evidence: Week Ending ${week}`, description: "Historical £200 provider observations for five UK routes, with sample sizes, daily comparison checks and original receipts.", path: `/research/weekly-transfer-costs/${week}` });
}
export default async function Page({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  if (!reportPeriod(week)) notFound();
  return <WeeklyTransferReport week={week} result={await getWeeklyReport(week)} />;
}
