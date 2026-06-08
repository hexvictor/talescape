import { relations, sql } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";
import { createTable } from "~/server/db/schema-helpers";
import { users } from "./users";

export const images = createTable(
	"image",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		url: d.varchar({ length: 1024 }).notNull(),
		userId: d.varchar({ length: 255 }).references(() => users.id),
		isOfficial: d.boolean().notNull().default(false),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("name_idx").on(t.name)],
);

export const imagesRelations = relations(images, ({ one }) => ({
	user: one(users, {
		fields: [images.userId],
		references: [users.id],
	}),
}));
