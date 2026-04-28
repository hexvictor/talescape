import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { tales, users } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";

export const taleProgresses = createTable("tale_progress", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	userId: d
		.text()
		.notNull()
		.references(() => users.id),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	seenBlockIds: d.integer().array().notNull().default([]),
	lastBlockId: d.integer(),
	maxBlockIdReached: d.integer(),
	activePathIds: d.integer().array().notNull().default([]),
	seenPathIds: d.integer().array().notNull().default([]),
	seenBlockProgress: d
		.numeric({ precision: 5, scale: 4 })
		.notNull()
		.default("0"),
	maxReadProgress: d.numeric({ precision: 5, scale: 4 }).notNull().default("0"),
	updatedAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));

export const taleProgressesRelations = relations(taleProgresses, ({ one }) => ({
	user: one(users, {
		fields: [taleProgresses.userId],
		references: [users.id],
	}),
	tale: one(tales, {
		fields: [taleProgresses.taleId],
		references: [tales.id],
	}),
}));

export type TaleProgressSchema = InferSelectModel<typeof taleProgresses>;
