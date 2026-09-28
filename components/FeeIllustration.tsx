"use client";
import { useState } from "react";
import styles from "./ComparisonHub.module.css";

export function FeeIllustration() {
  const [amount, setAmount] = useState("200");
  const numeric = Number(amount);
  const valid = amount.trim() !== "" && Number.isFinite(numeric) && numeric > 0 && numeric <= 1000000;
  const percentFee = numeric * 0.005;
  return <section className={styles.illustration} aria-labelledby="fee-illustration-title">
    <div><span className="kicker">TRY A DIFFERENT AMOUNT</span><h2 id="fee-illustration-title">A fixed fee or a percentage fee?</h2><p>The amount you send can change which fee structure costs less. This example compares a flat £3 fee with a 0.5% fee. They are invented examples for the calculation, not prices from any company.</p><label>Transfer amount in GBP<input type="number" min="1" max="1000000" step="any" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} aria-describedby="fee-illustration-note" /></label></div>
    <div aria-live="polite" className={styles.feeResults}>{valid ? <><div><span>Example A · fixed fee</span><strong>£3.00</strong><small>{(300 / numeric).toFixed(2)}% of the transfer amount</small></div><div><span>Example B · 0.5% fee</span><strong>£{percentFee.toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><small>Fee grows with the transfer amount</small></div><p>{Math.abs(percentFee - 3) < 0.00001 ? "The example fees are equal at £600." : `The ${percentFee < 3 ? "percentage" : "fixed"} fee is £${Math.abs(percentFee - 3).toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})} lower at this amount.`}</p></> : <p>Enter an amount above £0 and no more than £1,000,000.</p>}</div>
    <p id="fee-illustration-note" className={styles.full}>This compares the stated fee only. The exchange-rate markup, intermediary charges, subscription costs and recipient charges could change the overall result. Recheck the final recipient amount in a real provider quote.</p>
  </section>;
}
