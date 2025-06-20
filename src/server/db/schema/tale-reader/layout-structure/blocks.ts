import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { users } from "../../users";
import type {
  AssetAccessLevel,
  AssetStatus,
  AssetVisibility,
} from "~/types/schema/tale-builder/asset";

export const blocks = createTable("block", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  creatorId: d.text().references(() => users.id),
  isOfficial: d.boolean().notNull().default(false),
  editable: d.boolean().notNull().default(true),
  visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
  embeddable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
  cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
  status: d.text().notNull().$type<AssetStatus>().default("draft"),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  user: one(users, {
    fields: [blocks.creatorId],
    references: [users.id],
  }),
}));

export type BlockSchema = InferSelectModel<typeof blocks>;
