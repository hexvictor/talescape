import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { tales } from "./tales";
import { users } from "./users";
import type { FragmentType, FragmentShareability } from "../types/fragment";

export const fragments = createTable("fragment", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	taleId: d.integer().references(() => tales.id), // Nullable = standalone/shared block
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id), // OWNER

	order: d.integer().notNull(),
	type: d.varchar({ length: 32 }).notNull().$type<FragmentType>(),
	chapterNumber: d.integer(),

	isVisibleInToc: d.boolean().notNull().default(false),
	showInSidebar: d.boolean().notNull().default(false),
	sharable: d
		.varchar({ length: 32 })
		.notNull()
		.default("private")
		.$type<FragmentShareability>(),
	cloneable: d
		.varchar({ length: 32 })
		.notNull()
		.default("private")
		.$type<FragmentShareability>(),

	data: d.json().notNull(),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const fragmentsRelations = relations(fragments, ({ one }) => ({
	user: one(users, {
		fields: [fragments.userId],
		references: [users.id],
	}),
	tale: one(tales, {
		fields: [fragments.taleId],
		references: [tales.id],
	}),
}));
