ALTER TABLE `qr_codes` ADD `max_scans` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `qr_codes` ADD `current_scans` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE `scan_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`qr_code_id` integer NOT NULL,
	`name` text(100) NOT NULL,
	`contact` text(200) NOT NULL,
	`country` text(50),
	`survey_answers` text,
	`team1` text(50),
	`team2` text(50),
	`team3` text(50),
	`team4` text(50),
	`scanned_at` integer NOT NULL
);
