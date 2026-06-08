import { relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetVisibility } from "~/server/db/types/tale-builder/asset";
import { images } from "../images";
import { users } from "../users";
import { type Author, authors } from "./authors";
import { bookPermissions } from "./permissions/bookPermissions";

export type BookType = "official" | "user";
export type BookStatus =
	| "draft"
	| "published"
	| "private"
	| "archived"
	| "deleted";

export type Book = typeof books.$inferSelect;
export type BookWithAuthor = Book & {
	author: Author | null;
};
export type NewBook = typeof books.$inferInsert;

export const books = createTable("book", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	title: d.text().notNull(),
	authorId: d.integer().references(() => authors.id),
	description: d.text(),
	coverImageId: d
		.integer()
		.references(() => images.id, { onDelete: "set null" }),

	type: d.text().notNull().default("user").$type<BookType>(),

	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),

	status: d.text().notNull().default("draft").$type<BookStatus>(),
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

export const booksRelations = relations(books, ({ one, many }) => ({
	author: one(authors, {
		fields: [books.authorId],
		references: [authors.id],
	}),
	creator: one(users, {
		fields: [books.creatorId],
		references: [users.id],
	}),
	coverImage: one(images, {
		fields: [books.coverImageId],
		references: [images.id],
	}),
	permissions: many(bookPermissions),
}));
