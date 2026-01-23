import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { sections } from "./sections";
import { createTable } from "~/server/db/schema-helpers";
import { users } from "../../users";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";

export const sectionPermissions = createTable("section_permission", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

  sectionId: d
    .integer()
    .notNull()
    .references(() => sections.id),
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

export const sectionPermissionsRelations = relations(
  sectionPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [sectionPermissions.userId],
      references: [users.id],
    }),
    section: one(sections, {
      fields: [sectionPermissions.sectionId],
      references: [sections.id],
    }),
  })
);

export type SectionPermissionSchema = InferSelectModel<
  typeof sectionPermissions
>;
