import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { blocks } from "../layout-structure/blocks";
import { entries } from "./entries";
import { tales } from "../tales";

export const entryRanges = createTable("entry_range", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  taleId: d
    .integer()
    .notNull()
    .references(() => tales.id),
  entryId: d
    .integer()
    .notNull()
    .references(() => entries.id),
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

export const entryRangeRelations = relations(entryRanges, ({ one }) => ({
  entry: one(entries, {
    fields: [entryRanges.entryId],
    references: [entries.id],
  }),
  tale: one(tales, {
    fields: [entryRanges.taleId],
    references: [tales.id],
  }),
  firstBlock: one(blocks, {
    fields: [entryRanges.firstBlockId],
    references: [blocks.id],
  }),
  lastBlock: one(blocks, {
    fields: [entryRanges.lastBlockId],
    references: [blocks.id],
  }),
}));

export type EntryRangeSchema = InferSelectModel<typeof entryRanges>;
