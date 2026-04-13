import { createTable } from "~/server/db/schema-helpers";
import { images } from "../images";
import { relations, sql } from "drizzle-orm";

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;

export const authors = createTable("author", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	fullName: d.text(),
	firstName: d.text(),
	lastName: d.text(),
	biography: d.text(),
	imageId: d.integer().references(() => images.id, { onDelete: "set null" }),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const authorsRelations = relations(authors, ({ one }) => ({
	image: one(images, {
		fields: [authors.imageId],
		references: [images.id],
	}),
}));
