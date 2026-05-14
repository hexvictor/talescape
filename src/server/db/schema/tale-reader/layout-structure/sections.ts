import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
	blocks,
	branches,
	sectionPermissions,
	tales,
	users,
} from "~/server/db/schema";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	SectionDirection,
	SectionInputMode,
	SectionOrientation,
} from "~/server/db/types/tale-reader/section";

export const sections = createTable("section", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	taleId: d
		.integer()
		.notNull()
		.references(() => tales.id),
	branchId: d
		.integer()
		.notNull()
		.references(() => branches.id),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	orientation: d
		.text()
		.notNull()
		.$type<SectionOrientation>()
		.default("vertical"),
	direction: d.text().notNull().$type<SectionDirection>().default("down"),
	inputMode: d.text().array().notNull().$type<SectionInputMode[]>(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	isSnap: d.boolean().notNull().default(false),
	index: d.integer().notNull(),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
	tale: one(tales, {
		fields: [sections.taleId],
		references: [tales.id],
	}),
	branch: one(branches, {
		fields: [sections.branchId],
		references: [branches.id],
	}),
	user: one(users, {
		fields: [sections.creatorId],
		references: [users.id],
	}),
	blocks: many(blocks),
	permissions: many(sectionPermissions),
}));

export type SectionSchema = InferSelectModel<typeof sections>;
