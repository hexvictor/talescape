import { type InferSelectModel, relations, sql } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";
import { users } from "../../users";
import { scenes } from "../layout-structure/scenes";

export const scenePermissions = createTable("scene_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	sceneId: d
		.integer()
		.notNull()
		.references(() => scenes.id),
	userId: d
		.text()
		.notNull()
		.references(() => users.id),
	permissionTypes: d.text().array().notNull().$type<AssetPermissionType[]>(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const scenePermissionsRelations = relations(
	scenePermissions,
	({ one }) => ({
		user: one(users, {
			fields: [scenePermissions.userId],
			references: [users.id],
		}),
		scene: one(scenes, {
			fields: [scenePermissions.sceneId],
			references: [scenes.id],
		}),
	}),
);

export type ScenePermissionSchema = InferSelectModel<typeof scenePermissions>;
