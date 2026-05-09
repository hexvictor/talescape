import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { branches, pathPermissions, tales } from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetVisibility } from "~/server/db/types/tale-builder/asset";
import type { PathType } from "~/server/db/types/tale-reader/path";

export const paths = createTable("path", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	fromBranchId: d
		.integer()
		.notNull()
		.references(() => branches.id),
	toBranchId: d
		.integer()
		.notNull()
		.references(() => branches.id),
	type: d.text().notNull().$type<PathType>(),
	isOfficial: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	label: d.text(),
	order: d.integer().notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const pathsRelations = relations(paths, ({ one, many }) => ({
	tale: one(tales, {
		fields: [paths.taleId],
		references: [tales.id],
	}),
	fromBranch: one(branches, {
		fields: [paths.fromBranchId],
		references: [branches.id],
		relationName: "branch_outgoing_paths",
	}),
	toBranch: one(branches, {
		fields: [paths.toBranchId],
		references: [branches.id],
		relationName: "branch_incoming_paths",
	}),
	permissions: many(pathPermissions),
}));

export type PathSchema = InferSelectModel<typeof paths>;
