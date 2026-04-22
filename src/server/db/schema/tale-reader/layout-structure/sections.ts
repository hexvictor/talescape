import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetStatus,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type {
	SectionDirection,
	SectionInputMode,
	SectionOrientation,
} from "~/server/db/types/tale-reader/section";
import { users } from "../../users";

export const sections = createTable("section", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	creatorId: d.text().references(() => users.id),
	orientation: d
		.text()
		.notNull()
		.$type<SectionOrientation>()
		.default("vertical"),
	direction: d.text().notNull().$type<SectionDirection>().default("down"),
	inputMode: d.text().array().notNull().$type<SectionInputMode[]>(),
	isOfficial: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("private"),
	embeddable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	status: d.text().notNull().$type<AssetStatus>().default("draft"),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const sectionsRelations = relations(sections, ({ one }) => ({
	user: one(users, {
		fields: [sections.creatorId],
		references: [users.id],
	}),
}));

export type SectionSchema = InferSelectModel<typeof sections>;
