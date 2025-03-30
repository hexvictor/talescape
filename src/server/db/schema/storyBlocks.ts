import { sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { stories } from "./stories";
import { users } from "./users";

type SectionType =
	| "text"
	| "image"
	| "chapter"
	| "segment"
	| "divider"
	| "transition"
	| "codex-entry";
type Shareability = "private" | "public" | "shared";

export const storyBlocks = createTable("story_block", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	storyId: d.integer().references(() => stories.id), // Nullable = standalone/shared block
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id), // OWNER

	order: d.integer().notNull(),
	sectionType: d.varchar({ length: 32 }).notNull().$type<SectionType>(),
	chapterNumber: d.integer(),

	isVisibleInToc: d.boolean().notNull().default(false),
	showInSidebar: d.boolean().notNull().default(false),
	sharable: d
		.varchar({ length: 32 })
		.notNull()
		.default("private")
		.$type<Shareability>(),
	cloneable: d
		.varchar({ length: 32 })
		.notNull()
		.default("private")
		.$type<Shareability>(),

	data: d.json().notNull(),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));
