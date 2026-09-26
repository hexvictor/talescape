import { type InferSelectModel, relations, sql } from "drizzle-orm";
import type { TaleKeyframe } from "~/app/(tale-app)/_shared/types";
import { createTable } from "~/server/db/schema-helpers";
import type {
	BlockSnapConfig,
	ReadingConfig,
	KeyframeActionConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { users } from "../../users";
import { pages } from "../narrative-structure/pages";
import { tales } from "../tales";
import { branches } from "./branches";
import { frames } from "./frames";
import { scenes } from "./scenes";

export const keyframes = createTable("keyframe", (d) => ({
	responsiveConfig: d
		.json()
		.notNull()
		.$type<NonNullable<TaleKeyframe["responsiveOverrides"]>>()
		.default({}),
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	sceneId: d
		.integer()
		.notNull()
		.references(() => scenes.id),
	branchId: d
		.integer()
		.notNull()
		.references(() => branches.id),
	frameId: d.integer().references(() => frames.id),
	pageId: d.integer().references(() => pages.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	title: d.text().notNull(),
	description: d.text(),
	order: d.integer().notNull(),
	readingConfig: d
		.json()
		.notNull()
		.$type<ReadingConfig>()
		.default({
			animationConfig: {
				ambient: { tracks: [] },
				active: { tracks: [] },
			},
			activeLength: null,
			activeLengthMode: "content",
		}),
	snapConfig: d
		.json()
		.notNull()
		.$type<BlockSnapConfig>()
		.default({ mode: "scroll-snap", strategy: "shared" }),
	actions: d.json().notNull().$type<KeyframeActionConfig[]>().default([]),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const keyframesRelations = relations(keyframes, ({ one }) => ({
	tale: one(tales, {
		fields: [keyframes.taleId],
		references: [tales.id],
	}),
	scene: one(scenes, {
		fields: [keyframes.sceneId],
		references: [scenes.id],
	}),
	branch: one(branches, {
		fields: [keyframes.branchId],
		references: [branches.id],
	}),
	frame: one(frames, {
		fields: [keyframes.frameId],
		references: [frames.id],
	}),
	page: one(pages, {
		fields: [keyframes.pageId],
		references: [pages.id],
	}),
	creator: one(users, {
		fields: [keyframes.creatorId],
		references: [users.id],
	}),
}));

export type KeyframeSchema = InferSelectModel<typeof keyframes>;
