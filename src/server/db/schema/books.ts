import { createTable } from "../schema-helpers";
import { sql } from "drizzle-orm";
import { users } from "./users";

type BookType = "official" | "user";
type BookStatus = "draft" | "published" | "private";

export const books = createTable("book", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	title: d.varchar({ length: 255 }).notNull(),
	description: d.text(),
	coverImageUrl: d.varchar({ length: 1024 }),

	type: d.varchar({ length: 32 }).notNull().default("user").$type<BookType>(),

	userId: d.varchar({ length: 255 }).references(() => users.id), // null if official

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
