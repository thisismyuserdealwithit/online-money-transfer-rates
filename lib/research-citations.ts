const repository = "https://github.com/thisismyuserdealwithit/online-money-transfer-rates";
const releaseCommit = "c8776b3ffd854f2e49d28d31d73b217226019080";
const rawRepository = "https://raw.githubusercontent.com/thisismyuserdealwithit/online-money-transfer-rates";

export const researchCitationUpdated = "2026-10-06";
export type ResearchStudyId = "last-mile-tax" | "uk-remittance-vulnerability-index";

type DataFile = { file: string; label: string; rows: number };
type StudyDefinition = {
  title: string;
  dataTitle: string;
  tag: string;
  observations: string;
  transferBasis: string;
  description: string;
  limits: string;
  reuseLimits: string;
  files: DataFile[];
  sources: string[];
};

const definitions: Record<ResearchStudyId, StudyDefinition> = {
  "last-mile-tax": {
    title: "The Last Mile Tax 2026",
    dataTitle: "The Last Mile Tax 2026 data release",
    tag: "omt-last-mile-tax-2026-v1.0.0",
    observations: "RPW service prices: Q3 2025. Findex account ownership: 2024 surveys, published in 2025. Other country indicators: the available 2021–2024 observations, with years retained in the data.",
    transferBasis: "The £200 scenario linearly interpolates monetary cost between the World Bank’s observed £120 and £300 UK baskets. It is not a captured £200 quote.",
    description: "Version 1.0.0 contains derived summaries for 33 UK outbound corridors and 17 matched cash-versus-account comparisons. The source study analysed 791 World Bank RPW Q3 2025 service observations; country indicators retain their own observation years.",
    limits: "Service observations are products on offer, not customer transactions. Averages are not weighted by market share or transaction volume. The adjusted cash premium is an association, not proof of a causal effect or provider profit.",
    reuseLimits: "The versioned corridor file excludes the live API’s ITU-origin internet-use fields pending separate rights review. It also excludes provider screenshots and page content.",
    files: [
      { file: "corridor-summary.csv", label: "Destination cost and access table", rows: 33 },
      { file: "matched-offers.csv", label: "Matched cash and account offers", rows: 17 },
    ],
    sources: [
      "https://datacatalog.worldbank.org/search/dataset/0037898/remittance-prices-worldwide",
      "https://www.worldbank.org/en/publication/globalfindex/download-data",
      "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
    ],
  },
  "uk-remittance-vulnerability-index": {
    title: "The UK Remittance Cost Divide 2026",
    dataTitle: "UK Remittance Vulnerability Index 2026 data release",
    tag: "omt-remittance-vulnerability-index-2026-v1.0.0",
    observations: "Headline service prices: Q3 2025, with UK price history from Q1 2011. Annual WDI series: 2014–2024. Quote-summary fields belong to the 23 August 2026 snapshot and retain their recorded capture times.",
    transferBasis: "The World Bank observed £120 and £300 UK baskets. Pounds per £100 restates a cost percentage; it is not a separately observed £100 quote.",
    description: "Version 1.0.0 separates 33 official UK outbound RPW corridor summaries, 16 high/low destination rows for eight providers, a 21-corridor macroeconomic panel and 162 history rows. Historical official prices and the snapshot’s quote summaries remain separate; no synthetic vulnerability score is calculated.",
    limits: "Service averages are not weighted by transaction volume or market share. The provider comparisons cover the RPW sample, not all products or current service quality. A customer exchange-rate margin is not provider profit; national income does not establish the cause of a price gap.",
    reuseLimits: "Quote-summary fields in the archived panel are historical, even where a column name contains ‘fresh’ or ‘live’. Provider screenshots and page content are not included. The current API can change after this snapshot.",
    files: [
      { file: "official-corridors.csv", label: "Official UK destination summaries", rows: 33 },
      { file: "provider-comparisons.csv", label: "Provider high/low destination rows", rows: 16 },
      { file: "corridor-panel.csv", label: "Macroeconomic and dated quote-summary panel", rows: 21 },
      { file: "history.csv", label: "Price and macroeconomic history", rows: 162 },
    ],
    sources: [
      "https://datacatalog.worldbank.org/search/dataset/0037898/remittance-prices-worldwide",
      "https://datacatalog.worldbank.org/search/dataset/0037712/world-development-indicators",
    ],
  },
};

export function getResearchCitation(id: ResearchStudyId) {
  const study = definitions[id];
  const canonicalUrl = `https://onlinemoneytransfer.co.uk/research/${id}`;
  const fileUrl = (file: string) => `${rawRepository}/${releaseCommit}/research-releases/${study.tag}/${file}`;
  return {
    ...study,
    canonicalUrl,
    reportId: `${canonicalUrl}#report`,
    datasetId: `${canonicalUrl}#dataset-v1-0-0`,
    reportPublished: "2026-07-22",
    version: "1.0.0",
    snapshotDate: "2026-08-23",
    releasePublished: "2026-08-25",
    releaseCommit,
    releaseUrl: `${repository}/releases/tag/${study.tag}`,
    archiveUrl: `${repository}/releases/download/${study.tag}/${study.tag}.zip`,
    citationUrl: fileUrl("CITATION.cff"),
    licenceUrl: fileUrl("LICENSE.md"),
    attributionUrl: fileUrl("RIGHTS-AND-ATTRIBUTION.md"),
    methodologyUrl: fileUrl("METHODOLOGY.md"),
    checksumUrl: fileUrl("SHA256SUMS"),
    files: study.files.map((file) => ({ ...file, url: fileUrl(`data/${file.file}`) })),
    suggestedCitation: `Online Money Transfer and Finofin Limited. 2026. ${study.dataTitle}. Version 1.0.0. Snapshot 23 August 2026.`,
  };
}

export function researchDatasetSchema(id: ResearchStudyId) {
  const study = getResearchCitation(id);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": study.datasetId,
    name: study.dataTitle,
    description: `${study.description} Observation periods: ${study.observations} ${study.transferBasis} ${study.limits} ${study.reuseLimits}`,
    version: study.version,
    identifier: study.tag,
    url: `${study.canonicalUrl}#cite-this-study`,
    sameAs: study.releaseUrl,
    dateCreated: study.snapshotDate,
    datePublished: study.releasePublished,
    creator: [
      { "@type": "Organization", name: "Online Money Transfer", url: "https://onlinemoneytransfer.co.uk" },
      { "@type": "Organization", name: "Finofin Limited", url: "https://finofin.com" },
    ],
    publisher: { "@type": "Organization", name: "Finofin Limited", url: "https://finofin.com" },
    isPartOf: { "@type": "Report", "@id": study.reportId, url: study.canonicalUrl },
    isBasedOn: study.sources,
    measurementTechnique: study.methodologyUrl,
    license: study.licenceUrl,
    usageInfo: study.attributionUrl,
    conditionsOfAccess: "Finofin’s original selection, arrangement, calculations and documentation are CC BY 4.0. Underlying World Bank data retain their licence and additional terms. Preserve source credits, periods, units and qualifications; no endorsement is implied.",
    isAccessibleForFree: true,
    distribution: study.files.map((file) => ({
      "@type": "DataDownload",
      name: `${file.label} (${file.rows} rows)`,
      contentUrl: file.url,
      encodingFormat: "text/csv",
    })),
  };
}