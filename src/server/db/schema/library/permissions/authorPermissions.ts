import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";
import { users } from "../../users";
import { authors } from "../authors";

export const authorPermissions = createTable("author_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	authorId: d
		.integer()
		.notNull()
		.references(() => authors.id),
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

export const authorPermissionsRelations = relations(
	authorPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [authorPermissions.userId],
			references: [users.id],
		}),
		author: one(authors, {
			fields: [authorPermissions.authorId],
			references: [authors.id],
		}),
	}),
);

export type AuthorPermissionSchema = InferSelectModel<typeof authorPermissions>;
