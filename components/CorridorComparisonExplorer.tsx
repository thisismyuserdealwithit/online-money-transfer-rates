"use client";

import { useState } from "react";
import Link from "next/link";
import type { CorridorSnapshot } from "@/lib/corridor-comparison";
import styles from "./CorridorContext.module.css";

export type ComparisonRoute = { slug: string; fromCountry: string; toCountry: string; fromCurrency: string; toCurrency: string; testAmount: number };

export function CorridorComparisonExplorer({ current, routes, snapshots, available, initialPeer }: { current: ComparisonRoute; routes: ComparisonRoute[]; snapshots: CorridorSnapshot[]; available: boolean; initialPeer: string }) {
  const [peerSlug, setPeerSlug] = useState(initialPeer);
  const peer = routes.find((route) => route.slug === peerSlug) ?? routes.find((route) => route.slug !== current.slug);
  if (!peer) return null;
  const comparableBudget = current.fromCountry === peer.fromCountry && current.fromCurrency === peer.fromCurrency && current.testAmount === peer.testAmount;
  return <section className={styles.explorer} aria-labelledby="route-comparison-title">
    <span className="kicker">COMPARE THE CONTEXT</span>
    <h2 id="route-comparison-title">How does this route compare?</h2>
    <p>Choose another route to compare the evidence collected today. A wider range of offers gives you more prices to check; it does not guarantee a cheaper transfer.</p>
    <label className={styles.selector}>Compare with
      <select aria-label="Compare with" value={peer.slug} onChange={(event) => setPeerSlug(event.target.value)}>
        {routes.filter((route) => route.slug !== current.slug).map((route) => <option key={route.slug} value={route.slug}>{route.fromCountry} → {route.toCountry} · {route.fromCurrency} {route.testAmount.toLocaleString("en-GB")}</option>)}
      </select>
    </label>
    {!available && <p className={styles.note} role="status">Today’s coverage figures are temporarily unavailable. You can still compare the transfer routes and their published research.</p>}
    <div className={styles.pair} aria-live="polite" aria-atomic="true">
      {[current, peer].map((route) => {
        const snapshot = snapshots.find((item) => item.slug === route.slug);
        const show = available && snapshot;
        return <article key={route.slug} className={styles.routeCard}>
          <span>{route.slug === current.slug ? "THIS ROUTE" : "COMPARISON ROUTE"}</span>
          <h3>{route.fromCountry} → {route.toCountry}</h3>
          <dl>
            <div><dt>Amount tested</dt><dd>{route.fromCurrency} {route.testAmount.toLocaleString("en-GB")}</dd></div>
            <div><dt>Recipient currency</dt><dd>{route.toCurrency}</dd></div>
            <div><dt>Providers with a result today</dt><dd>{show ? snapshot.currentProviders : "Unavailable"}</dd></div>
            <div><dt>Verified, standard bank offers today</dt><dd>{show ? snapshot.verifiedProviders : "Unavailable"}</dd></div>
            <div><dt>Recipient amount spread</dt><dd>{show && snapshot.gapPercent !== null ? `${snapshot.gapPercent.toFixed(2)}%` : "Not enough comparable evidence"}</dd></div>
          </dl>
          {show && snapshot.latestCapturedAt && <p className={styles.small}>Latest included receipt: {new Date(snapshot.latestCapturedAt).toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC.</p>}
          <Link href={`/${route.slug}`}>See {route.toCurrency} offers and receipts →</Link>
        </article>;
      })}
    </div>
    <p className={styles.note}>{comparableBudget ? "These routes use the same sending country, currency and test amount, which makes their coverage easier to compare." : "These routes have different sending markets or test amounts. Their prices cannot establish which destination is cheaper."} Recipient amounts in different currencies are not a common measure of value.</p>
    <details className={styles.method}><summary>What does the spread measure?</summary><p>We subtract the lowest recipient amount from the highest, divide by the highest, and express the difference as a percentage. The calculation needs at least two verified, standard bank-to-bank offers from today (UTC). It excludes introductory offers, indicative estimates and previous-day results. Each provider contributes its latest usable result.</p><p>This is the spread between our observed offers, not the exchange-rate margin or the total cost of sending money. Quotes can have different capture times and are not guaranteed to remain bookable. A zero spread means the included results match; it does not mean the transfer is free.</p></details>
  </section>;
}
