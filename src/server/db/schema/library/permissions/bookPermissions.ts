import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { books, users } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";

export const bookPermissions = createTable("book_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	bookId: d
		.integer()
		.notNull()
		.references(() => books.id),
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

export const bookPermissionsRelations = relations(
	bookPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [bookPermissions.userId],
			references: [users.id],
		}),
		book: one(books, {
			fields: [bookPermissions.bookId],
			references: [books.id],
		}),
	}),
);

export type BookPermissionSchema = InferSelectModel<typeof bookPermissions>;
