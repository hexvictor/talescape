import { type InferSelectModel, relations, sql } from "drizzle-orm";
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
import { entries } from "../narrative-structure/entries";
import { pages } from "../narrative-structure/pages";
import { parts } from "../narrative-structure/parts";
import { blockPermissions } from "../permissions/blockPermissions";
import { tales } from "../tales";
import { branches } from "./branches";
import { fragments } from "./fragments";
import { nodes } from "./nodes";

export const blocks = createTable("block", (d) => ({
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
	pageId: d
		.integer()
		.notNull()
		.references(() => pages.id),
	entryId: d
		.integer()
		.notNull()
		.references(() => entries.id),
	partId: d
		.integer()
		.notNull()
		.references(() => parts.id),
	title: d.text(),
	description: d.text(),
	isChoiceBlock: d.boolean().notNull().default(false),
	isSnap: d.boolean().notNull().default(false),
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
				entering: { tracks: [] },
				leaving: { tracks: [] },
				scrolling: { tracks: [] },
			},
			readingLength: null,
			readingLengthMode: "content",
		}),
	transitionConfig: d
		.json()
		.notNull()
		.$type<TransitionConfig>()
		.default({
			animationConfig: {
				entering: { tracks: [] },
				leaving: { tracks: [] },
			},
			enteringLength: 700,
			flow: { direction: "down", type: "linear" },
			leavingLength: 700,
		}),
	styleConfig: d.json().$type<ReaderStyleConfig>(),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
	tale: one(tales, {
		fields: [blocks.taleId],
		references: [tales.id],
	}),
	branch: one(branches, {
		fields: [blocks.branchId],
		references: [branches.id],
	}),
	user: one(users, {
		fields: [blocks.creatorId],
		references: [users.id],
	}),
	page: one(pages, {
		fields: [blocks.pageId],
		references: [pages.id],
	}),
	entry: one(entries, {
		fields: [blocks.entryId],
		references: [entries.id],
	}),
	part: one(parts, {
		fields: [blocks.partId],
		references: [parts.id],
	}),
	fragments: many(fragments),
	nodes: many(nodes),
	permissions: many(blockPermissions),
}));

export type BlockSchema = InferSelectModel<typeof blocks>;
