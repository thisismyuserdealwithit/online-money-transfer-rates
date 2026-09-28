export type CustomerReviewEvidence = {
  providerSlug: string;
  checkedAt: string;
  scope: "transfer-service" | "whole-company" | "parent-company" | "limited";
  sourceLabel: string;
  sourceUrl: string;
  score: number | null;
  reviewCount: number | null;
  summary: string;
  praise: string[];
  concerns: string[];
  comparisonTakeaway: string;
  evidenceNote: string;
  sources: { label: string; url: string }[];
};

export type ProviderComparisonProfile = {
  slug: string;
  name: string;
  category: string;
  bestFor: string;
  lessSuitableFor: string;
  rateModel: string;
  feeModel: string;
  delivery: string;
  access: string;
  customer: CustomerReviewEvidence | null;
};
