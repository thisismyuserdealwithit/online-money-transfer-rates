import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { money } from "@/lib/data";
import { publishedWeeks, type WeeklyReport } from "@/lib/weekly-transfer-costs";
import type { getWeeklyReport } from "@/lib/weekly-transfer-data";
import styles from "./WeeklyTransferReport.module.css";

const origin = "https://onlinemoneytransfer.co.uk";
const shortDate = (value: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
const percent = (value: number | null) => value === null ? "Not enough evidence" : value.toFixed(2) + "%";
const dailyReason = (reason: string) => reason === "no_observations" ? "No saved observation" : reason === "fewer_than_two_qualifying_providers" ? "Fewer than two qualifying providers" : "Checks more than one hour apart";

function CorridorFindings({ corridor }: { corridor: WeeklyReport["corridors"][number] }) {
  return <section className={styles.corridor} id={corridor.route}>
    <div className={styles.heading}><div><span className="kicker">GBP → {corridor.recipientCurrency}</span><h2>Sending £200 to {corridor.destination}</h2></div><Link href={`/${corridor.route}`}>See latest provider results →</Link></div>
    <p>{corridor.comparableDays
      ? `Across ${corridor.comparableDays} comparable day${corridor.comparableDays === 1 ? "" : "s"}, the median gap between the highest and lowest observed recipient amounts was ${percent(corridor.medianGapPercent)}. We retained ${corridor.observations} provider-day records across ${corridor.daysWithEvidence} of the seven days.`
      : `The saved evidence does not support a daily price comparison for this week. We retained ${corridor.observations} provider-day records across ${corridor.daysWithEvidence} of seven days; the table below explains which comparison checks were not met.`}</p>
    <div className={styles.scroll}><table><caption>Daily evidence and recipient-amount range</caption><thead><tr><th scope="col">UTC day</th><th scope="col">Records / qualifying</th><th scope="col">Observed payout range</th><th scope="col">Gap</th></tr></thead><tbody>
      {corridor.days.map((day) => <tr key={day.date}><th scope="row">{shortDate(day.date)}</th><td>{day.observations} / {day.qualifyingProviders}</td><td>{day.comparable
        ? <>{money(day.lowestRecipient!, corridor.recipientCurrency)} to {money(day.highestRecipient!, corridor.recipientCurrency)}<small>Highest observed: {day.highestProviders.join(", ")} · checks within {Math.ceil(day.captureSpreadMinutes!)} minutes</small></>
        : <span>{dailyReason(day.reason)}</span>}</td><td>{day.comparable ? percent(day.gapPercent) : "—"}</td></tr>)}
    </tbody></table></div>
    <p className={styles.note}>The gap is relative to the highest observed payout. It is not an exchange-rate markup or a whole-market saving. A provider must qualify for the day and the set of qualifying checks must fall within one hour.</p>
    <details className={styles.details}><summary>Inspect providers and source receipts ({corridor.providers.length} providers)</summary>
      {corridor.providers.length ? <div className={styles.scroll}><table><caption>Observation coverage during this week</caption><thead><tr><th scope="col">Provider</th><th scope="col">Days observed</th><th scope="col">Days qualifying</th><th scope="col">Latest receipt in week</th></tr></thead><tbody>
        {corridor.providers.map((provider) => <tr key={provider.providerSlug}><th scope="row">{provider.provider}</th><td>{provider.daysObserved} / 7</td><td>{provider.qualifyingDays} / 7</td><td><a href={provider.latestReceipt.receiptUrl}>{shortDate(provider.latestReceipt.capturedAt)} · {provider.latestReceipt.evidenceType}</a></td></tr>)}
      </tbody></table></div> : <p>No usable matching receipts were retained for this route and period.</p>}
      {corridor.days.filter((day) => day.receipts.length).map((day) => <details className={styles.day} key={day.date}><summary>{shortDate(day.date)}: open {day.receipts.length} source receipts</summary><ul>
        {day.receipts.map((receipt) => <li key={receipt.id}><a href={receipt.receiptUrl}>{receipt.provider}: {money(receipt.recipientAmount, receipt.recipientCurrency)}</a> · {new Date(receipt.capturedAt).toISOString()} · {receipt.evidenceType}{receipt.promotion ? " · promotion" : ""} · {receipt.eligibleForComparison ? "qualifying observation" : "outside comparison"}</li>)}
      </ul></details>)}
    </details>
  </section>;
}

export function WeeklyTransferReport({ result, week, latest = false }: { result: Awaited<ReturnType<typeof getWeeklyReport>>; week: string; latest?: boolean }) {
  const path = `/research/weekly-transfer-costs/${week}`;
  const report = result.available ? result.report : null;
  const api = `/api/research/weekly-transfer-costs?week=${week}`;
  const title = `Weekly UK transfer-cost evidence: week ending ${shortDate(week)}`;
  const schema = report && report.totals.observations > 0 ? {
    "@context": "https://schema.org", "@type": "Dataset", "@id": origin + path + "#dataset",
    name: title, description: "Historical £200 UK bank-transfer observations for five destinations. Daily payout ranges require at least two qualifying providers checked within one hour.",
    url: origin + path, temporalCoverage: report.period.start + "/" + new Date(Date.parse(report.period.endExclusive) - 1).toISOString(),
    creator: { "@type": "Organization", name: "Finofin Limited", url: origin + "/about" },
    measurementTechnique: report.methodology.selection + " " + report.methodology.comparison,
    variableMeasured: ["Recipient amount", "Transfer fee", "Capture time", "Evidence qualification", "Daily observed payout gap"],
    distribution: ["json", "csv"].map((format) => ({ "@type": "DataDownload", encodingFormat: format === "json" ? "application/json" : "text/csv", contentUrl: origin + api + "&format=" + format })),
    conditionsOfAccess: "Public access. Reuse is subject to the API terms and underlying provider rights.",
  } : null;
  return <><SiteHeader /><main className={styles.report}>
    {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}
    <header className={styles.hero}><div className="shell"><div className="crumbs"><Link href="/research">Research</Link><span>›</span><span>Weekly evidence</span></div>
      <span className="kicker">DATED PROVIDER EVIDENCE · £200 UK TRANSFERS</span>
      <h1>{latest ? "What a week of transfer checks can tell you" : title}</h1>
      <p>Compare the saved offers for Spain, the United States, India, Pakistan and the Philippines. Each destination keeps its own currency, sample size and receipts.</p>
      <p><strong>Observation week: {shortDate(new Date(Date.parse(week) - 6 * 86_400_000).toISOString())} to {shortDate(week)} (UTC).</strong> Historical evidence; these are not today&apos;s prices.</p>
      <nav className={styles.links} aria-label="Report tools"><Link href={path}>Dated edition</Link><a href={api + "&format=csv"}>Download CSV</a><a href={api + "&format=json"}>Read JSON</a><a href="#weekly-method">Method and limitations</a><a href="#cite-this-report">Cite this report</a></nav>
    </div></header>
    <div className="shell">
      {!result.available ? <section className={styles.corridor} role="status"><h2>Saved evidence is temporarily unavailable</h2><p>The report could not read the receipt archive. This is a data-access problem, so no zero counts or price findings are shown. Please try again shortly.</p></section> : <>
        <div className={styles.stats}><div><b>{report!.totals.observations}</b><span>provider-day records</span></div><div><b>{report!.totals.daysWithEvidence} / 35</b><span>route-days with evidence</span></div><div><b>{report!.totals.comparableRouteDays} / 35</b><span>route-days passing comparison checks</span></div></div>
        <nav className={styles.links} aria-label="Choose a destination">{report!.corridors.map((corridor) => <a key={corridor.route} href={"#" + corridor.route}>{corridor.destination}</a>)}</nav>
        {report!.corridors.map((corridor) => <CorridorFindings key={corridor.route} corridor={corridor} />)}
      </>}
      <section className={styles.corridor} id="weekly-method"><span className="kicker">HOW TO READ THE FIGURES</span><h2>One transfer case, seven separate daily comparisons</h2>
        <p>We use the latest usable matching receipt for each provider, route and UTC day. The transfer case is £200 funded by bank transfer and paid into a bank account. Records must match the route, currencies and amount. Invalid records are excluded.</p>
        <p>A qualifying observation is stored as verified and non-promotional. Calculator estimates, introductory offers and other payment methods remain visible in the evidence but cannot set the daily payout range. If a later indicative result replaces an earlier verified result on the same day, we keep the later result; we do not revive the more favourable earlier evidence.</p>
        <p>We compare a day only when it has at least two qualifying providers and all their final checks fall within 60 minutes. Rates can still move inside that window. Superseded receipts are assessed for the day they were captured, so an old receipt can support a historical comparison without becoming a current quote.</p>
        <p>The daily gap is 100 × (highest payout − lowest payout) ÷ highest payout. The weekly figure is the median of the qualifying daily gaps, with the number of comparable days stated beside it. We do not combine nominal payouts in different currencies or infer a fee against a mid-market rate from this gap.</p>
        <p>Coverage depends on which public provider sources could be checked and retained. A missing result does not show that a provider is unavailable or expensive. Fees, eligibility and the final checkout price can change; use the latest route page before making a transfer. The original receipts describe the evidence source, including any published-rate or fee-schedule inputs.</p>
        <p>Dated editions are reconstructed from the retained archive. Corrections or invalidated receipts can change an edition. When citing a number, retain the downloaded data and state the date accessed.</p>
        <div className={styles.links}><Link href="/methodology">Quote methodology</Link><Link href="/affiliate-disclosure">Commercial disclosure</Link><Link href="/api/terms">Data reuse terms</Link></div>
      </section>
      <section className={styles.corridor} id="cite-this-report"><h2>Cite this report</h2>
        <p>Online Money Transfer, Finofin Limited. <cite>{title}</cite>. Observation period ends {week}. <a href={origin + path}>{origin + path}</a>. Accessed {shortDate(new Date().toISOString())}.</p>
        <p>Quote the destination and number of comparable days with any median gap. Link to the dated edition and its source receipts.</p>
      </section>
      <section className={styles.corridor}><h2>Available weekly editions</h2><nav className={styles.links} aria-label="Weekly editions">{publishedWeeks().map((edition) => <Link key={edition} href={`/research/weekly-transfer-costs/${edition}`}>Week ending {shortDate(edition)}</Link>)}</nav><AuthorPanel label="RESEARCH TEAM" /></section>
    </div>
  </main><SiteFooter /></>;
}
