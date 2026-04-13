import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { tales } from "../tales";
import type { EntryType } from "~/server/db/types/tale-reader/entry";
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
	type: d.text().notNull().$type<EntryType>(),
	index: d.integer().notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
	tale: one(tales, {
		fields: [entries.taleId],
		references: [tales.id],
	}),
	part: one(parts, {
		fields: [entries.partId],
		references: [parts.id],
	}),
}));

export type EntrySchema = InferSelectModel<typeof entries>;
