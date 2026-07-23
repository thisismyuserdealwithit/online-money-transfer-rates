CREATE TABLE `affiliate_clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_slug` text NOT NULL,
	`corridor_slug` text,
	`placement` text NOT NULL,
	`destination_host` text NOT NULL,
	`commercial` integer DEFAULT false NOT NULL,
	`consent_mode` text NOT NULL,
	`session_hash` text,
	`referrer_path` text,
	`clicked_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `affiliate_clicks_provider_date_idx` ON `affiliate_clicks` (`provider_slug`,`clicked_at`);--> statement-breakpoint
CREATE INDEX `affiliate_clicks_corridor_date_idx` ON `affiliate_clicks` (`corridor_slug`,`clicked_at`);