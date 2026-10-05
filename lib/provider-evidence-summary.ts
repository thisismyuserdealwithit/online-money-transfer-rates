import type { CustomerReviewEvidence } from "./customer-review-types";
import type { ProviderRateEvidence } from "./live-data";
import type { ProviderReview } from "./reviews";
import { COMPARISON_FRESHNESS_MS } from "./comparison-case";

// The original service assessments retain their recorded publication date.
const originalReviewDate = "2026-07-23";
export const providerEvidenceWindowHours = COMPARISON_FRESHNESS_MS / (60 * 60 * 1000);

function validDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function getReviewServiceUpdatedAt(review: Pick<ProviderReview, "reviewedAt">): string {
  return validDate(review.reviewedAt) ? review.reviewedAt : originalReviewDate;
}

export function getReviewMaterialUpdatedAt(
  review: Pick<ProviderReview, "reviewedAt">,
  customer: Pick<CustomerReviewEvidence, "checkedAt"> | null,
): string {
  const serviceDate = getReviewServiceUpdatedAt(review);
  return customer && validDate(customer.checkedAt) && customer.checkedAt > serviceDate
    ? customer.checkedAt : serviceDate;
}

export function reviewDateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

export function summariseProviderRateEvidence(providerName: string, evidence: readonly ProviderRateEvidence[]) {
  const verified = evidence.filter((item) => item.eligibleForPriceRanking);
  const comparable = verified.filter((item) => item.bestVerifiedRecipient !== null && item.matchedCompetitors > 1);
  const latest = evidence.reduce<string | null>((current, item) => {
    const captured = Date.parse(item.capturedAt);
    return Number.isFinite(captured) && (!current || captured > Date.parse(current)) ? item.capturedAt : current;
  }, null);
  const routeCount = evidence.length;
  const quoteCount = verified.length;
  const finding = !routeCount
    ? `No recent price evidence is available for ${providerName} in this review. This does not establish that the provider cannot offer your transfer; request a quote for your amount and payment method.`
    : !quoteCount
      ? `The ${routeCount} recent route ${routeCount === 1 ? "record for" : "records for"} ${providerName} ${routeCount === 1 ? "does" : "do"} not include a completed, non-promotional bank-to-bank quote. These records cannot establish a like-for-like price winner.`
      : `${providerName} has recent records on ${routeCount} monitored ${routeCount === 1 ? "route" : "routes"}; ${quoteCount} ${quoteCount === 1 ? "qualifies" : "qualify"} for a standard bank-to-bank price comparison. Each result applies to its recorded amount, currencies and payment methods, rather than the provider's entire service.`;
  return {
    routeCount,
    quoteCount,
    comparableCount: comparable.length,
    wins: comparable.filter((item) => item.bestVerifiedProvider === providerName).length,
    latest,
    finding,
  };
}
