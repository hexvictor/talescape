import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { tales } from "../tales";
import { blocks } from "./blocks";
import { sections } from "./sections";

export const sectionEmbeds = createTable("section_embed", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  sectionId: d
    .integer()
    .notNull()
    .references(() => sections.id),
  taleId: d
    .integer()
    .notNull()
    .references(() => tales.id),
  index: d.integer().notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const sectionEmbedsRelations = relations(sectionEmbeds, ({ one }) => ({
  section: one(sections, {
    fields: [sectionEmbeds.sectionId],
    references: [sections.id],
  }),
  tale: one(tales, {
    fields: [sectionEmbeds.taleId],
    references: [tales.id],
  }),
}));

export type SectionEmbedSchema = InferSelectModel<typeof sectionEmbeds>;
