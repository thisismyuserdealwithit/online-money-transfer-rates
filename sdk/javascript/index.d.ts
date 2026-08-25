export type CorridorGroup = "from-uk" | "to-uk" | "major";
export type QuoteType = "verified" | "indicative";
export type RateStatus = QuoteType | "stale";

export interface CorridorSummary {
  route: string;
  group: CorridorGroup;
  fromCountry: string;
  fromCode: string;
  fromCurrency: string;
  toCountry: string;
  toCode: string;
  toCurrency: string;
  standardTestAmount: number;
  url: string;
  ratesUrl: string;
}

export interface CorridorList {
  apiVersion: string;
  generatedAt: string;
  count: number;
  corridors: CorridorSummary[];
}

export interface Rate {
  id: string;
  provider: string;
  providerSlug: string;
  quoteType: QuoteType;
  status: RateStatus;
  eligibleForPriceRanking: boolean;
  sourceAmount: number;
  sourceCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  exchangeRate: number;
  feeAmount: number;
  feeCurrency: string;
  deliveryEstimate: string | null;
  fundingMethod: string;
  payoutMethod: string;
  pricingBasis: string | null;
  promotion: boolean;
  capturedAt: string;
  receiptUrl: string;
}

export interface Snapshot {
  id: string;
  kind: "current" | "crawl-run";
  capturedAt: string | null;
  rates: Rate[];
}

export interface RatesResponse {
  apiVersion: string;
  generatedAt: string;
  corridor: Omit<CorridorSummary, "group" | "fromCode" | "toCode" | "ratesUrl">;
  current: Snapshot;
  history: Snapshot[];
  useTerms: {
    price: "Free";
    attributionRequired: true;
    requiredLink: string;
    wording: string;
    placement: string;
    timestampRequired: true;
    statusRequired: true;
    context: string;
  };
  evidencePolicy: Record<string, string | boolean>;
}

export interface ClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export interface HistoryOptions {
  history?: number;
}

export class OnlineMoneyTransferClient {
  constructor(options?: ClientOptions);
  readonly baseUrl: string;
  listCorridors(): Promise<CorridorList>;
  getRates(route: string, options?: HistoryOptions): Promise<RatesResponse>;
  getRatesCsv(route: string, options?: HistoryOptions): Promise<string>;
}

export function createClient(options?: ClientOptions): OnlineMoneyTransferClient;
export function attributionFor(response: RatesResponse): {
  text: string;
  href: string;
  placement: string;
  timestampRequired: boolean;
  statusRequired: boolean;
  context: string;
};
