import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { blocks, fragmentPermissions, tales, users } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	FragmentData,
	FragmentType,
} from "~/server/db/types/tale-reader/fragment";

export const fragments = createTable("fragment", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	blockId: d
		.integer()
		.notNull()
		.references(() => blocks.id),
	creatorId: d.text().references(() => users.id),
	type: d.text().notNull().$type<FragmentType>(),
	isOfficial: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	index: d.integer().notNull(),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	data: d.json().notNull().$type<FragmentData>(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const fragmentsRelations = relations(fragments, ({ one, many }) => ({
	tale: one(tales, {
		fields: [fragments.taleId],
		references: [tales.id],
	}),
	block: one(blocks, {
		fields: [fragments.blockId],
		references: [blocks.id],
	}),
	user: one(users, {
		fields: [fragments.creatorId],
		references: [users.id],
	}),
	permissions: many(fragmentPermissions),
}));

export type FragmentSchema = InferSelectModel<typeof fragments>;
