import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { blocks, entries, pages, tales } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";

export const parts = createTable("part", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	title: d.text().notNull(),
	index: d.integer().notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const partsRelations = relations(parts, ({ one, many }) => ({
	tale: one(tales, {
		fields: [parts.taleId],
		references: [tales.id],
	}),
	entries: many(entries),
	pages: many(pages),
	blocks: many(blocks),
}));

export type PartSchema = InferSelectModel<typeof parts>;
