import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";
import { users } from "../../users";
import { elements } from "../layout-structure/elements";

export const elementPermissions = createTable("element_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	elementId: d
		.integer()
		.notNull()
		.references(() => elements.id),
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

export const elementPermissionsRelations = relations(
	elementPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [elementPermissions.userId],
			references: [users.id],
		}),
		element: one(elements, {
			fields: [elementPermissions.elementId],
			references: [elements.id],
		}),
	}),
);

export type ElementPermissionSchema = InferSelectModel<
	typeof elementPermissions
>;
