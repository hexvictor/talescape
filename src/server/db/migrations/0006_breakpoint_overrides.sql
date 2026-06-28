ALTER TABLE "talescape_tale"
ADD COLUMN "breakpointConfig" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint

ALTER TABLE "talescape_block"
ADD COLUMN "responsiveConfig" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint

ALTER TABLE "talescape_fragment"
ADD COLUMN "responsiveConfig" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint
