import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { fragments } from "./fragments";
import { createTable } from "~/server/db/schema-helpers";
import { users } from "../../users";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";

export const fragmentPermissions = createTable("fragment_permission", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

  fragmentId: d
    .integer()
    .notNull()
    .references(() => fragments.id),
  userId: d
    .text()
    .notNull()
    .references(() => users.id),

  permissionTypes: d.text().array().notNull().$type<AssetPermissionType[]>(),

  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const fragmentPermissionsRelations = relations(
  fragmentPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [fragmentPermissions.userId],
      references: [users.id],
    }),
    fragment: one(fragments, {
      fields: [fragmentPermissions.fragmentId],
      references: [fragments.id],
    }),
  })
);

export type FragmentPermissionSchema = InferSelectModel<
  typeof fragmentPermissions
>;
