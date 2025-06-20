import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { users } from "../users";
import { tales } from "./tales";

export const taleProgresses = createTable("tale_progress", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

  userId: d
    .text()
    .notNull()
    .references(() => users.id),
  taleId: d
    .integer()
    .notNull()
    .references(() => tales.id),

  // 👁 Explicit progress tracking
  seenBlockIds: d.integer().array().notNull().default([]),

  // 📍 Last viewed position
  lastBlockId: d.integer(),

  // 🔢 Max block reached (used for skim progress)
  maxBlockIdReached: d.integer(),

  // 📈 Progress percentages (calculated client-side)
  seenBlockProgress: d
    .numeric({ precision: 5, scale: 4 })
    .notNull()
    .default("0"),
  linearReadProgress: d
    .numeric({ precision: 5, scale: 4 })
    .notNull()
    .default("0"),

  updatedAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const taleProgressesRelations = relations(taleProgresses, ({ one }) => ({
  user: one(users, {
    fields: [taleProgresses.userId],
    references: [users.id],
  }),
  tale: one(tales, {
    fields: [taleProgresses.taleId],
    references: [tales.id],
  }),
}));

export type TaleProgressSchema = InferSelectModel<typeof taleProgresses>;
