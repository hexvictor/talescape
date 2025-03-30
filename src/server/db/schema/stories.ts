import { sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { books } from "./books";

export const stories = createTable("story", (d) => ({
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
