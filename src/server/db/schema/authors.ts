import { sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { index } from "drizzle-orm/pg-core";

export type Author = typeof authors.$inferSelect;

export const authors = createTable("author", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	firstName: d.varchar({ length: 255 }),
	lastName: d.varchar({ length: 255 }),
	name: d.varchar({ length: 255 }),
	biography: d.text(),
	image: d.varchar({ length: 1024 }),
}));
