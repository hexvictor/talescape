import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { blocks } from "../layout-structure/blocks";
import { tales } from "../tales";
import { entries } from "./entries";
import { pages } from "./pages";

export const parts = createTable("part", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	title: d.text().notNull(),
	description: d.text(),
	order: d.integer().notNull(),
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
	blocks: many(blocks),
	pages: many(pages),
}));

export type PartSchema = InferSelectModel<typeof parts>;
