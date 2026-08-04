import { type InferSelectModel, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AnimationTrack,
	BlockFlow,
	PresetTarget,
	ReaderStyleConfig,
	TimelineRange,
} from "~/server/db/types/tale-reader/readerConfig";

export const officialAnimationPresets = createTable(
	"official_animation_preset",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.text().notNull(),
		target: d.text().notNull().$type<PresetTarget>(),
		tracks: d.json().notNull().$type<AnimationTrack[]>(),
		isActive: d.boolean().notNull().default(true),
		sortOrder: d.integer().notNull().default(0),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
);

export const officialVisibilityPresets = createTable(
	"official_visibility_preset",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.text().notNull(),
		range: d.json().notNull().$type<TimelineRange>(),
		isActive: d.boolean().notNull().default(true),
		sortOrder: d.integer().notNull().default(0),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
);

export const officialTransitionPresets = createTable(
	"official_transition_preset",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.text().notNull(),
		flowConfig: d.json().notNull().$type<BlockFlow>(),
		enteringAnimationPresetIds: d.integer().array().notNull().default([]),
		leavingAnimationPresetIds: d.integer().array().notNull().default([]),
		isActive: d.boolean().notNull().default(true),
		sortOrder: d.integer().notNull().default(0),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
);

export const officialStylePresets = createTable(
	"official_style_preset",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.text().notNull(),
		target: d.text().notNull().$type<PresetTarget>(),
		styleConfig: d.json().notNull().$type<ReaderStyleConfig>(),
		isActive: d.boolean().notNull().default(true),
		sortOrder: d.integer().notNull().default(0),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
);

export type OfficialAnimationPresetSchema = InferSelectModel<
	typeof officialAnimationPresets
>;
export type OfficialVisibilityPresetSchema = InferSelectModel<
	typeof officialVisibilityPresets
>;
export type OfficialTransitionPresetSchema = InferSelectModel<
	typeof officialTransitionPresets
>;
export type OfficialStylePresetSchema = InferSelectModel<
	typeof officialStylePresets
>;
