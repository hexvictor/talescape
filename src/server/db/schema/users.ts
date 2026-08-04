import { timestamp } from "drizzle-orm/pg-core";
import { createTable } from "~/server/db/schema-helpers";

export type UserRole = "member" | "administrator";

export const users = createTable("user", (d) => ({
	id: d.text().notNull().primaryKey(), // Clerk user ID
	username: d.text().notNull().unique(),
	firstName: d.text().notNull(),
	lastName: d.text().notNull(),
	fullName: d.text().notNull(),
	primaryEmailId: d.text(), // ID from Clerk email_addresses
	emailVerifiedAt: timestamp({ withTimezone: true }),
	imageUrl: d.text(),
	role: d.text().notNull().$type<UserRole>().default("member"),
	isVerified: d.boolean().notNull().default(false),
}));
