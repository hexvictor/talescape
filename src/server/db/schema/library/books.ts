import { relations, sql } from "drizzle-orm";
import type { BookStatus, BookType } from "~/features/library/types/book";
import { type Author, authors, images, users } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";

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

	userId: d.text().references(() => users.id), // may be null if official

	status: d.text().notNull().default("draft").$type<BookStatus>(),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const booksRelations = relations(books, ({ one }) => ({
	author: one(authors, {
		fields: [books.authorId],
		references: [authors.id],
	}),
	user: one(users, {
		fields: [books.userId],
		references: [users.id],
	}),
	coverImage: one(images, {
		fields: [books.coverImageId],
		references: [images.id],
	}),
}));
