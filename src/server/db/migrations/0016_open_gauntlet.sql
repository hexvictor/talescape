ALTER TABLE "talescape_path" RENAME COLUMN "fromStepId" TO "fromKeyframeId";--> statement-breakpoint
ALTER TABLE "talescape_path" RENAME COLUMN "toStepId" TO "toKeyframeId";--> statement-breakpoint
ALTER TABLE "talescape_tale_progress" RENAME COLUMN "seenStepIds" TO "seenKeyframeIds";--> statement-breakpoint
ALTER TABLE "talescape_tale_progress" RENAME COLUMN "lastStepId" TO "lastKeyframeId";--> statement-breakpoint
ALTER TABLE "talescape_tale_progress" RENAME COLUMN "lastStepInnerProgress" TO "lastKeyframeInnerProgress";--> statement-breakpoint
ALTER TABLE "talescape_tale_progress" RENAME COLUMN "seenStepProgress" TO "seenKeyframeProgress";--> statement-breakpoint
ALTER TABLE "talescape_scene" DROP CONSTRAINT "talescape_scene_pageId_talescape_page_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_scene" DROP CONSTRAINT "talescape_scene_entryId_talescape_entry_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_scene" DROP CONSTRAINT "talescape_scene_partId_talescape_part_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_path" DROP CONSTRAINT "talescape_path_fromStepId_talescape_step_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_path" DROP CONSTRAINT "talescape_path_toStepId_talescape_step_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_scene" ALTER COLUMN "readingConfig" SET DEFAULT '{"animationConfig":{"ambient":{"tracks":[]},"active":{"tracks":[]}},"activeLength":null,"activeLengthMode":"content"}'::json;--> statement-breakpoint
ALTER TABLE "talescape_scene" ALTER COLUMN "transitionConfig" SET DEFAULT '{"animationConfig":{"intro":{"tracks":[]},"outro":{"tracks":[]}},"introLength":null,"flow":{"direction":"down","type":"linear"},"outroLength":null}'::json;--> statement-breakpoint
ALTER TABLE "talescape_frame" ALTER COLUMN "animationConfig" SET DEFAULT '{"ambient":{"tracks":[]},"intro":{"tracks":[]},"outro":{"tracks":[]},"active":{"tracks":[]}}'::json;--> statement-breakpoint
ALTER TABLE "talescape_element" ALTER COLUMN "animationConfig" SET DEFAULT '{"ambient":{"tracks":[]},"intro":{"tracks":[]},"outro":{"tracks":[]},"active":{"tracks":[]}}'::json;--> statement-breakpoint
ALTER TABLE "talescape_step" ALTER COLUMN "readingConfig" SET DEFAULT '{"animationConfig":{"ambient":{"tracks":[]},"active":{"tracks":[]}},"activeLength":null,"activeLengthMode":"content"}'::json;--> statement-breakpoint
ALTER TABLE "talescape_tale" ALTER COLUMN "playbackConfig" SET DEFAULT '{"autoplay":{"enabled":false,"speed":52,"stopOn":{"dragging":true,"keyboard":true,"active":true}},"interactions":{"dragging":true,"keyboard":true,"active":true}}'::json;--> statement-breakpoint
ALTER TABLE "talescape_scene" ADD COLUMN "containerConfig" json DEFAULT '{"mode":"stack"}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_step" ADD COLUMN "responsiveConfig" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_path" ADD CONSTRAINT "talescape_path_fromKeyframeId_talescape_step_id_fk" FOREIGN KEY ("fromKeyframeId") REFERENCES "public"."talescape_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_path" ADD CONSTRAINT "talescape_path_toKeyframeId_talescape_step_id_fk" FOREIGN KEY ("toKeyframeId") REFERENCES "public"."talescape_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_scene" DROP COLUMN "pageId";--> statement-breakpoint
ALTER TABLE "talescape_scene" DROP COLUMN "entryId";--> statement-breakpoint
ALTER TABLE "talescape_scene" DROP COLUMN "partId";