import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	FragmentData,
	FragmentType,
} from "~/server/db/types/tale-reader/fragment";
import type {
	FragmentAnimationConfig,
	FragmentPlacementConfig,
	ReaderStyleConfig,
	TimelineRange,
} from "~/server/db/types/tale-reader/readerConfig";
import { users } from "../../users";
import { fragmentPermissions } from "../permissions/fragmentPermissions";
import { tales } from "../tales";
import { blocks } from "./blocks";
import { nodes } from "./nodes";

export const fragments = createTable("fragment", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	blockId: d
		.integer()
		.notNull()
		.references(() => blocks.id),
	nodeId: d.integer().references(() => nodes.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	type: d.text().notNull().$type<FragmentType>(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	order: d.integer().notNull(),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	data: d.json().notNull().$type<FragmentData>(),
	content: d
		.json()
		.notNull()
		.$type<Record<string, unknown>>()
		.default({ content: "" }),
	placementConfig: d
		.json()
		.notNull()
		.$type<FragmentPlacementConfig>()
		.default({ mode: "normal" }),
	styleConfig: d.json().$type<ReaderStyleConfig>(),
	visibleRange: d.json().$type<TimelineRange>(),
	animationConfig: d
		.json()
		.notNull()
		.$type<FragmentAnimationConfig>()
		.default({
			ambient: { tracks: [] },
			entering: { tracks: [] },
			leaving: { tracks: [] },
			scrolling: { tracks: [] },
		}),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const fragmentsRelations = relations(fragments, ({ one, many }) => ({
	tale: one(tales, {
		fields: [fragments.taleId],
		references: [tales.id],
	}),
	block: one(blocks, {
		fields: [fragments.blockId],
		references: [blocks.id],
	}),
	node: one(nodes, {
		fields: [fragments.nodeId],
		references: [nodes.id],
	}),
	user: one(users, {
		fields: [fragments.creatorId],
		references: [users.id],
	}),
	permissions: many(fragmentPermissions),
}));

export type FragmentSchema = InferSelectModel<typeof fragments>;
