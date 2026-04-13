import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { blocks } from "../layout-structure/blocks";
import { parts } from "./parts";
import { tales } from "../tales";

export const partRanges = createTable("part_range", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	partId: d
		.integer()
		.notNull()
		.references(() => parts.id),
	firstBlockId: d
		.integer()
		.notNull()
		.references(() => blocks.id),
	lastBlockId: d
		.integer()
		.notNull()
		.references(() => blocks.id),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const partRangeRelations = relations(partRanges, ({ one }) => ({
	part: one(parts, {
		fields: [partRanges.partId],
		references: [parts.id],
	}),
	tale: one(tales, {
		fields: [partRanges.taleId],
		references: [tales.id],
	}),
	firstBlock: one(blocks, {
		fields: [partRanges.firstBlockId],
		references: [blocks.id],
	}),
	lastBlock: one(blocks, {
		fields: [partRanges.lastBlockId],
		references: [blocks.id],
	}),
}));

export type PartRangeSchema = InferSelectModel<typeof partRanges>;
