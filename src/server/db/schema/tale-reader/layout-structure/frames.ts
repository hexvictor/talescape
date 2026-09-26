import { type InferSelectModel, relations, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	FrameAnimationConfig,
	FrameConfig,
	ReaderStyleConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { users } from "../../users";
import { tales } from "../tales";
import { elements } from "./elements";
import { scenes } from "./scenes";

export const frames = createTable("frame", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	sceneId: d
		.integer()
		.notNull()
		.references(() => scenes.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	parentFrameId: d.integer().references((): AnyPgColumn => frames.id),
	stableId: d.text().notNull(),
	name: d.text(),
	isRoot: d.boolean().notNull().default(false),
	order: d.integer().notNull(),
	config: d.json().notNull().$type<FrameConfig>(),
	animationConfig: d
		.json()
		.notNull()
		.$type<FrameAnimationConfig>()
		.default({
			ambient: { tracks: [] },
			intro: { tracks: [] },
			outro: { tracks: [] },
			active: { tracks: [] },
		}),
	styleConfig: d.json().$type<ReaderStyleConfig>(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const framesRelations = relations(frames, ({ one, many }) => ({
	tale: one(tales, {
		fields: [frames.taleId],
		references: [tales.id],
	}),
	scene: one(scenes, {
		fields: [frames.sceneId],
		references: [scenes.id],
	}),
	user: one(users, {
		fields: [frames.creatorId],
		references: [users.id],
	}),
	children: many(frames, {
		relationName: "frame_children",
	}),
	parent: one(frames, {
		fields: [frames.parentFrameId],
		references: [frames.id],
		relationName: "frame_children",
	}),
	elements: many(elements),
}));

export type FrameSchema = InferSelectModel<typeof frames>;
