import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { index } from "drizzle-orm/pg-core";
import { users } from "../users";
import { books } from "../library/books";
import type {
  AssetAccessLevel,
  AssetStatus,
  AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type { TaleType } from "~/server/db/types/tale-reader/tale";

export const tales = createTable("tale", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  creatorId: d.text().references(() => users.id),
  bookId: d.integer().references(() => books.id),
  title: d.text().notNull(),
  slug: d.text().notNull(),
  description: d.text().notNull(),
  isOfficial: d.boolean().notNull().default(false),
  editable: d.boolean().notNull().default(true),
  visibility: d.text().notNull().$type<AssetVisibility>().default("public"),
  status: d.text().notNull().$type<AssetStatus>().default("draft"),
  cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
  type: d.text().notNull().$type<TaleType>(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const talesRelations = relations(tales, ({ one }) => ({
  creatorById: one(users, {
    fields: [tales.creatorId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [tales.bookId],
    references: [books.id],
  }),
}));

export type TaleSchema = InferSelectModel<typeof tales>;
