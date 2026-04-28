import { timestamp } from "drizzle-orm/pg-core";
import { createTable } from "~/server/db/schema-helpers";

export const users = createTable("user", (d) => ({
	id: d.text().notNull().primaryKey(), // Clerk user ID
	username: d.text().notNull().unique(),
	firstName: d.text().notNull(),
	lastName: d.text().notNull(),
	fullName: d.text().notNull(),
	primaryEmailId: d.text(), // ID from Clerk email_addresses
	emailVerifiedAt: timestamp({ withTimezone: true }),
	imageUrl: d.text(),
}));
