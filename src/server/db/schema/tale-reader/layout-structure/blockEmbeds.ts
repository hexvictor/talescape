import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { tales } from "../tales";
import { blocks } from "./blocks";
import { pages } from "../narrative-structure/pages";
import { sections } from "./sections";

export const blockEmbeds = createTable("block_embed", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	blockId: d
		.integer()
		.notNull()
		.references(() => blocks.id),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	sectionId: d
		.integer()
		.notNull()
		.references(() => sections.id),
	isSnap: d.boolean().notNull().default(false),
	pageId: d.integer().references(() => pages.id),
	index: d.integer().notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const blockEmbedsRelations = relations(blockEmbeds, ({ one }) => ({
	block: one(blocks, {
		fields: [blockEmbeds.blockId],
		references: [blocks.id],
	}),
	tale: one(tales, {
		fields: [blockEmbeds.taleId],
		references: [tales.id],
	}),
	section: one(sections, {
		fields: [blockEmbeds.sectionId],
		references: [sections.id],
	}),
	page: one(pages, {
		fields: [blockEmbeds.pageId],
		references: [pages.id],
	}),
}));

export type BlockEmbedSchema = InferSelectModel<typeof blockEmbeds>;
