ALTER TABLE "talescape_path" ADD COLUMN "fromStepId" integer;--> statement-breakpoint
ALTER TABLE "talescape_path" ADD COLUMN "toStepId" integer;--> statement-breakpoint
ALTER TABLE "talescape_step" ADD COLUMN "branchId" integer;--> statement-breakpoint
UPDATE "talescape_step" AS step
SET "branchId" = scene."branchId"
FROM "talescape_scene" AS scene
WHERE step."sceneId" = scene."id";--> statement-breakpoint
ALTER TABLE "talescape_step" ALTER COLUMN "branchId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_path" ADD CONSTRAINT "talescape_path_fromStepId_talescape_step_id_fk" FOREIGN KEY ("fromStepId") REFERENCES "public"."talescape_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_path" ADD CONSTRAINT "talescape_path_toStepId_talescape_step_id_fk" FOREIGN KEY ("toStepId") REFERENCES "public"."talescape_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talescape_step" ADD CONSTRAINT "talescape_step_branchId_talescape_branch_id_fk" FOREIGN KEY ("branchId") REFERENCES "public"."talescape_branch"("id") ON DELETE no action ON UPDATE no action;
