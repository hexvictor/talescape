import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { users } from "./users";
import { tales } from "./tales";
import type { TalePermissionType } from "../types/tale";

export const talePermissions = createTable("tale_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id),

	permissionTypes: d.text().array().notNull().$type<TalePermissionType[]>(),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
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
	}),
);
