import { text } from "drizzle-orm/pg-core";
import { createTable } from "~/server/db/schema-helpers";

export const userEmails = createTable("userEmail", (d) => ({
  id: d.text().notNull().primaryKey(), // email_address.id from Clerk
  userId: d.text().notNull(), // FK to users.id
  email: d.text().notNull(),
}));
