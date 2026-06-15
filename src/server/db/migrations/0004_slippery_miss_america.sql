ALTER TABLE "talescape_tale_progress" RENAME COLUMN "committedFragmentIds" TO "committedAnimationIds";--> statement-breakpoint
ALTER TABLE "talescape_node" ADD COLUMN "animationConfig" json DEFAULT '{"ambient":{"tracks":[]},"entering":{"tracks":[]},"leaving":{"tracks":[]},"scrolling":{"tracks":[]}}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_tale" ADD COLUMN "transitionFirstBlock" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "talescape_block" DROP COLUMN "previousTransitionOverrideConfig";--> statement-breakpoint
ALTER TABLE "talescape_fragment" DROP COLUMN "scrollAnimationPlayback";