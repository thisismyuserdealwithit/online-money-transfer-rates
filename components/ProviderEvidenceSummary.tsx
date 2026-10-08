import type { CustomerReviewEvidence } from "@/lib/customer-review-types";
import type { ProviderRateEvidence } from "@/lib/live-data";
import { providerCollectionLabel, type ProviderReview } from "@/lib/reviews";
import { getReviewServiceUpdatedAt, providerEvidenceWindowHours, reviewDateLabel, summariseProviderRateEvidence } from "@/lib/provider-evidence-summary";
import styles from "./ProviderEvidenceSummary.module.css";

const customerScope: Record<CustomerReviewEvidence["scope"], string> = {
  "transfer-service": "The profile concerns money transfers, but reports may cover other routes and payment methods.",
  "whole-company": "The profile covers the whole company, including products beyond transfers.",
  "parent-company": "The profile covers the parent company and cannot rate this service separately.",
  limited: "The available feedback is too limited to describe a typical customer's experience.",
};

export function ProviderEvidenceSummary({ review, customer, evidence }: {
  review: ProviderReview;
  customer: CustomerReviewEvidence | null;
  evidence: readonly ProviderRateEvidence[];
}) {
  const summary = summariseProviderRateEvidence(review.name, evidence);
  const serviceDate = getReviewServiceUpdatedAt(review);
  const latestLabel = summary.latest ? new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
  }).format(new Date(summary.latest)) : null;
  return <section className={styles.summary} id="provider-evidence-summary" aria-labelledby="provider-evidence-summary-title">
    <p className={styles.eyebrow}>Evidence summary</p>
    <h2 id="provider-evidence-summary-title">What this evidence shows</h2>
    <p>{summary.finding}</p>
    <dl className={styles.metrics}>
      <div><dt>Collected route records in the past {providerEvidenceWindowHours} hours</dt><dd>{summary.routeCount || "Not available"}</dd></div>
      <div><dt>Indicative estimates</dt><dd>{summary.routeCount ? summary.indicativeCount : "Not available"}</dd></div>
      <div><dt>Quotes eligible for price ranking</dt><dd>{summary.routeCount ? summary.quoteCount : "Not available"}</dd></div>
      {summary.otherUnrankedCount > 0 && <div><dt>Other records not ranked</dt><dd>{summary.otherUnrankedCount}</dd></div>}
      <div><dt>Price wins where a rival was captured</dt><dd>{summary.comparableCount ? `${summary.wins}/${summary.comparableCount}` : "Not assessed"}</dd></div>
      <div><dt>Latest included capture</dt><dd className={styles.timestamp}>{summary.latest ? <time dateTime={summary.latest}>{latestLabel} UTC</time> : "Not available"}</dd></div>
    </dl>
    <p className={styles.note}>These counts use a rolling {providerEvidenceWindowHours}-hour window. Route tables rank today’s UTC records and retain older results in grey. Modelled prices, converter rates and introductory offers cannot win this standard comparison. A captured quote is not a guarantee of the price available when you send. <a href="#provider-rate-evidence">Inspect the dated receipts</a>.</p>
    <div className={styles.context}>
      <div><h3>Published pricing model</h3><p>{review.rateModel}</p><p className={styles.note}>Service assessment dated <time dateTime={serviceDate}>{reviewDateLabel(serviceDate)}</time>.</p><a href="#provider-sources">Read the provider’s source documents</a></div>
      <div><h3>Customer evidence</h3>{customer ? <>
        <p><a href={customer.sourceUrl}>{customer.sourceLabel}</a>, checked <time dateTime={customer.checkedAt}>{reviewDateLabel(customer.checkedAt)}</time>. {customerScope[customer.scope]}</p>
        <p className={styles.note}>These are self-selected reports, not independently verified transfer outcomes. <a href="#customer-reviews">Read the reported strengths, concerns and source limits</a>.</p>
      </> : <p>No sourced customer-feedback assessment is available on this page. The service description is not a customer-satisfaction finding.</p>}</div>
    </div>
    {review.collectionMethod && <p className={styles.note}><strong>{providerCollectionLabel(review, evidence.length > 0)}.</strong> {review.collectionMethod === "account-quote" ? "Published service terms are reviewed here; a customer-specific rate requires an account or a quote from the provider." : review.collectionStatus === "active" ? "Stored receipts below show which routes have returned usable evidence." : review.collectionStatus === "ready" ? "The public calculator passed capture tests. Scheduled collection has not been enabled; production receipts will appear after activation." : "A complete public calculator quote has not been captured. No rate is claimed until a usable receipt has been stored."}</p>}
  </section>;
}
