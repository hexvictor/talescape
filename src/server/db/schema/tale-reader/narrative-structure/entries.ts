import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
import { blocks } from "../layout-structure/blocks";
import { tales } from "../tales";
import { pages } from "./pages";
import { parts } from "./parts";

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
	description: d.text(),
	type: d.text().notNull().$type<EntryType>(),
	isNumbered: d.boolean().notNull().default(false),
	order: d.integer().notNull(),
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
	blocks: many(blocks),
	pages: many(pages),
}));

export type EntrySchema = InferSelectModel<typeof entries>;
