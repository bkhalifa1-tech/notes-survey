CREATE TABLE `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`major` text NOT NULL,
	`level` text NOT NULL,
	`interest` text NOT NULL,
	`donate` text NOT NULL,
	`donate_courses` text NOT NULL,
	`need` text NOT NULL,
	`need_courses` text NOT NULL,
	`attendance` text NOT NULL,
	`notes` text NOT NULL
);
