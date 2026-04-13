import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { tales } from "../tales";

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

export const partsRelations = relations(parts, ({ one }) => ({
	tale: one(tales, {
		fields: [parts.taleId],
		references: [tales.id],
	}),
}));

export type PartSchema = InferSelectModel<typeof parts>;
