import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { tales } from "./tales";
import { users } from "../users";
import type { TalePermissionType } from "~/server/db/types/tale-reader/tale";

export const talePermissions = createTable("tale_permission", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

  taleId: d.integer().references(() => tales.id),
  userId: d.text().references(() => users.id),

  permissionTypes: d.text().array().notNull().$type<TalePermissionType[]>(),

  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const talePermissionsRelations = relations(
  talePermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [talePermissions.userId],
      references: [users.id],
    }),
    tale: one(tales, {
      fields: [talePermissions.taleId],
      references: [tales.id],
    }),
  })
);

export type TalePermissionSchema = InferSelectModel<typeof talePermissions>;
