import type { CustomerReviewEvidence } from "@/lib/customer-review-types";
import styles from "./ProviderComparison.module.css";

const scopeDescriptions: Record<CustomerReviewEvidence["scope"], string> = {
  "transfer-service": "The linked profile covers the money-transfer service. Experiences may concern different routes, amounts and payout methods.",
  "whole-company": "The linked profile covers the whole company, including products beyond international transfers. Its score is not a transfer-only rating.",
  "parent-company": "The linked profile covers the parent company. Its score should not be treated as a rating of this service alone.",
  limited: "The available review evidence is limited. It cannot establish how a typical customer will experience this service.",
};

function checkedDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

export function CustomerReviewSection({ providerName, evidence }: {
  providerName: string;
  evidence: CustomerReviewEvidence;
}) {
  const sources = [{ label: evidence.sourceLabel, url: evidence.sourceUrl }, ...evidence.sources]
    .filter((source, index, list) => list.findIndex((candidate) => candidate.url === source.url) === index);
  return (
    <section className={styles.customerSection} id="customer-reviews" aria-labelledby="customer-reviews-title">
      <p className={styles.eyebrow}>Customer feedback</p>
      <h2 id="customer-reviews-title">What customers report about {providerName}</h2>
      <p className={styles.summary}>{evidence.summary}</p>
      <div className={styles.evidenceBar}>
        <div><span>Review source</span><a href={evidence.sourceUrl}>{evidence.sourceLabel}</a></div>
        {evidence.score !== null && Number.isFinite(evidence.score) && <div><span>Published customer score</span><strong>{evidence.score}</strong></div>}
        {evidence.reviewCount !== null && Number.isFinite(evidence.reviewCount) && <div><span>Reviews on that profile</span><strong>{evidence.reviewCount.toLocaleString("en-GB")}</strong></div>}
        <div><span>Evidence checked</span><time dateTime={evidence.checkedAt}>{checkedDate(evidence.checkedAt)}</time></div>
      </div>
      <p className={styles.scope}>{scopeDescriptions[evidence.scope]}</p>
      <p className={styles.note}>Any customer score shown belongs to the source platform and is separate from our editorial rating. Public reviews are self-selected reports, not a representative customer survey; we have not independently verified each reported experience.</p>
      <div className={styles.themeGrid}>
        {evidence.praise.length > 0 && <div className={styles.theme}><h3>What customers value</h3><ul>{evidence.praise.map((point) => <li key={point}>{point}</li>)}</ul></div>}
        {evidence.concerns.length > 0 && <div className={styles.theme}><h3>What to check before sending</h3><ul>{evidence.concerns.map((point) => <li key={point}>{point}</li>)}</ul></div>}
      </div>
      <div className={styles.takeaway}><h3>What this means for your comparison</h3><p>{evidence.comparisonTakeaway}</p></div>
      <p className={styles.note}>{evidence.evidenceNote}</p>
      <details className={styles.sources}>
        <summary>Sources and review context</summary>
        <ul>{sources.map((source) => <li key={source.url}><a href={source.url}>{source.label}</a></li>)}</ul>
      </details>
    </section>
  );
}