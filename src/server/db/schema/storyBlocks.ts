import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { stories } from "./stories";
import { users } from "./users";
import type {
	StoryBlockSectionType,
	StoryBlockShareability,
} from "../types/storyBlock";

export const storyBlocks = createTable("story_block", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	storyId: d.integer().references(() => stories.id), // Nullable = standalone/shared block
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id), // OWNER

	order: d.integer().notNull(),
	sectionType: d
		.varchar({ length: 32 })
		.notNull()
		.$type<StoryBlockSectionType>(),
	chapterNumber: d.integer(),

	isVisibleInToc: d.boolean().notNull().default(false),
	showInSidebar: d.boolean().notNull().default(false),
	sharable: d
		.varchar({ length: 32 })
		.notNull()
		.default("private")
		.$type<StoryBlockShareability>(),
	cloneable: d
		.varchar({ length: 32 })
		.notNull()
		.default("private")
		.$type<StoryBlockShareability>(),

	data: d.json().notNull(),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const storyBlockRelations = relations(storyBlocks, ({ one }) => ({
	user: one(users, {
		fields: [storyBlocks.userId],
		references: [users.id],
	}),
	story: one(stories, {
		fields: [storyBlocks.storyId],
		references: [stories.id],
	}),
}));
