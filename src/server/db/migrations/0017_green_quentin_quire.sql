ALTER TABLE "talescape_step" RENAME TO "talescape_keyframe";--> statement-breakpoint
ALTER TABLE "talescape_path" DROP CONSTRAINT "talescape_path_fromKeyframeId_talescape_step_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_path" DROP CONSTRAINT "talescape_path_toKeyframeId_talescape_step_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_keyframe" DROP CONSTRAINT "talescape_step_taleId_talescape_tale_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_keyframe" DROP CONSTRAINT "talescape_step_sceneId_talescape_scene_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_keyframe" DROP CONSTRAINT "talescape_step_branchId_talescape_branch_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_keyframe" DROP CONSTRAINT "talescape_step_frameId_talescape_frame_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_keyframe" DROP CONSTRAINT "talescape_step_pageId_talescape_page_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_keyframe" DROP CONSTRAINT "talescape_step_creatorId_talescape_user_id_fk";
--> statement-breakpoint
ALTER TABLE "talescape_tale" ALTER COLUMN "playbackConfig" SET DEFAULT '{"autoplay":{"enabled":false,"speed":52,"stopOn":{"dragging":true,"keyboard":true,"scrolling":true}},"interactions":{"dragging":true,"keyboard":true,"scrolling":true}}'::json;--> statement-breakpoint
ALTER TABLE "talescape_path" ADD CONSTRAINT "talescape_path_fromKeyframeId_talescape_keyframe_id_fk" FOREIGN KEY ("fromKeyframeId") REFERENCES "public"."talescape_keyframe"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_path" ADD CONSTRAINT "talescape_path_toKeyframeId_talescape_keyframe_id_fk" FOREIGN KEY ("toKeyframeId") REFERENCES "public"."talescape_keyframe"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_keyframe" ADD CONSTRAINT "talescape_keyframe_taleId_talescape_tale_id_fk" FOREIGN KEY ("taleId") REFERENCES "public"."talescape_tale"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_keyframe" ADD CONSTRAINT "talescape_keyframe_sceneId_talescape_scene_id_fk" FOREIGN KEY ("sceneId") REFERENCES "public"."talescape_scene"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_keyframe" ADD CONSTRAINT "talescape_keyframe_branchId_talescape_branch_id_fk" FOREIGN KEY ("branchId") REFERENCES "public"."talescape_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_keyframe" ADD CONSTRAINT "talescape_keyframe_frameId_talescape_frame_id_fk" FOREIGN KEY ("frameId") REFERENCES "public"."talescape_frame"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_keyframe" ADD CONSTRAINT "talescape_keyframe_pageId_talescape_page_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."talescape_page"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_keyframe" ADD CONSTRAINT "talescape_keyframe_creatorId_talescape_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."talescape_user"("id") ON DELETE no action ON UPDATE no action;