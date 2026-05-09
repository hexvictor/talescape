import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { blocks, pages, parts, tales } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type { EntryType } from "~/server/db/types/tale-reader/entry";

export const entries = createTable("entry", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	partId: d
		.integer()
		.notNull()
		.references(() => parts.id),
	title: d.text().notNull(),
	type: d.text().notNull().$type<EntryType>(),
	index: d.integer().notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const entriesRelations = relations(entries, ({ one, many }) => ({
	tale: one(tales, {
		fields: [entries.taleId],
		references: [tales.id],
	}),
	part: one(parts, {
		fields: [entries.partId],
		references: [parts.id],
	}),
	pages: many(pages),
	blocks: many(blocks),
}));

export type EntrySchema = InferSelectModel<typeof entries>;
