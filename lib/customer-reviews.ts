import { customerReviewBanksBrokers } from "./customer-reviews-banks-brokers";
import { customerReviewSpecialists } from "./customer-reviews-specialists";
import type { CustomerReviewEvidence, ProviderComparisonProfile } from "./customer-review-types";
import { getProviderReview, providerReviews } from "./reviews";

export const customerReviewEvidence: CustomerReviewEvidence[] = [
  ...customerReviewSpecialists,
  ...customerReviewBanksBrokers,
];

const evidenceByProvider = new Map(
  customerReviewEvidence.map((evidence) => [evidence.providerSlug, evidence]),
);

export function getCustomerReviewEvidence(slug: string): CustomerReviewEvidence | null {
  const provider = getProviderReview(slug);
  return provider ? evidenceByProvider.get(provider.slug) ?? null : null;
}

export const providerComparisonProfiles: ProviderComparisonProfile[] = providerReviews.map((provider) => ({
  slug: provider.slug,
  name: provider.name,
  category: provider.category,
  bestFor: provider.bestFor,
  lessSuitableFor: provider.lessSuitableFor,
  rateModel: provider.rateModel,
  feeModel: provider.feeModel,
  delivery: provider.delivery,
  access: provider.access,
  customer: getCustomerReviewEvidence(provider.slug),
}));
