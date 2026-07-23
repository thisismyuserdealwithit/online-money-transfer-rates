import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const corridorsTable = sqliteTable("corridors", {
  slug: text("slug").primaryKey(),
  sourceCountry: text("source_country").notNull(),
  sourceCurrency: text("source_currency").notNull(),
  destinationCountry: text("destination_country").notNull(),
  destinationCurrency: text("destination_currency").notNull(),
  testAmount: real("test_amount").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const providersTable = sqliteTable("providers", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  homepage: text("homepage").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const crawlRuns = sqliteTable("crawl_runs", {
  id: text("id").primaryKey(),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  status: text("status", { enum: ["running", "completed", "partial", "failed"] }).notNull(),
  attempted: integer("attempted").notNull().default(0),
  succeeded: integer("succeeded").notNull().default(0),
  failed: integer("failed").notNull().default(0),
  errorSummary: text("error_summary"),
});

export const quotesTable = sqliteTable("quotes", {
  id: text("id").primaryKey(),
  crawlRunId: text("crawl_run_id").notNull(),
  corridorSlug: text("corridor_slug").notNull(),
  providerSlug: text("provider_slug").notNull(),
  providerName: text("provider_name").notNull(),
  quoteType: text("quote_type", { enum: ["verified", "indicative"] }).notNull(),
  status: text("status", { enum: ["current", "stale", "invalid"] }).notNull().default("current"),
  sourceAmount: real("source_amount").notNull(),
  sourceCurrency: text("source_currency").notNull(),
  recipientAmount: real("recipient_amount").notNull(),
  recipientCurrency: text("recipient_currency").notNull(),
  feeAmount: real("fee_amount").notNull(),
  feeCurrency: text("fee_currency").notNull(),
  exchangeRate: real("exchange_rate").notNull(),
  deliveryEstimate: text("delivery_estimate"),
  fundingMethod: text("funding_method").notNull(),
  payoutMethod: text("payout_method").notNull(),
  planName: text("plan_name"),
  promotion: integer("promotion", { mode: "boolean" }).notNull().default(false),
  capturedAt: text("captured_at").notNull(),
  quoteUrl: text("quote_url").notNull(),
  screenshotKey: text("screenshot_key").notNull(),
  screenshotSha256: text("screenshot_sha256").notNull(),
  rawPayload: text("raw_payload").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("quotes_corridor_captured_idx").on(table.corridorSlug, table.capturedAt),
  index("quotes_provider_captured_idx").on(table.providerSlug, table.capturedAt),
  uniqueIndex("quotes_capture_unique_idx").on(table.corridorSlug, table.providerSlug, table.capturedAt),
]);

export const affiliateClicksTable = sqliteTable("affiliate_clicks", {
  id: text("id").primaryKey(),
  providerSlug: text("provider_slug").notNull(),
  corridorSlug: text("corridor_slug"),
  placement: text("placement").notNull(),
  destinationHost: text("destination_host").notNull(),
  commercial: integer("commercial", { mode: "boolean" }).notNull().default(false),
  consentMode: text("consent_mode", { enum: ["essential", "analytics"] }).notNull(),
  sessionHash: text("session_hash"),
  referrerPath: text("referrer_path"),
  clickedAt: text("clicked_at").notNull(),
}, (table) => [
  index("affiliate_clicks_provider_date_idx").on(table.providerSlug, table.clickedAt),
  index("affiliate_clicks_corridor_date_idx").on(table.corridorSlug, table.clickedAt),
]);
