import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { users } from "./users";
import { stories } from "./stories";
import type { StoryPermissionType } from "../types/story";

export const storyPermissions = createTable("story_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	storyId: d
		.integer()
		.notNull()
		.references(() => stories.id),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id),

	permissionTypes: d.text().array().notNull().$type<StoryPermissionType[]>(),

	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));

export const storyPermissionsRelations = relations(
	storyPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [storyPermissions.userId],
			references: [users.id],
		}),
		story: one(stories, {
			fields: [storyPermissions.storyId],
			references: [stories.id],
		}),
	}),
);
