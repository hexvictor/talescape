import { type InferSelectModel, relations, sql } from "drizzle-orm";
import type { TaleElementResponsiveOverride } from "~/app/(tale-app)/_shared/types";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	ElementData,
	ElementType,
} from "~/server/db/types/tale-reader/element";
import type {
	ElementAnimationConfig,
	ElementPlacementConfig,
	ReaderStyleConfig,
	TimelineRange,
} from "~/server/db/types/tale-reader/readerConfig";
import { users } from "../../users";
import { elementPermissions } from "../permissions/elementPermissions";
import { tales } from "../tales";
import { frames } from "./frames";
import { scenes } from "./scenes";

export const elements = createTable("element", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	sceneId: d
		.integer()
		.notNull()
		.references(() => scenes.id),
	frameId: d.integer().references(() => frames.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	type: d.text().notNull().$type<ElementType>(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	order: d.integer().notNull(),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	data: d.json().notNull().$type<ElementData>(),
	content: d
		.json()
		.notNull()
		.$type<Record<string, unknown>>()
		.default({ content: "" }),
	placementConfig: d
		.json()
		.notNull()
		.$type<ElementPlacementConfig>()
		.default({ mode: "normal" }),
	styleConfig: d.json().$type<ReaderStyleConfig>(),
	responsiveConfig: d
		.json()
		.notNull()
		.$type<Record<string, TaleElementResponsiveOverride>>()
		.default({}),
	visibleRange: d.json().$type<TimelineRange>(),
	animationConfig: d
		.json()
		.notNull()
		.$type<ElementAnimationConfig>()
		.default({
			ambient: { tracks: [] },
			intro: { tracks: [] },
			outro: { tracks: [] },
			active: { tracks: [] },
		}),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const elementsRelations = relations(elements, ({ one, many }) => ({
	tale: one(tales, {
		fields: [elements.taleId],
		references: [tales.id],
	}),
	scene: one(scenes, {
		fields: [elements.sceneId],
		references: [scenes.id],
	}),
	frame: one(frames, {
		fields: [elements.frameId],
		references: [frames.id],
	}),
	user: one(users, {
		fields: [elements.creatorId],
		references: [users.id],
	}),
	permissions: many(elementPermissions),
}));

export type ElementSchema = InferSelectModel<typeof elements>;
