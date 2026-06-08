import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import { users } from "../../users";
import { branchPermissions } from "../permissions/branchPermissions";
import { tales } from "../tales";
import { blocks } from "./blocks";
import { paths } from "./paths";

export const branches = createTable("branch", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	parentBranchId: d.integer(),
	name: d.text().notNull(),
	title: d.text(),
	description: d.text(),
	order: d.integer().notNull(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
	tale: one(tales, {
		fields: [branches.taleId],
		references: [tales.id],
	}),
	user: one(users, {
		fields: [branches.creatorId],
		references: [users.id],
	}),
	blocks: many(blocks),
	outgoingPaths: many(paths, {
		relationName: "branch_outgoing_paths",
	}),
	incomingPaths: many(paths, {
		relationName: "branch_incoming_paths",
	}),
	permissions: many(branchPermissions),
}));

export type BranchSchema = InferSelectModel<typeof branches>;
