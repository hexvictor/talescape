ALTER TABLE "talescape_tale" ADD COLUMN "snapConfig" json DEFAULT '{"scrollSnap":{"captureDistancePx":96,"delayMs":240,"durationSeconds":0.22,"minViewportFraction":null},"snap":{"captureDistancePx":96,"delayMs":0,"durationSeconds":0.22,"minViewportFraction":null}}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_block" DROP COLUMN "isSnap";
