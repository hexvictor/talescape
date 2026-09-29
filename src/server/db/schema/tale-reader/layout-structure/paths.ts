import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetVisibility } from "~/server/db/types/tale-builder/asset";
import type { PathType } from "~/server/db/types/tale-reader/path";
import { users } from "../../users";
import { pathPermissions } from "../permissions/pathPermissions";
import { tales } from "../tales";
import { branches } from "./branches";
import { scenes } from "./scenes";
import { keyframes } from "./keyframes";

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
	fromSceneId: d.integer().references(() => scenes.id),
	fromKeyframeId: d.integer().references(() => keyframes.id),
	toBranchId: d
		.integer()
		.notNull()
		.references(() => branches.id),
	toSceneId: d.integer().references(() => scenes.id),
	toKeyframeId: d.integer().references(() => keyframes.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	type: d.text().notNull().$type<PathType>(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	label: d.text(),
	description: d.text(),
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
	fromScene: one(scenes, {
		fields: [paths.fromSceneId],
		references: [scenes.id],
	}),
	toScene: one(scenes, {
		fields: [paths.toSceneId],
		references: [scenes.id],
	}),
	fromKeyframe: one(keyframes, {
		fields: [paths.fromKeyframeId],
		references: [keyframes.id],
		relationName: "path_from_step",
	}),
	toKeyframe: one(keyframes, {
		fields: [paths.toKeyframeId],
		references: [keyframes.id],
		relationName: "path_to_step",
	}),
	creator: one(users, {
		fields: [paths.creatorId],
		references: [users.id],
	}),
	permissions: many(pathPermissions),
}));

export type PathSchema = InferSelectModel<typeof paths>;
