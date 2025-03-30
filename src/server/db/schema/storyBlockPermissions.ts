import { sql } from "drizzle-orm";
import { createTable } from "../schema-helpers";
import { users } from "./users";
import { storyBlocks } from "./storyBlocks";

type StoryBlockPermissionType =
	| "viewer"
	| "embedder"
	| "collaborator"
	| "cloner";

export const storyBlockPermissions = createTable(
	"story_block_permission",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

		storyBlockId: d
			.integer()
			.notNull()
			.references(() => storyBlocks.id),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),

		permissionTypes: d
			.text()
			.array()
			.notNull()
			.$type<StoryBlockPermissionType[]>(),

		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
);
