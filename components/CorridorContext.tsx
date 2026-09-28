import Link from "next/link";
import { corridors, type Corridor } from "@/lib/data";
import { getBankDetailsByCode } from "@/lib/bank-details";
import { getHistoricalCorridorContext } from "@/lib/corridor-context";
import { getPeerCorridors, type CorridorSnapshot } from "@/lib/corridor-comparison";
import { CorridorComparisonExplorer } from "./CorridorComparisonExplorer";
import styles from "./CorridorContext.module.css";

export function CorridorContext({ corridor, snapshots, available }: { corridor: Corridor; snapshots: CorridorSnapshot[]; available: boolean }) {
  const countryPhrase = (name: string, code: string) => ["GB", "US", "AE", "PH", "NL", "EU"].includes(code) ? `the ${name}` : name;
  const fromName = countryPhrase(corridor.fromCountry, corridor.fromCode);
  const toName = countryPhrase(corridor.toCountry, corridor.toCode);
  const peers = getPeerCorridors(corridor, 5);
  const matched = peers.filter((item) => item.fromCode === corridor.fromCode && item.fromCurrency === corridor.fromCurrency && item.testAmount === corridor.testAmount);
  const reverse = corridors.find((item) => item.fromCode === corridor.toCode && item.toCode === corridor.fromCode);
  const profile = getBankDetailsByCode(corridor.toCode);
  const historical = getHistoricalCorridorContext(corridor);
  const budget = `${corridor.fromCurrency} ${corridor.testAmount.toLocaleString("en-GB")}`;
  const sameCurrencyPeers = matched.filter((item) => item.toCurrency === corridor.toCurrency);
  const formatMoney = (amount: number) => `£${amount.toFixed(2)}`;
  const slim = (item: Corridor) => ({slug:item.slug,fromCountry:item.fromCountry,toCountry:item.toCountry,fromCurrency:item.fromCurrency,toCurrency:item.toCurrency,testAmount:item.testAmount});
  const snapshot = snapshots.find((item) => item.slug === corridor.slug);
  return <section className={styles.context} aria-labelledby="corridor-context-title">
    <span className="kicker">THE ROUTE IN CONTEXT</span>
    <h2 id="corridor-context-title">Comparing transfers from {fromName} to {toName}</h2>
    <p>The starting point here is a {budget} transfer, with the recipient paid in {corridor.toCurrency}. That fixed amount makes the offers above easier to compare. Choosing a company also means checking how the payment is funded, what the recipient needs to collect it and what support is available if delivery takes longer than expected.</p>
    {available && snapshot && <p>Today’s sample for this route contains <strong>{snapshot.currentProviders} {snapshot.currentProviders === 1 ? "provider" : "providers"} with a usable result</strong>, of which {snapshot.verifiedProviders} {snapshot.verifiedProviders === 1 ? "qualifies" : "qualify"} as verified, standard bank-to-bank offers. {snapshot.gapPercent !== null && snapshot.recipientGap !== null ? `The included offers differ by ${snapshot.recipientGap.toLocaleString("en-GB", {maximumFractionDigits:2})} ${corridor.toCurrency} at the receiving end (${snapshot.gapPercent.toFixed(2)}% of the highest recipient amount). This measures the range in our sample, not the route’s total transfer cost.` : "There are not enough comparable offers today to calculate a meaningful price spread. Older receipts remain useful as dated references in the table above."}</p>}
    <div className={styles.copyGrid}>
      <article><h3>Put this route beside a useful comparison</h3>
        <p>{matched.length ? `Our ${matched.slice(0,3).map((item) => `${item.fromCountry}–${item.toCountry}`).join(", ")} routes use the same ${budget} test amount and sending market. They are useful peers for checking how many providers we can observe and how widely their recipient amounts differ.` : `The ${fromName}–${toName} route has its own funding market and test amount. Other destinations can help you explore provider coverage, but a transfer priced in a different sending currency is not a like-for-like cost comparison.`}</p>
        <p>{sameCurrencyPeers.length ? `${sameCurrencyPeers.map((item) => item.toCountry).join(", ")} also receive ${corridor.toCurrency}. Matching the currencies removes one obvious difference, but destination eligibility, payment methods and capture times can still change the quote. Check the receipt before treating two results as equivalent.` : `A higher number of ${corridor.toCurrency} received cannot tell you whether this route is cheaper than one paying another currency. Compare the total cost against an appropriate exchange-rate benchmark, or compare offers within this route using the same budget and payout method.`}</p>
      </article>
      <article><h3>Choose the payment method before the headline rate</h3>
        <p>{profile ? `For bank deposits in ${corridor.toCurrency}, the receiving account format is ${profile.accountFormat}. The recipient checklist for ${toName} explains which identifiers to request. A transfer company using a local payment route may ask for different information from a bank sending a direct international wire.` : `Start by confirming that the recipient can accept ${corridor.toCurrency} through the method quoted. A bank deposit, cash collection and mobile-wallet payment solve different needs; a low price on a method the recipient cannot use is not a useful saving.`}</p>
        <p>Keep bank-funded and card-funded offers separate when comparing costs. Check whether the quoted fee is inside your sending budget or charged on top, then use the recipient amount on the final confirmation screen. A fee advertised as zero can still accompany an exchange-rate markup. Delivery estimates also depend on the funding method and any required checks.</p>
        {profile && <Link href={`/bank-details/${profile.slug}`}>Read the {profile.country} receiving-account checklist →</Link>}
      </article>
      <article><h3>Read customer feedback for the problem you need solved</h3>
        <p>For a regular {budget} payment, look for reports about repeat transfers, recipient setup and resolving a delayed payment. For a larger one-off transfer, ask about limits, the documents required and how to reach a person before funding the transfer. A positive comment about an account or card does not establish that a company offers good value on {corridor.fromCurrency}/{corridor.toCurrency}.</p>
        <p>Our company reviews separate published customer feedback from the prices collected here. They show the source, review date and whether the feedback covers money transfers or a wider business. Use those themes to form questions for the provider; use a current quote to judge the price of this particular transfer.</p>
        <Link href="/compare">Compare two companies’ fees, access and customer feedback →</Link>
      </article>
      <article><h3>{reverse ? `Sending ${corridor.toCurrency} back the other way` : "What today’s sample can tell you"}</h3>
        <p>{reverse ? `The return journey, ${reverse.fromCountry} to ${reverse.toCountry}, is tested with ${reverse.fromCurrency} ${reverse.testAmount.toLocaleString("en-GB")}. That changes the sending market and the budget. A company available to customers in ${fromName} may offer different products, fees or eligibility to customers in ${toName}.` : "The table is a record of offers we could observe, not a census of every provider serving the route. When a provider has no usable result today, its most recent matching receipt remains visible as a grey historical reference. Providers with no usable receipts appear in the coverage note."}</p>
        <p>{reverse ? "Do not estimate the reverse transfer by turning an exchange rate upside down. Request a quote for the reverse direction, using its actual funding and payout methods. Compare the displayed fee and the amount the recipient will receive, including any disclosed receiving charges." : "The interactive comparison below counts only results captured today in UTC. Its spread calculation uses verified, standard bank-to-bank offers and excludes introductory rates. A small sample can make the spread look narrow simply because fewer offers were observed."}</p>
        {reverse && <Link href={`/${reverse.slug}`}>Compare {reverse.fromCountry} to {reverse.toCountry} →</Link>}
      </article>
    </div>
    {historical && <section className={styles.historical} aria-labelledby="historical-context-title">
      <span className="kicker">HISTORICAL BENCHMARK · {historical.period}</span>
      <h3 id="historical-context-title">Where {toName} sat in the UK cost study</h3>
      <p>Our analysis of the World Bank’s Remittance Prices Worldwide observations estimated an average cost of <strong>{formatMoney(historical.averageCostGbp)} on a £200 transfer</strong> to {toName}, equivalent to {historical.averageCostPct.toFixed(2)}%. This is a dated comparison point for understanding the route, rather than a quote available today.</p>
      <dl className={styles.facts}><div><dt>Average cost in the £200 scenario</dt><dd>{formatMoney(historical.averageCostGbp)}</dd></div><div><dt>Service observations / firms</dt><dd>{historical.services} / {historical.firms}</dd></div><div><dt>Cost position, lowest first</dt><dd>{historical.rank} of {historical.totalCorridors}</dd></div></dl>
      <p>The cost position compares the {historical.totalCorridors} UK outbound corridors in that study. The £200 figures were calculated by linear interpolation between the World Bank’s observed £120 and £300 baskets. A service observation is a particular firm, product, funding and payout combination; it is not a customer transaction. The averages are not weighted by market share.</p>
      <ul className={styles.payouts}>{historical.payouts.map((item) => <li key={item.name}><strong>{item.name}: {item.costPct!.toFixed(2)}%</strong><br />{item.services} service observations</li>)}</ul>
      <p>These payout averages use different sets of offers. Their difference does not isolate the price of changing payout method with the same provider. Check matched offers before attributing a higher cost to cash, an account or a wallet.</p>
      {historical.peers.length > 0 && <p>Nearby cost averages among the UK routes covered on this site were {historical.peers.map((peer,index) => <span key={peer.slug}>{index > 0 ? "; " : ""}<Link href={`/${peer.slug}`}>{peer.country}: {formatMoney(peer.costGbp)}</Link></span>)} per £200 in the same historical scenario. Different providers and payout mixes mean those averages cannot rank today’s offers.</p>}
      <p className={styles.small}>Source: <a href="https://remittanceprices.worldbank.org/" target="_blank" rel="noreferrer">World Bank, Remittance Prices Worldwide, {historical.period}</a>; adapted calculations by Finofin Limited. <Link href="/research/last-mile-tax">Read the full study and methodology</Link>. Original observations and adapted calculations are credited under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.</p>
    </section>}
    <div className={styles.links}>{peers.map((peer) => <Link key={peer.slug} href={`/${peer.slug}`}>{peer.fromCountry} → {peer.toCountry}</Link>)}</div>
    <CorridorComparisonExplorer current={slim(corridor)} routes={corridors.map(slim)} snapshots={snapshots} available={available} initialPeer={peers[0]?.slug ?? ""} />
    <p className={styles.small}>Comparison context prepared by the OMT research desk, 29 September 2026. Live figures use today’s UTC receipts; historical figures retain their stated study period.</p>
  </section>;
}
