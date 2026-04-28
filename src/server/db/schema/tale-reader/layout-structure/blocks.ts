import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
	blockPermissions,
	entries,
	fragments,
	pages,
	parts,
	sections,
	tales,
	users,
} from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";

export const blocks = createTable("block", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	sectionId: d
		.integer()
		.notNull()
		.references(() => sections.id),
	entryId: d
		.integer()
		.notNull()
		.references(() => entries.id),
	partId: d
		.integer()
		.notNull()
		.references(() => parts.id),
	creatorId: d.text().references(() => users.id),
	isOfficial: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	pageId: d.integer().references(() => pages.id),
	isSnap: d.boolean().notNull().default(false),
	index: d.integer().notNull(),
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
	section: one(sections, {
		fields: [blocks.sectionId],
		references: [sections.id],
	}),
	entry: one(entries, {
		fields: [blocks.entryId],
		references: [entries.id],
	}),
	part: one(parts, {
		fields: [blocks.partId],
		references: [parts.id],
	}),
	user: one(users, {
		fields: [blocks.creatorId],
		references: [users.id],
	}),
	page: one(pages, {
		fields: [blocks.pageId],
		references: [pages.id],
	}),
	fragments: many(fragments),
	permissions: many(blockPermissions),
}));

export type BlockSchema = InferSelectModel<typeof blocks>;
