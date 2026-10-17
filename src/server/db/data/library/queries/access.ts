import "server-only";

import { auth } from "@clerk/nextjs/server";
import {
	type AnyColumn,
	type SQL,
	and,
	eq,
	exists,
	or,
	sql,
} from "drizzle-orm";
import { db } from "~/server/db";
import {
	authorPermissions,
	authors,
	bookPermissions,
	books,
	branchPermissions,
	elementPermissions,
	frames,
	pathPermissions,
	scenePermissions,
	talePermissions,
	tales,
	users,
} from "~/server/db/schema";

const readablePermissions = ["viewer", "collaborator", "cloner"] as const;

function inheritedTaleAccess(taleId: AnyColumn, userId: string | null) {
	if (!userId) return undefined;
	return exists(
		db
			.select({ id: tales.id })
			.from(tales)
			.where(
				and(
					sql`${tales.id} = ${taleId}`,
					or(
						eq(tales.creatorId, userId),
						exists(
							db
								.select({ id: talePermissions.id })
								.from(talePermissions)
								.where(
									and(
										eq(talePermissions.taleId, tales.id),
										eq(talePermissions.userId, userId),
										readablePermissionOverlap(talePermissions.permissionTypes),
									),
								),
						),
					),
				),
			),
	);
}

export function editableTaleExpression(userId: string | null) {
	if (!userId) return sql<boolean>`false`;
	return sql<boolean>`${tales.editable} AND (${tales.creatorId} = ${userId} OR EXISTS (
		SELECT 1 FROM ${talePermissions} WHERE ${talePermissions.taleId} = ${tales.id}
		AND ${talePermissions.userId} = ${userId}
		AND ${talePermissions.permissionTypes} && ARRAY['collaborator']::text[]
	))`;
}

export function frameAccessCondition(userId: string | null) {
	return or(
		eq(frames.visibility, "public"),
		userId ? eq(frames.creatorId, userId) : undefined,
		inheritedTaleAccess(frames.taleId, userId),
	);
}

type PermissionRecord = {
	permissionTypes: readonly string[];
};

export async function getSignedInLibraryUser() {
	const { userId } = await auth();

	if (!userId) {
		return { userId: null, user: null };
	}

	const user = await db.query.users.findFirst({
		where: (model, { eq }) => eq(model.id, userId),
		columns: {
			id: true,
			username: true,
			fullName: true,
			imageUrl: true,
			role: true,
			isVerified: true,
		},
	});

	return { userId, user: user ?? null };
}

export function taleAccessCondition(userId: string | null) {
	return or(
		eq(tales.visibility, "public"),
		userId ? eq(tales.creatorId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: talePermissions.id })
						.from(talePermissions)
						.where(
							and(
								eq(talePermissions.taleId, tales.id),
								eq(talePermissions.userId, userId),
								readablePermissionOverlap(talePermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function visibleTaleByIdCondition(
	taleIdColumn: AnyColumn,
	userId: string | null,
) {
	return exists(
		db
			.select({ id: tales.id })
			.from(tales)
			.where(
				and(sql`${tales.id} = ${taleIdColumn}`, taleAccessCondition(userId)),
			),
	);
}

export function branchAccessCondition(
	branchIdColumn: AnyColumn,
	asset: {
		isOfficial: AnyColumn;
		visibility: AnyColumn;
		creatorId: AnyColumn;
	},
	userId: string | null,
) {
	return or(
		eq(asset.visibility, "public"),
		userId ? eq(asset.creatorId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: branchPermissions.id })
						.from(branchPermissions)
						.where(
							and(
								sql`${branchPermissions.branchId} = ${branchIdColumn}`,
								eq(branchPermissions.userId, userId),
								readablePermissionOverlap(branchPermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function blockAccessCondition(
	sceneIdColumn: AnyColumn,
	asset: {
		isOfficial: AnyColumn;
		visibility: AnyColumn;
		creatorId: AnyColumn;
		taleId?: AnyColumn;
	},
	userId: string | null,
) {
	return or(
		eq(asset.visibility, "public"),
		userId ? eq(asset.creatorId, userId) : undefined,
		asset.taleId ? inheritedTaleAccess(asset.taleId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: scenePermissions.id })
						.from(scenePermissions)
						.where(
							and(
								sql`${scenePermissions.sceneId} = ${sceneIdColumn}`,
								eq(scenePermissions.userId, userId),
								readablePermissionOverlap(scenePermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function fragmentAccessCondition(
	elementIdColumn: AnyColumn,
	asset: {
		isOfficial: AnyColumn;
		visibility: AnyColumn;
		creatorId: AnyColumn;
		taleId?: AnyColumn;
	},
	userId: string | null,
) {
	return or(
		eq(asset.visibility, "public"),
		userId ? eq(asset.creatorId, userId) : undefined,
		asset.taleId ? inheritedTaleAccess(asset.taleId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: elementPermissions.id })
						.from(elementPermissions)
						.where(
							and(
								sql`${elementPermissions.elementId} = ${elementIdColumn}`,
								eq(elementPermissions.userId, userId),
								readablePermissionOverlap(elementPermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function pathAccessCondition(
	pathIdColumn: AnyColumn,
	asset: {
		isOfficial: AnyColumn;
		visibility: AnyColumn;
		creatorId: AnyColumn;
	},
	userId: string | null,
) {
	return or(
		eq(asset.visibility, "public"),
		userId ? eq(asset.creatorId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: pathPermissions.id })
						.from(pathPermissions)
						.where(
							and(
								sql`${pathPermissions.pathId} = ${pathIdColumn}`,
								eq(pathPermissions.userId, userId),
								readablePermissionOverlap(pathPermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function bookAccessCondition(userId: string | null) {
	return or(
		eq(books.visibility, "public"),
		userId ? eq(books.creatorId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: bookPermissions.id })
						.from(bookPermissions)
						.where(
							and(
								eq(bookPermissions.bookId, books.id),
								eq(bookPermissions.userId, userId),
								readablePermissionOverlap(bookPermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function authorAccessCondition(userId: string | null) {
	return or(
		eq(authors.visibility, "public"),
		userId ? eq(authors.creatorId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: authorPermissions.id })
						.from(authorPermissions)
						.where(
							and(
								eq(authorPermissions.authorId, authors.id),
								eq(authorPermissions.userId, userId),
								readablePermissionOverlap(authorPermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function getAccessLabel(
	tale: {
		isOfficial: boolean;
		visibility: string;
		creatorId: string | null;
		permissions?: PermissionRecord[];
		isShared?: boolean;
	},
	userId: string | null,
) {
	if (tale.isOfficial) return "Official";
	if (userId !== null && tale.creatorId === userId) return "Yours";
	if (tale.visibility === "public") return "Public";
	if (tale.isShared || hasReadablePermission(tale.permissions ?? [])) {
		return "Shared";
	}
	return "Private";
}

function hasReadablePermission(permissions: PermissionRecord[]) {
	return permissions.some((permission) =>
		permission.permissionTypes.some((type) =>
			readablePermissions.includes(
				type as (typeof readablePermissions)[number],
			),
		),
	);
}

function readablePermissionOverlap(permissionTypes: AnyColumn): SQL {
	return sql`${permissionTypes} && ARRAY['viewer', 'collaborator', 'cloner']::text[]`;
}
