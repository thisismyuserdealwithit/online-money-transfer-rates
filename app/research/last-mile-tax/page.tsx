import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthorPanel } from "@/components/AuthorPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import study from "@/lib/last-mile-data.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "The Cost of Cash Remittances: £122.76 a Year on Monthly UK Transfers",
  description: "A UK worker sending £200 each month pays £122.76 a year in average cash-transfer costs. See the matched cash penalties and what creates them.",
  path: "/research/last-mile-tax",
  type: "article",
  publishedTime: "2026-07-22",
  modifiedTime: "2026-07-29",
  authors: ["Alon Rajic", "Russell Gous"],
  socialTitle: "The Last Mile Tax: Why Cash Collection Costs More",
  socialDescription: "Our study of 791 UK remittance services puts the cash premium into pounds and working hours.",
});

const sources = {
  prices: "https://datacatalog.worldbank.org/search/dataset/0037898/remittance-prices-worldwide",
  findex: "https://www.worldbank.org/en/publication/globalfindex/download-data",
  findexReport: "https://www.worldbank.org/en/publication/globalfindex/report",
  findexGlobal: "https://blogs.worldbank.org/en/allaboutfinance/digital-technology-is-unlocking-financial-inclusion",
  findexMethod: "https://www.worldbank.org/en/publication/globalfindex/methodology",
  findexBarriers: "https://www.worldbank.org/en/publication/globalfindex/brief/data-from-the-global-findex-2021-progress-and-obstacles",
  accountOwnership: "https://data.worldbank.org/indicator/FX.OWN.TOTL.ZS",
  governance: "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
  branches: "https://data.worldbank.org/indicator/FB.CBK.BRCH.P5",
  atms: "https://data.worldbank.org/indicator/FB.ATM.TOTL.P5",
  internet: "https://data.worldbank.org/indicator/IT.NET.USER.ZS",
  swift: "https://www.swift.com/about-us/who-we-are/what-swift",
  onsEarnings: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025",
};

type CorridorRow = (typeof study.corridorRows)[number];

function pct(value: number | null, digits = 1) {
  return value === null ? "Not reported" : `${value.toFixed(digits)}%`;
}

function number(value: number | null, digits = 1) {
  return value === null ? "Not reported" : value.toFixed(digits);
}

function money(value: number, digits = 2) {
  return `£${value.toFixed(digits)}`;
}

function compactMoney(value: number | null) {
  if (value === null) return "Not reported";
  return value >= 1000 ? `$${Math.round(value).toLocaleString("en-GB")}` : `$${value.toFixed(0)}`;
}

function chartPosition(row: CorridorRow): CSSProperties {
  return {
    left: `${Math.max(1, Math.min(99, row.unbankedPct ?? 0))}%`,
    bottom: `${Math.max(1, Math.min(99, row.cashSharePct))}%`,
  };
}

const labelledCountries = new Set(["South Sudan", "Afghanistan", "Pakistan", "The Gambia", "India", "Kenya", "Albania"]);

export default function LastMileTaxPage() {
  const cash = study.payoutMethods.find((row) => row.method === "Cash")!;
  const account = study.payoutMethods.find((row) => row.method === "Account")!;
  const wallet = study.payoutMethods.find((row) => row.method === "Mobile wallet")!;
  const ukMedianAnnualEarnings = 39039;
  const ukMedianHourlyEarnings = 19.67;
  const annualTransferValue = 200 * 12;
  const cashAnnualCost = cash.avgCostGbp200 * 12;
  const accountAnnualCost = account.avgCostGbp200 * 12;
  const rawAnnualCashGap = cashAnnualCost - accountAnnualCost;
  const adjustedAnnualCashGap = study.fixedEffectModel.cashPremiumGbp200 * 12;
  const rawGap = cash.avgCostGbp200 - account.avgCostGbp200;
  const matchedCostlier = Math.round(study.strictMatchedCashAccount.matchedOffers * study.strictMatchedCashAccount.cashCostlierSharePct / 100);
  const modelLowGbp = study.fixedEffectModel.confidenceLowPp * 2;
  const modelHighGbp = study.fixedEffectModel.confidenceHighPp * 2;
  const scatterRows = study.corridorRows.filter((row) => row.unbankedPct !== null);
  const modelMax = Math.max(...study.payoutMethods.map((row) => row.avgCostGbp200));
  const highestPairs = study.strictPairs.filter((row) => row.premiumGbp200 > 0).slice(0, 10);
  const maxPairPremium = highestPairs[0].premiumGbp200;
  const topPairCountries = new Set(highestPairs.map((row) => row.country));
  const topPairMoneyGram = highestPairs.filter((row) => row.provider === "MoneyGram").length;
  const topPairMaxUnbanked = Math.max(...highestPairs.map((pair) => study.corridorRows.find((row) => row.code === pair.code)?.unbankedPct ?? 0));
  const countryRows = [...study.corridorRows].sort((a, b) => b.cashSharePct - a.cashSharePct);
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: "The Last Mile Tax 2026",
    headline: "Cash collection adds an estimated £2.10 to a £200 UK remittance",
    datePublished: "2026-07-22",
    dateModified: "2026-07-22",
    author: [{ "@type": "Person", name: "Alon Rajic" }, { "@type": "Person", name: "Russell Gous" }],
    publisher: { "@type": "Organization", name: "Finofin Limited" },
    url: "https://onlinemoneytransfer.co.uk/research/last-mile-tax",
    about: ["remittances", "financial inclusion", "cash collection", "United Kingdom", "World Bank"],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <article>
          <header className="research-report-hero last-mile-hero">
            <div className="shell">
              <div className="research-breadcrumbs"><Link href="/research">Research</Link><span>›</span><b>The Last Mile Tax</b></div>
              <div className="report-hero-grid">
                <div>
                  <span className="report-edition">DATA EDITION · {study.edition.toUpperCase()}</span>
                  <h1>Need the £200 in cash? The transfer costs about <em>{money(study.fixedEffectModel.cashPremiumGbp200)} more</em></h1>
                  <p>Across 791 UK services, recipients without a usable account had fewer practical choices. Cash was usually the answer, and it came with a higher bill even after we allowed for harder routes.</p>
                  <div className="report-actions">
                    <Link href="/api/research/last-mile-tax/csv">Download the 33-country file</Link>
                    <a href="#salary-hit">Put the cost against UK pay</a>
                    <a href="#method">Check our calculation</a>
                  </div>
                </div>
                <aside className="report-definition last-mile-definition">
                  <span>THE MATCH WE WANTED</span>
                  <strong>Same company and destination. Same funding method. Only the way of receiving changes.</strong>
                  <p>We also match the date and delivery speed. One recipient gets an account credit; the other has to collect notes from an agent.</p>
                </aside>
              </div>
            </div>
          </header>

          <section className="report-snapshot shell last-mile-snapshot infographic-scoreboard">
            <div className="scoreboard-primary"><span>BEST ESTIMATE</span><strong>{money(study.fixedEffectModel.cashPremiumGbp200)}</strong><small>Extra cost for cash on £200</small></div>
            <div><span>FAIR MATCHES</span><strong>{matchedCostlier} of {study.strictMatchedCashAccount.matchedOffers}</strong><small>Cash cost more</small></div>
            <div><span>CASH CHEAPER</span><strong>0 of {study.strictMatchedCashAccount.matchedOffers}</strong><small>Not once in the matched sample</small></div>
            <div><span>COUNTRIES COMPARED</span><strong>{study.correlationsWithCashShare.unbankedPct.n}</strong><small>More exclusion usually meant more cash</small></div>
          </section>

          <section className="cash-conclusion-strip">
            <div className="shell">
              <span className="kicker">HOW THE EXTRA COST APPEARS</span>
              <div className="cash-conclusion-flow">
                <div><small>RECIPIENT HAS</small><strong>NO USABLE ACCOUNT</strong></div><b>→</b>
                <div><small>SO THEY NEED</small><strong>CASH COLLECTION</strong></div><b>→</b>
                <div><small>OUR BEST ESTIMATE</small><strong>+{money(study.fixedEffectModel.cashPremiumGbp200)}</strong></div>
              </div>
              <p>The £2.10 is an estimated average after allowing for the company and destination, plus the way the sender pays. It is not a tariff added to every cash transfer.</p>
            </div>
          </section>

          <section className="section shell unbanked-explainer">
            <div className="unbanked-title-grid">
              <div><span className="kicker">THE ACCESS PROBLEM</span><h2>Without a usable account, the transfer needs a counter</h2></div>
              <div>
                <div className="unbanked-global-number"><strong>1.3bn</strong><span>adults worldwide still have no financial account</span><small><a href={sources.findexGlobal}>Global Findex 2025</a></small></div>
                <p className="unbanked-lead">The World Bank counts an adult as unbanked when they have neither a financial-institution account nor a mobile-money account. Its measure covers people aged 15 and over.</p>
                <a href={sources.accountOwnership}>Read the World Bank definition →</a>
              </div>
            </div>

            <div className="unbanked-definition-grid">
              <article className="unbanked-definition-card">
                <span>WHAT THE NUMBER LOOKS LIKE AT STREET LEVEL</span>
                <strong>The sender pays from a sofa in Britain. The recipient may still travel across town and queue for notes.</strong>
                <p>Without a usable account, the recipient cannot simply wait for a bank credit. They may need a cash payout agent, acceptable identity documents, transport to the outlet and enough time to queue. Those travel and time costs are not included in our price data.</p>
              </article>
              <article className="unbanked-definition-card unbanked-definition-card--caution">
                <span>WHAT THE NUMBER CANNOT TELL US</span>
                <strong>A national average does not describe every person receiving money.</strong>
                <p>A national unbanked rate is an average, not a description of every remittance recipient. An adult counted as “banked” may still have a dormant account, an account that cannot accept this payment, poor access to a branch, or a good reason to prefer cash.</p>
              </article>
            </div>

            <div className="cash-journey" aria-label="How financial exclusion can turn into a cash collection premium">
              <div><b>1</b><span><strong>No usable account</strong><small>The recipient cannot receive a simple account credit.</small></span></div>
              <i>→</i>
              <div><b>2</b><span><strong>Cash becomes necessary</strong><small>A local agent, cash stock and manual handover are needed.</small></span></div>
              <i>→</i>
              <div><b>3</b><span><strong>Fewer practical choices</strong><small>The family compares only services that can pay out nearby.</small></span></div>
              <i>→</i>
              <div><b>4</b><span><strong>The transfer can cost more</strong><small>Higher fees or a weaker exchange rate create the penalty.</small></span></div>
            </div>

            <div className="unbanked-barriers">
              <div><span className="kicker">WHY PEOPLE REMAIN OUTSIDE THE SYSTEM</span><h3>Usually several barriers overlap</h3><p>World Bank survey work repeatedly points to lack of money, missing documentation, distance, service cost and distrust. Mobile money also depends on a phone, connectivity and the confidence to use it safely.</p><a href={sources.findexBarriers}>World Bank evidence on access barriers →</a></div>
              <ul>
                <li><strong>Not enough money</strong><span>An account can feel irrelevant or unaffordable when income is irregular.</span></li>
                <li><strong>No accepted documents</strong><span>ID, proof of address and other checks can stop an application.</span></li>
                <li><strong>Too far or too costly</strong><span>A branch may require a long journey and fees may outweigh the benefit.</span></li>
                <li><strong>No safe digital route</strong><span>A shared phone, weak signal, fraud fears or low digital confidence can block access.</span></li>
                <li><strong>Trust and household control</strong><span>Some people rely on a relative’s account or do not trust formal providers.</span></li>
              </ul>
            </div>

            <div className="editorial-note unbanked-note"><strong>Why Kenya looks different</strong><p>The World Bank treats mobile money as an account. Kenya can therefore record relatively low exclusion even where a conventional bank branch is not the main way people receive money.</p></div>
          </section>

          <section className="section shell report-section">
            <div className="report-intro-grid">
              <div><span className="kicker">THE PRICE RESULT</span><h2>The raw cash gap is too large, but it does not vanish</h2></div>
              <p>Cash is common on difficult routes, so the simple averages overstate its effect. After allowing for those differences, the estimated premium falls from £5.44 to £2.10.</p>
            </div>
            <div className="absolute-findings-grid">
              <article><span>CASH AVERAGE</span><strong>{money(cash.avgCostGbp200)}</strong><small>Cost to move £200</small></article>
              <article><span>ACCOUNT AVERAGE</span><strong>{money(account.avgCostGbp200)}</strong><small>Cost to move £200</small></article>
              <article className="absolute-finding-warn"><span>RAW DIFFERENCE</span><strong>+{money(rawGap)}</strong><small>Before allowing for harder routes</small></article>
              <article className="absolute-finding-primary"><span>FAIRER ESTIMATE</span><strong>+{money(study.fixedEffectModel.cashPremiumGbp200)}</strong><small>Likely range {money(modelLowGbp)} to {money(modelHighGbp)}</small></article>
            </div>
            <div className="absolute-conclusion"><span>OUR READING</span><strong>Financial exclusion creates the need for cash. The provider then decides how much of that inconvenience appears in its fee and customer rate.</strong></div>
          </section>

          <section className="section salary-hit-section" id="salary-hit">
            <div className="shell">
              <div className="salary-hit-heading">
                <div><span className="kicker">PUT IT AGAINST UK PAY</span><h2>A worker sending £200 each month spends <em>£122.76 a year</em> on average cash-transfer costs</h2></div>
                <aside><span>THE SCENARIO</span><strong>£200 sent each month</strong><small>£{annualTransferValue.toLocaleString("en-GB")} transferred over one year</small><a href={sources.onsEarnings}>ONS earnings source →</a></aside>
              </div>

              <div className="salary-hit-hero">
                <div className="salary-hit-main-number"><span>CASH TRANSFER COSTS TAKE</span><strong>{(cashAnnualCost / ukMedianAnnualEarnings * 100).toFixed(2)}%</strong><p>of the UK median full time gross salary of £{ukMedianAnnualEarnings.toLocaleString("en-GB")}</p></div>
                <div className="salary-hit-secondary"><span>AND CONSUME</span><strong>{(cashAnnualCost / ukMedianHourlyEarnings).toFixed(1)} hours</strong><p>of gross pay at the UK median hourly rate</p></div>
                <div className="salary-hit-secondary salary-hit-secondary--gold"><span>OVER FIVE YEARS</span><strong>{money(cashAnnualCost * 5)}</strong><p>is spent moving £12,000 in monthly £200 transfers</p></div>
              </div>

              <div className="salary-cost-race" aria-label="Annual cost comparison for monthly £200 transfers">
                <div className="salary-cost-row salary-cost-row--account">
                  <div><span>ACCOUNT DELIVERY</span><strong>{money(accountAnnualCost)}</strong><small>per year</small></div>
                  <div className="salary-cost-track"><i style={{ width: `${accountAnnualCost / cashAnnualCost * 100}%` }} /></div>
                  <div><strong>{(accountAnnualCost / ukMedianAnnualEarnings * 100).toFixed(2)}%</strong><small>of annual salary</small></div>
                  <div><strong>{account.avgCostPct.toFixed(2)}%</strong><small>of the money sent</small></div>
                </div>
                <div className="salary-cost-row salary-cost-row--cash">
                  <div><span>CASH COLLECTION</span><strong>{money(cashAnnualCost)}</strong><small>per year</small></div>
                  <div className="salary-cost-track"><i style={{ width: "100%" }} /></div>
                  <div><strong>{(cashAnnualCost / ukMedianAnnualEarnings * 100).toFixed(2)}%</strong><small>of annual salary</small></div>
                  <div><strong>{cash.avgCostPct.toFixed(2)}%</strong><small>of the money sent</small></div>
                </div>
              </div>

              <div className="salary-attention-grid">
                <article><span>CASH COSTS</span><strong>{(cash.avgCostGbp200 / account.avgCostGbp200).toFixed(1)}× more</strong><p>than account delivery in the observed averages.</p></article>
                <article><span>RAW ANNUAL GAP</span><strong>+{money(rawAnnualCashGap)}</strong><p>or {(rawAnnualCashGap / ukMedianHourlyEarnings).toFixed(1)} hours of median gross pay each year.</p></article>
                <article><span>FAIRER ANNUAL GAP</span><strong>+{money(adjustedAnnualCashGap)}</strong><p>{(adjustedAnnualCashGap / ukMedianAnnualEarnings * 100).toFixed(2)}% of salary after allowing for harder routes and different offers.</p></article>
              </div>

              <div className="salary-hit-warning"><strong>What these percentages do and do not say</strong><p>The salary comparison uses the ONS provisional 2025 median for full time employees and gross pay before tax. The transfer figures include both stated fees and exchange rate loss. The annual example assumes one £200 transfer every month. Different transfer amounts or frequency will change the result. Using take home pay would make the salary share larger.</p></div>
            </div>
          </section>

          <section className="section payout-method-section">
            <div className="shell">
              <div className="section-heading"><div><span className="kicker">THE DELIVERY METHOD</span><h2>Cash is the costliest observed final mile</h2><p>These are descriptive averages across the complete UK service panel, normalised to £200. They are not controlled comparisons.</p></div><Link href="/api/research/last-mile-tax">Open JSON →</Link></div>
              <div className="payout-cost-chart">
                {study.payoutMethods.map((row) => (
                  <div className={`payout-cost-row payout-${row.method.toLowerCase().replaceAll(" ", "-")}`} key={row.method}>
                    <div><strong>{row.method}</strong><small>{row.services} services · {row.corridors} corridors</small></div>
                    <div className="payout-bar-track"><span style={{ width: `${row.avgCostGbp200 / modelMax * 100}%` }} /></div>
                    <div><strong>{money(row.avgCostGbp200)}</strong><small>{pct(row.avgCostPct, 2)} of £200</small></div>
                  </div>
                ))}
              </div>
              <div className="cost-composition-grid">
                <div><span>CASH AVERAGE</span><strong>{money(cash.avgCostGbp200)}</strong><small>Fee {money(cash.avgFeeGbp)} · FX margin {pct(cash.avgFxMarginPct, 2)}</small></div>
                <div><span>ACCOUNT AVERAGE</span><strong>{money(account.avgCostGbp200)}</strong><small>Fee {money(account.avgFeeGbp)} · FX margin {pct(account.avgFxMarginPct, 2)}</small></div>
                <div><span>MOBILE WALLET AVERAGE</span><strong>{money(wallet.avgCostGbp200)}</strong><small>Fee {money(wallet.avgFeeGbp)} · FX margin {pct(wallet.avgFxMarginPct, 2)}</small></div>
              </div>
            </div>
          </section>

          <section className="section shell report-section">
            <div className="section-heading"><div><span className="kicker">THE TEN BIGGEST CASH PENALTIES</span><h2>What an extra cash charge looks like on a real £200 transfer</h2><p>These are the ten largest gaps among 17 like for like comparisons. In each one, the provider, destination, payment method, speed, date and network coverage are the same. Only the way the recipient gets the money changes.</p></div><Link href="/api/research/last-mile-tax/matched-offers/csv">Download all 17 comparisons →</Link></div>

            <div className="top-ten-scoreboard">
              <div><strong>10</strong><span>largest matched penalties</span></div>
              <div><strong>{topPairCountries.size}</strong><span>destination countries</span></div>
              <div><strong>{topPairMoneyGram}</strong><span>MoneyGram offers</span></div>
              <div><strong>{money(maxPairPremium)}</strong><span>largest extra cost</span></div>
            </div>

            <div className="top-ten-reading-guide">
              <div><span>THE SURPRISING PART</span><strong>The largest cash penalties are not concentrated in the most unbanked countries.</strong><p>These ten offers cover {topPairCountries.size} destinations, and none has more than {Math.round(topPairMaxUnbanked)} in every 100 adults unbanked. National exclusion helps explain where cash is needed. It does not, by itself, explain how much a particular company charges for cash.</p></div>
              <div><span>WHAT THE PROVIDER RESULT SAYS</span><strong>{topPairMoneyGram} of the top 10 are MoneyGram offers. The other {highestPairs.length - topPairMoneyGram} are Western Union.</strong><p>This is not an overall provider ranking. It describes specific offers captured in the World Bank dataset on a particular date. We can observe the customer price gap, but not the companies’ internal costs, so we call it a cash premium rather than a profit margin.</p></div>
            </div>

            <ol className="cash-penalty-list">
              {highestPairs.map((row, index) => {
                const context = study.corridorRows.find((country) => country.code === row.code)!;
                const accountCost = row.accountCostPct * 2;
                const cashCost = row.cashCostPct * 2;
                const fxCost = row.fxDifferencePp * 2;
                return (
                  <li key={`${row.provider}-${row.country}-${row.funding}-${row.cashCostPct}`}>
                    <div className="cash-penalty-rank"><span>#{index + 1}</span><i>{row.code}</i></div>
                    <div className="cash-penalty-story">
                      <div className="cash-penalty-heading"><div><span>{row.provider}</span><h3>Britain to {row.country}</h3><p>Paid by {row.funding.toLowerCase()} · stated speed: {row.speed.toLowerCase()}</p></div><strong>+{money(row.premiumGbp200)}</strong></div>
                      <div className="cash-penalty-scale" aria-hidden="true"><span style={{ width: `${row.premiumGbp200 / maxPairPremium * 100}%` }} /></div>
                      <div className="cash-cost-comparison">
                        <div><span>Into an account</span><strong>{money(accountCost)}</strong></div>
                        <i>versus</i>
                        <div className="cash-cost-comparison--cash"><span>Collected as cash</span><strong>{money(cashCost)}</strong></div>
                        <p>Cash makes the same £200 transfer <strong>{money(row.premiumGbp200)} more expensive.</strong></p>
                      </div>
                      <div className="cash-cost-drivers"><span><small>EXTRA CASH FEE</small><strong>+{money(row.feeDifferenceGbp)}</strong></span><span><small>EXCHANGE RATE EFFECT</small><strong>{fxCost >= 0 ? "+" : "−"}{money(Math.abs(fxCost))}</strong></span></div>
                      <div className="cash-country-context">
                        <span><small>UNBANKED</small><strong>{context.unbankedPct === null ? "N/A" : `${Math.round(context.unbankedPct)}%`}</strong></span>
                        <span><small>SERVICES OFFERING CASH</small><strong>{Math.round(context.cashSharePct)}%</strong></span>
                        <span><small>BANK BRANCHES / 100K ADULTS</small><strong>{number(context.branchesPer100k)}</strong></span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="matched-summary-strip">
              <div><span>Average extra cost</span><strong>{money(study.strictMatchedCashAccount.meanPremiumGbp200)}</strong></div>
              <div><span>Middle result</span><strong>{money(study.strictMatchedCashAccount.medianPremiumGbp200)}</strong></div>
              <div><span>Average higher fee</span><strong>{money(study.strictMatchedCashAccount.meanFeeDifferenceGbp)}</strong></div>
              <div><span>Average exchange rate loss</span><strong>{money(study.strictMatchedCashAccount.meanFxDifferencePp * 2)}</strong></div>
            </div>
          </section>

          <section className="section exclusion-section" id="access-divide">
            <div className="shell">
              <div className="report-intro-grid">
                <div><span className="kicker">THE COUNTRY PATTERN</span><h2>Where fewer adults have accounts, providers offer more ways to collect cash</h2></div>
                <p>Each dot is a destination for money sent from Britain. Countries farther to the right have more adults without accounts. Countries higher up have more cash collection services.</p>
              </div>
              <div className="access-scatter-card">
                <div className="access-scatter" role="img" aria-label="Unbanked adult share against cash payout service share across 30 UK remittance destinations">
                  <span className="scatter-axis scatter-axis-y">Cash services →</span>
                  <span className="scatter-axis scatter-axis-x">Unbanked adults →</span>
                  <i className="scatter-grid-x x25" /><i className="scatter-grid-x x50" /><i className="scatter-grid-x x75" />
                  <i className="scatter-grid-y y25" /><i className="scatter-grid-y y50" /><i className="scatter-grid-y y75" />
                  {scatterRows.map((row) => (
                      <span className={`access-dot ${labelledCountries.has(row.country) ? "access-dot-labelled" : ""}`} data-country={row.code} style={chartPosition(row)} key={row.code} title={`${row.country}: ${pct(row.unbankedPct)} unbanked, ${pct(row.cashSharePct)} cash services`}>
                      {labelledCountries.has(row.country) && <b>{row.country}</b>}
                    </span>
                  ))}
                </div>
                <div className="scatter-stat">
                  <span>WHAT THE DOTS SHOW</span>
                  <strong>Strong link</strong>
                  <p>Across {study.correlationsWithCashShare.unbankedPct.n} countries, cash is much more common where account access is weaker. The formal rank correlation is {study.correlationsWithCashShare.unbankedPct.spearman.toFixed(2)}.</p>
                </div>
              </div>
              <div className="exception-grid">
                <article><span>THE SCALE EXCEPTION</span><strong>Pakistan</strong><p>{pct(study.corridorRows.find((row) => row.country === "Pakistan")!.unbankedPct)} of adults are unbanked, yet the estimated average cost is only {money(study.corridorRows.find((row) => row.country === "Pakistan")!.avgCostGbp200)} per £200. A large, competitive corridor can offset weak access.</p></article>
                <article><span>THE MOBILE MONEY EXCEPTION</span><strong>Kenya</strong><p>Only {pct(study.corridorRows.find((row) => row.country === "Kenya")!.unbankedPct)} are unbanked under the Findex definition, which includes mobile money accounts. Cash accounts for {pct(study.corridorRows.find((row) => row.country === "Kenya")!.cashSharePct)} of observed services.</p></article>
                <article><span>THE EUROPEAN EXCEPTION</span><strong>Bulgaria</strong><p>Only {pct(study.corridorRows.find((row) => row.country === "Bulgaria")!.unbankedPct)} are unbanked, but half of observed services pay cash and the estimated average cost is {money(study.corridorRows.find((row) => row.country === "Bulgaria")!.avgCostGbp200)}. Access alone does not set price.</p></article>
              </div>
            </div>
          </section>

          <section className="section shell report-section">
            <div className="section-heading"><div><span className="kicker">WHAT MOVES TOGETHER</span><h2>The evidence supports an access story, not a simple corruption story</h2><p>We compared the order of countries from low to high rather than pretending these very different measures form one score. The labels below give the plain English result; the smaller line preserves the statistical detail for readers who want it.</p></div><a href={sources.governance}>World Bank governance data →</a></div>
            <div className="correlation-grid">
              <article className="correlation-primary"><span>FEWER ACCOUNTS → MORE CASH SERVICES</span><strong>Clear pattern</strong><p>Countries with more unbanked adults usually have more cash services. Rank correlation {study.correlationsWithCashShare.unbankedPct.spearman.toFixed(2)} across {study.correlationsWithCashShare.unbankedPct.n} countries.</p></article>
              <article><span>MORE CASH SERVICES → HIGHER COST</span><strong>Clear pattern</strong><p>Cash heavy corridors are usually more expensive. Rank correlation {study.correlationsWithCost.cashSharePct.spearman.toFixed(2)} across all {study.correlationsWithCost.cashSharePct.n} corridors.</p></article>
              <article><span>FEWER ACCOUNTS → HIGHER COST</span><strong>Some pattern</strong><p>Countries with more unbanked adults tend to cost more, but the link is less powerful than their reliance on cash. Rank correlation {study.correlationsWithCost.unbankedPct.spearman.toFixed(2)}.</p></article>
              <article><span>WEAKER CORRUPTION CONTROL → MORE CASH</span><strong>Some pattern</strong><p>Cash is more common where corruption control scores are weaker. That may reflect broader institutional and infrastructure conditions, not a provider decision.</p></article>
              <article className="correlation-muted"><span>CORRUPTION CONTROL → TRANSFER COST</span><strong>Not clear</strong><p>We do not find strong enough evidence that the national corruption score directly predicts what a transfer costs.</p></article>
              <article className="correlation-muted"><span>POLITICAL STABILITY → TRANSFER COST</span><strong>Little pattern</strong><p>Political stability barely moves with the price of sending money in this 33 corridor sample.</p></article>
            </div>
            <div className="editorial-note last-mile-note"><strong>What the corruption measure means</strong><p>The World Bank Control of Corruption score combines perception based sources and ranges from 0 to 100, with a higher score indicating stronger control. It provides national context. It does not measure the compliance cost, honesty or profitability of any provider in this study.</p></div>
          </section>

          <section className="section swift-section">
            <div className="shell swift-grid">
              <div><span className="kicker">THE SWIFT QUESTION</span><h2>Countries are not simply “SWIFT members”</h2><p>SWIFT connects institutions, not national populations, and it does not hold customer money. Its network reaches more than 11,500 institutions; in 92% of countries and territories at least three institutions are connected. A yes or no country flag would therefore add false precision to this study.</p><a href={sources.swift}>Read SWIFT’s network explanation →</a></div>
              <aside><span>WHAT WE USE INSTEAD</span><strong>Account ownership</strong><strong>ATMs per 100,000 adults</strong><strong>Bank branches per 100,000 adults</strong><strong>Internet use</strong><p>These measures describe whether the recipient can actually access an account or digital payout after the cross border message arrives.</p></aside>
            </div>
          </section>

          <section className="section shell report-section">
            <div className="section-heading"><div><span className="kicker">ALL 33 DESTINATIONS</span><h2>The complete access and cost panel</h2><p>Rows are ordered by cash service share. Missing values remain missing. We do not fill them with regional averages.</p></div><Link href="/api/research/last-mile-tax/csv">Download CSV →</Link></div>
            <div className="index-table-wrap">
              <table className="index-table access-context-table">
                <thead><tr><th>Destination</th><th>Estimated cost per £200</th><th>Cash services</th><th>Unbanked adults</th><th>Control of corruption</th><th>Internet use</th><th>ATMs / 100k</th><th>Branches / 100k</th><th>GDP per person</th></tr></thead>
                <tbody>
                  {countryRows.map((row) => (
                    <tr key={row.code} className={row.cashSharePct >= 75 ? "cash-heavy-row" : ""}>
                      <td><span className="league-country"><i>{row.code}</i><span><strong>{row.country}</strong><small>{row.services} services · {row.firms} firms</small></span></span></td>
                      <td><strong>{money(row.avgCostGbp200)}</strong><small>{pct(row.avgCostPct, 2)}</small></td>
                      <td><strong>{pct(row.cashSharePct)}</strong><small>{row.cashServices} cash services</small></td>
                      <td><strong>{pct(row.unbankedPct)}</strong><small>{row.accountOwnershipPctYear ?? "No survey"}</small></td>
                      <td><strong>{number(row.corruptionControlScore)}</strong><small>0 weak · 100 strong</small></td>
                      <td><strong>{pct(row.internetUsePct)}</strong><small>{row.internetUsePctYear ?? "Not reported"}</small></td>
                      <td><strong>{number(row.atmsPer100k)}</strong><small>{row.atmsPer100kYear ?? "Not reported"}</small></td>
                      <td><strong>{number(row.branchesPer100k)}</strong><small>{row.branchesPer100kYear ?? "Not reported"}</small></td>
                      <td><strong>{compactMoney(row.gdpPerCapitaUsd)}</strong><small>{row.gdpPerCapitaUsdYear ?? "Not reported"}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-method" id="method">
            <div className="shell report-method-grid">
              <div><span className="kicker">METHOD AND LIMITS</span><h2>Three tests, no hidden score</h2><p>The study separates observed service prices, matched comparisons and country context. We do not describe correlation as proof of exploitation or assume every cost difference becomes provider profit.</p></div>
              <div className="method-parts method-parts-three">
                <article><b>01</b><strong>Price records</strong><p>All 791 transparent UK service observations in World Bank RPW Q3 2025, across 33 destinations and 45 named providers.</p></article>
                <article><b>02</b><strong>£200 estimate</strong><p>We linearly interpolate monetary cost between the official £120 and £300 baskets. It is a normalised estimate, not a quote captured at exactly £200.</p></article>
                <article><b>03</b><strong>Matched offers</strong><p>Provider, corridor, funding, access point, speed, date and receiving coverage must match. Seventeen cash and account comparisons qualify.</p></article>
                <article><b>04</b><strong>Adjusted model</strong><p>The model allows for the company and route, plus how the transfer is funded. It also adjusts the uncertainty for uneven variation between records.</p></article>
                <article><b>05</b><strong>Country context</strong><p>Unbanked means the share of adults aged 15 and over without an account at a financial institution or mobile money provider. Findex 2025 surveys were conducted in 2024. Other indicators use the latest available 2021 to 2024 observation.</p></article>
                <article><b>06</b><strong>Correlation</strong><p>Spearman rank correlation tests whether countries move together. The panel is small and observational, so mechanisms remain interpretations rather than causal proof.</p></article>
              </div>
            </div>
            <div className="shell model-warning"><strong>Important limit</strong><p>The World Bank dataset measures available services, not customer transaction volumes. A corridor with ten cash products and one account product is not proof that ten times as many customers collect cash. The provider model describes pricing in the observed service menu.</p></div>
          </section>

          <section className="section shell">
            <div className="source-panel">
              <div><span className="kicker">SOURCES AND REUSE</span><h2>Audit every input</h2><p>Price data use the RPW workbook updated 5 May 2026. Financial inclusion uses the Global Findex 2025 edition, based on 2024 surveys. Governance uses the 2024 WGI release. The salary comparison uses provisional ONS April 2025 earnings.</p></div>
              <ul>
                <li><a href={sources.prices}>World Bank Remittance Prices Worldwide complete dataset</a></li>
                <li><a href={sources.findexReport}>Global Findex 2025 report</a></li>
                <li><a href={sources.findexGlobal}>World Bank account ownership headline findings</a></li>
                <li><a href={sources.findex}>Global Findex 2025 country data</a></li>
                <li><a href={sources.findexMethod}>Global Findex survey method</a></li>
                <li><a href={sources.findexBarriers}>World Bank evidence on barriers to account ownership</a></li>
                <li><a href={sources.governance}>Worldwide Governance Indicators</a></li>
                <li><a href={sources.branches}>Commercial bank branches per 100,000 adults</a></li>
                <li><a href={sources.atms}>ATMs per 100,000 adults</a></li>
                <li><a href={sources.internet}>Individuals using the internet</a></li>
                <li><a href={sources.swift}>What SWIFT is and whom it connects</a></li>
                <li><a href={sources.onsEarnings}>ONS Employee earnings in the UK, 2025</a></li>
              </ul>
            </div>
            <div className="citation-box"><strong>Suggested citation</strong><p>Online Money Transfer, “The Last Mile Tax 2026: What cash collection costs families receiving money from Britain”, data edition, 22 July 2026, published by Finofin Limited.</p></div>
            <AuthorPanel label="RESEARCH TEAM" />
          </section>
        </article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      </main>
      <SiteFooter />
    </>
  );
}
