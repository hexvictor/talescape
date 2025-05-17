import { sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { index } from "drizzle-orm/pg-core";

export const users = createTable("user", (d) => ({
	id: d.varchar({ length: 255 }).notNull().primaryKey(), // Clerk user ID
	username: d.varchar({ length: 255 }),
	firstName: d.varchar({ length: 255 }),
	lastName: d.varchar({ length: 255 }),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d.timestamp({ withTimezone: true }),
	image: d.varchar({ length: 1024 }),
}));
