import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { blocks, entries, parts, tales } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type { PageType } from "~/server/db/types/tale-reader/page";

export const pages = createTable("page", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	partId: d
		.integer()
		.notNull()
		.references(() => parts.id),
	entryId: d
		.integer()
		.notNull()
		.references(() => entries.id),
	type: d.text().notNull().$type<PageType>(),
	isPaginated: d.boolean().notNull(),
	index: d.integer().notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
	tale: one(tales, {
		fields: [pages.taleId],
		references: [tales.id],
	}),
	part: one(parts, {
		fields: [pages.partId],
		references: [parts.id],
	}),
	entry: one(entries, {
		fields: [pages.entryId],
		references: [entries.id],
	}),
	blocks: many(blocks),
}));

export type PageSchema = InferSelectModel<typeof pages>;
