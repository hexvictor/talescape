import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { users } from "./users";
import { fragments } from "./fragments";
import type { FragmentPermissionType } from "../types/fragment";

export const fragmentPermissions = createTable("fragment_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	fragmentId: d
		.integer()
		.notNull()
		.references(() => fragments.id),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id),

	permissionTypes: d.text().array().notNull().$type<FragmentPermissionType[]>(),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
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
	}),
);
