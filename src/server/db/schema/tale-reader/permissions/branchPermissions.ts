import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { branches, users } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";

export const branchPermissions = createTable("branch_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	branchId: d
		.integer()
		.notNull()
		.references(() => branches.id),
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

export const branchPermissionsRelations = relations(
	branchPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [branchPermissions.userId],
			references: [users.id],
		}),
		branch: one(branches, {
			fields: [branchPermissions.branchId],
			references: [branches.id],
		}),
	}),
);

export type BranchPermissionSchema = InferSelectModel<typeof branchPermissions>;
