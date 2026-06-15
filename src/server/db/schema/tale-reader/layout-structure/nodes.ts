import { type InferSelectModel, relations, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	NodeAnimationConfig,
	NodeConfig,
	ReaderStyleConfig,
} from "~/server/db/types/tale-reader/readerConfig";
import { users } from "../../users";
import { tales } from "../tales";
import { blocks } from "./blocks";
import { fragments } from "./fragments";

export const nodes = createTable("node", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	blockId: d
		.integer()
		.notNull()
		.references(() => blocks.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	parentNodeId: d.integer().references((): AnyPgColumn => nodes.id),
	stableId: d.text().notNull(),
	name: d.text(),
	isRoot: d.boolean().notNull().default(false),
	order: d.integer().notNull(),
	config: d.json().notNull().$type<NodeConfig>(),
	animationConfig: d
		.json()
		.notNull()
		.$type<NodeAnimationConfig>()
		.default({
			ambient: { tracks: [] },
			entering: { tracks: [] },
			leaving: { tracks: [] },
			scrolling: { tracks: [] },
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

export const nodesRelations = relations(nodes, ({ one, many }) => ({
	tale: one(tales, {
		fields: [nodes.taleId],
		references: [tales.id],
	}),
	block: one(blocks, {
		fields: [nodes.blockId],
		references: [blocks.id],
	}),
	user: one(users, {
		fields: [nodes.creatorId],
		references: [users.id],
	}),
	children: many(nodes, {
		relationName: "node_children",
	}),
	parent: one(nodes, {
		fields: [nodes.parentNodeId],
		references: [nodes.id],
		relationName: "node_children",
	}),
	fragments: many(fragments),
}));

export type NodeSchema = InferSelectModel<typeof nodes>;
