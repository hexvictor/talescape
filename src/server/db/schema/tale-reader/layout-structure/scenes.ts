import { type InferSelectModel, relations, sql } from "drizzle-orm";
import type {
	SceneContainer,
	TaleSceneResponsiveOverride,
} from "~/app/(tale-app)/_shared/types";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	ReaderSizeConfig,
	ReaderSizeMode,
	ReaderStyleConfig,
	ReadingConfig,
	TransitionConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { users } from "../../users";
import { scenePermissions } from "../permissions/scenePermissions";
import { tales } from "../tales";
import { branches } from "./branches";
import { elements } from "./elements";
import { frames } from "./frames";
import { keyframes } from "./keyframes";

export const scenes = createTable("scene", (d) => ({
	containerConfig: d
		.json()
		.notNull()
		.$type<SceneContainer>()
		.default({ mode: "stack" }),
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	branchId: d
		.integer()
		.notNull()
		.references(() => branches.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	title: d.text(),
	description: d.text(),
	isChoiceScene: d.boolean().notNull().default(false),
	order: d.integer().notNull(),
	pageOrder: d.integer().notNull().default(0),
	sizeMode: d
		.text()
		.notNull()
		.$type<ReaderSizeMode>()
		.default("contentResponsive"),
	sizeConfig: d.json().notNull().$type<ReaderSizeConfig>().default({}),
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
	transitionConfig: d
		.json()
		.notNull()
		.$type<TransitionConfig>()
		.default({
			animationConfig: {
				intro: { tracks: [] },
				outro: { tracks: [] },
			},
			introLength: null,
			flow: { direction: "down", type: "linear" },
			outroLength: null,
		}),
	styleConfig: d.json().$type<ReaderStyleConfig>(),
	responsiveConfig: d
		.json()
		.notNull()
		.$type<Record<string, TaleSceneResponsiveOverride>>()
		.default({}),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const scenesRelations = relations(scenes, ({ one, many }) => ({
	tale: one(tales, {
		fields: [scenes.taleId],
		references: [tales.id],
	}),
	branch: one(branches, {
		fields: [scenes.branchId],
		references: [branches.id],
	}),
	user: one(users, {
		fields: [scenes.creatorId],
		references: [users.id],
	}),
	elements: many(elements),
	frames: many(frames),
	keyframes: many(keyframes),
	permissions: many(scenePermissions),
}));

export type SceneSchema = InferSelectModel<typeof scenes>;
