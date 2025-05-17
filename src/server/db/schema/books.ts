import { createTable } from "../schema-helpers";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { authors, type Author } from "./authors";
import type { BookStatus, BookType } from "../types/book";

export type Book = typeof books.$inferSelect;
export type BookWithAuthor = Book & {
	author: Author | null;
};
export type NewBook = typeof books.$inferInsert;

export const books = createTable("book", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	title: d.varchar({ length: 255 }).notNull(),
	authorId: d.integer().references(() => authors.id),
	description: d.text(),
	coverImageUrl: d.varchar({ length: 1024 }),

	type: d.varchar({ length: 32 }).notNull().default("user").$type<BookType>(),

	userId: d.varchar({ length: 255 }).references(() => users.id), // may be null if official

	status: d
		.varchar({ length: 32 })
		.notNull()
		.default("draft")
		.$type<BookStatus>(),

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
}));
