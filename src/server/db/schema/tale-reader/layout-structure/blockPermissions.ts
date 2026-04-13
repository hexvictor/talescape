import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { createTable } from "~/server/db/schema-helpers";
import { users } from "../../users";
import { blocks } from "./blocks";
import type { AssetPermissionType } from "~/server/db/types/tale-builder/asset";

export const blockPermissions = createTable("block_permission", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

	blockId: d
		.integer()
		.notNull()
		.references(() => blocks.id),
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

export const blockPermissionsRelations = relations(
	blockPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [blockPermissions.userId],
			references: [users.id],
		}),
		block: one(blocks, {
			fields: [blockPermissions.blockId],
			references: [blocks.id],
		}),
	}),
);

export type BlockPermissionSchema = InferSelectModel<typeof blockPermissions>;
