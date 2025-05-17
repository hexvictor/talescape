import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { books } from "./books";

export const tales = createTable("tale", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	title: d.varchar({ length: 255 }).notNull(),
	bookId: d.integer().references(() => books.id),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id), // OWNER
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const talesRelations = relations(tales, ({ one }) => ({
	user: one(users, {
		fields: [tales.userId],
		references: [users.id],
	}),
	book: one(books, {
		fields: [tales.bookId],
		references: [books.id],
	}),
}));
