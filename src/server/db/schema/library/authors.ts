import { createTable } from "~/server/db/schema-helpers";

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;

export const authors = createTable("author", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  fullName: d.text(),
  firstName: d.text(),
  lastName: d.text(),
  biography: d.text(),
  imageUrl: d.text(),
}));
