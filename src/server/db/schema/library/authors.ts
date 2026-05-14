import { relations, sql } from "drizzle-orm";
import { authorPermissions, images, users } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetVisibility } from "~/server/db/types/tale-builder/asset";

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;

export const authors = createTable("author", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	fullName: d.text(),
	firstName: d.text(),
	lastName: d.text(),
	biography: d.text(),
	imageId: d.integer().references(() => images.id, { onDelete: "set null" }),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const authorsRelations = relations(authors, ({ one, many }) => ({
	creator: one(users, {
		fields: [authors.creatorId],
		references: [users.id],
	}),
	image: one(images, {
		fields: [authors.imageId],
		references: [images.id],
	}),
	permissions: many(authorPermissions),
}));
