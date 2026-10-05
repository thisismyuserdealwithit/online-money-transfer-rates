import { WeeklyTransferReport } from "@/components/WeeklyTransferReport";
import { latestCompletedWeek } from "@/lib/weekly-transfer-costs";
import { getWeeklyReport } from "@/lib/weekly-transfer-data";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "Weekly UK Transfer-Cost Evidence: Five £200 Routes", description: "Compare a week of dated provider receipts for five UK money-transfer routes, with daily payout gaps, coverage counts and downloadable data.", path: "/research/weekly-transfer-costs" });
export default async function Page() {
  const week = latestCompletedWeek();
  return <WeeklyTransferReport week={week} result={await getWeeklyReport(week)} latest />;
}
