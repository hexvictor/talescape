import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { users } from "../../users";
import type {
  AssetAccessLevel,
  AssetStatus,
  AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
  FragmentData,
  FragmentType,
} from "~/server/db/types/tale-reader/fragment";

export const fragments = createTable("fragment", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  creatorId: d.text().references(() => users.id),
  type: d.text().notNull().$type<FragmentType>(),
  isOfficial: d.boolean().notNull().default(false),
  editable: d.boolean().notNull().default(true),
  visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
  embeddable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
  cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
  status: d.text().notNull().$type<AssetStatus>().default("draft"),
  data: d.json().notNull().$type<FragmentData>(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const fragmentsRelations = relations(fragments, ({ one }) => ({
  user: one(users, {
    fields: [fragments.creatorId],
    references: [users.id],
  }),
}));

export type FragmentSchema = InferSelectModel<typeof fragments>;
