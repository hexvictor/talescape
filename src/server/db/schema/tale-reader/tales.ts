import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
	blocks,
	books,
	branches,
	entries,
	fragments,
	pages,
	parts,
	paths,
	sections,
	talePermissions,
	taleProgresses,
	users,
} from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetStatus,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type { TaleType } from "~/server/db/types/tale-reader/tale";

export const tales = createTable("tale", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	bookId: d.integer().references(() => books.id),
	title: d.text().notNull(),
	slug: d.text().notNull(),
	description: d.text().notNull(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("public"),
	status: d.text().notNull().$type<AssetStatus>().default("draft"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	type: d.text().notNull().$type<TaleType>(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const talesRelations = relations(tales, ({ one, many }) => ({
	creatorById: one(users, {
		fields: [tales.creatorId],
		references: [users.id],
	}),
	book: one(books, {
		fields: [tales.bookId],
		references: [books.id],
	}),
	parts: many(parts),
	entries: many(entries),
	pages: many(pages),
	branches: many(branches),
	paths: many(paths),
	sections: many(sections),
	blocks: many(blocks),
	fragments: many(fragments),
	permissions: many(talePermissions),
	progresses: many(taleProgresses),
}));

export type TaleSchema = InferSelectModel<typeof tales>;
