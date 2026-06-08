import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type { PathPermissionType } from "~/server/db/types/tale-reader/path";
import { users } from "../../users";
import { paths } from "../layout-structure/paths";

export const pathPermissions = createTable("path_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	pathId: d
		.integer()
		.notNull()
		.references(() => paths.id),
	userId: d
		.text()
		.notNull()
		.references(() => users.id),
	permissionTypes: d.text().array().notNull().$type<PathPermissionType[]>(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const pathPermissionsRelations = relations(
	pathPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [pathPermissions.userId],
			references: [users.id],
		}),
		path: one(paths, {
			fields: [pathPermissions.pathId],
			references: [paths.id],
		}),
	}),
);

export type PathPermissionSchema = InferSelectModel<typeof pathPermissions>;
