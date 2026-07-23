CREATE TABLE `corridors` (
	`slug` text PRIMARY KEY NOT NULL,
	`source_country` text NOT NULL,
	`source_currency` text NOT NULL,
	`destination_country` text NOT NULL,
	`destination_currency` text NOT NULL,
	`test_amount` real NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `crawl_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`status` text NOT NULL,
	`attempted` integer DEFAULT 0 NOT NULL,
	`succeeded` integer DEFAULT 0 NOT NULL,
	`failed` integer DEFAULT 0 NOT NULL,
	`error_summary` text
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`homepage` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`crawl_run_id` text NOT NULL,
	`corridor_slug` text NOT NULL,
	`provider_slug` text NOT NULL,
	`provider_name` text NOT NULL,
	`quote_type` text NOT NULL,
	`status` text DEFAULT 'current' NOT NULL,
	`source_amount` real NOT NULL,
	`source_currency` text NOT NULL,
	`recipient_amount` real NOT NULL,
	`recipient_currency` text NOT NULL,
	`fee_amount` real NOT NULL,
	`fee_currency` text NOT NULL,
	`exchange_rate` real NOT NULL,
	`delivery_estimate` text,
	`funding_method` text NOT NULL,
	`payout_method` text NOT NULL,
	`plan_name` text,
	`promotion` integer DEFAULT false NOT NULL,
	`captured_at` text NOT NULL,
	`quote_url` text NOT NULL,
	`screenshot_key` text NOT NULL,
	`screenshot_sha256` text NOT NULL,
	`raw_payload` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quotes_corridor_captured_idx` ON `quotes` (`corridor_slug`,`captured_at`);--> statement-breakpoint
CREATE INDEX `quotes_provider_captured_idx` ON `quotes` (`provider_slug`,`captured_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_capture_unique_idx` ON `quotes` (`corridor_slug`,`provider_slug`,`captured_at`);