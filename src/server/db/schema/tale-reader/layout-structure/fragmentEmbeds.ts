import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { fragments } from "./fragments";
import { createTable } from "~/server/db/schema-helpers";
import { tales } from "../tales";
import { blocks } from "./blocks";

export const fragmentEmbeds = createTable("fragment_embed", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

  fragmentId: d
    .integer()
    .notNull()
    .references(() => fragments.id),
  taleId: d
    .integer()
    .notNull()
    .references(() => tales.id),
  blockId: d
    .integer()
    .notNull()
    .references(() => blocks.id),
  index: d.integer().notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const fragmentEmbedsRelations = relations(fragmentEmbeds, ({ one }) => ({
  fragment: one(fragments, {
    fields: [fragmentEmbeds.fragmentId],
    references: [fragments.id],
  }),
  tale: one(tales, {
    fields: [fragmentEmbeds.taleId],
    references: [tales.id],
  }),
  block: one(blocks, {
    fields: [fragmentEmbeds.blockId],
    references: [blocks.id],
  }),
}));

export type FragmentEmbedSchema = InferSelectModel<typeof fragmentEmbeds>;
