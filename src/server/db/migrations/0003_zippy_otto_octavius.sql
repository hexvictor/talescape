ALTER TABLE "talescape_section" ALTER COLUMN "orientation" SET DEFAULT 'vertical';--> statement-breakpoint
ALTER TABLE "talescape_block_embed" ADD COLUMN "isSnap" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_section_embed" ADD COLUMN "isSnap" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_section" ADD COLUMN "direction" text DEFAULT 'down' NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_section" DROP COLUMN "layout";