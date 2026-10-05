import Link from "next/link";
import { money, type Corridor } from "@/lib/data";
import { WEEKLY_ROUTES } from "@/lib/weekly-transfer-costs";
import styles from "./CorridorEvidenceSummary.module.css";

export function CorridorEvidenceSummary({ corridor, available }: { corridor: Corridor; available: boolean }) {
  const current = corridor.quotes.filter((quote) => quote.status !== "stale");
  const ranked = current.filter((quote) => quote.eligibleForPriceRanking).sort((a, b) => b.recipientGets - a.recipientGets);
  const historical = corridor.quotes.length - current.length;
  const best = ranked[0];
  const tied = best ? ranked.filter((quote) => quote.recipientGets === best.recipientGets) : [];
  const weekly = WEEKLY_ROUTES.some((route) => route === corridor.slug);
  return <aside className={styles.summary} id="evidence-summary" aria-labelledby="corridor-evidence-title">
    <span className="kicker">WHAT THE SAVED EVIDENCE SHOWS</span><h2 id="corridor-evidence-title">Comparing {money(corridor.testAmount, corridor.fromCurrency)} to {corridor.toCountry}</h2>
    {!available ? <p>Saved results could not be loaded. We cannot name a leading quote or measure provider coverage until the archive is available again.</p> : <>
      <p>{ranked.length >= 2
        ? <>Among {ranked.length} qualifying results captured today (UTC), {tied.map((quote) => quote.provider).join(" and ")} showed the highest recipient amount: <strong>{money(best.recipientGets, corridor.toCurrency)}</strong>. The gap to the lowest qualifying result was {money(best.recipientGets - ranked[ranked.length - 1].recipientGets, corridor.toCurrency)}. These checks were taken at the times on their receipts; they are not simultaneous market prices.</>
        : ranked.length === 1
          ? <>{best.provider} has the only qualifying result captured today (UTC), showing {money(best.recipientGets, corridor.toCurrency)} for the recipient. One qualifying result is not enough to establish a price winner.</>
          : <>There is no qualifying result captured today (UTC) for this transfer case. The available evidence does not support a cheapest-provider claim.</>}</p>
      <p>{current.length} provider result{current.length === 1 ? "" : "s"} from today and {historical} older result{historical === 1 ? "" : "s"} appear below. Older results are grey and unranked. Estimates, introductory offers and other payment methods cannot win the standard bank-transfer comparison.</p>
      {best?.proofId && <p><Link href={`/${corridor.slug}/receipts/${encodeURIComponent(best.proofId)}`}>Inspect {best.provider}&apos;s receipt</Link> · {best.checkedAt}</p>}
    </>}
    <div className={styles.links}><Link href="/compare">Compare service and customer feedback</Link><Link href="/methodology">Check the comparison rules</Link>{weekly && <Link href={`/research/weekly-transfer-costs#${corridor.slug}`}>Explore this route&apos;s weekly evidence</Link>}</div>
  </aside>;
}
