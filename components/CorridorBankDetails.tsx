import Link from "next/link";
import { BankDetailsChecker } from "@/components/BankDetailsChecker";
import type { Corridor } from "@/lib/data";
import { getBankDetailsByCode } from "@/lib/bank-details";

export function CorridorBankDetails({ corridor }: { corridor: Corridor }) {
  const profile = getBankDetailsByCode(corridor.toCode);
  if (!profile) return null;

  const askFor = profile.fields
    .filter((item) => item.status !== "conditional")
    .slice(0, 4);

  return (
    <section className="corridor-bank-details" aria-labelledby="bank-details-title">
      <div className="bank-details-intro">
        <span className="bank-details-icon" aria-hidden="true">✓</span>
        <div>
          <span className="kicker">BEFORE YOU PAY</span>
          <h2 id="bank-details-title">Check the bank details for {corridor.toCountry}</h2>
          <p>{corridor.fromCode} → {corridor.toCode} · {corridor.toCurrency} bank-account payout</p>
        </div>
      </div>

      <div className="bank-details-facts">
        <div>
          <span>Account format</span>
          <strong>{profile.accountFormat}</strong>
        </div>
        <div>
          <span>Ask the recipient for</span>
          <strong>{askFor.map((item) => item.label).join(" · ")}</strong>
        </div>
        <div>
          <span>SWIFT/BIC</span>
          <strong>{profile.iban ? "Sometimes requested" : "Often requested for a direct wire"}</strong>
        </div>
      </div>

      <div className="bank-details-actions">
        <details>
          <summary>Run a private format check <span>+</span></summary>
          <BankDetailsChecker profile={profile} compact />
        </details>
        <div>
          <Link href={`/bank-details/${profile.slug}/`}>Full {profile.country} checklist</Link>
          <Link href="/swift-codes/">SWIFT guide</Link>
          <Link href="/bic-codes/">BIC checker</Link>
        </div>
      </div>

      <p className="bank-details-smallprint">
        A format match cannot confirm the recipient, account ownership or that a payment is safe. Transfer companies may use local rails and ask for fewer fields than a direct bank wire.
      </p>
    </section>
  );
}
