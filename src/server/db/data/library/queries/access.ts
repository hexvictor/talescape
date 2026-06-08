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
	blockPermissions,
	bookPermissions,
	books,
	branchPermissions,
	fragmentPermissions,
	pathPermissions,
	talePermissions,
	tales,
	users,
} from "~/server/db/schema";

const readablePermissions = ["viewer", "collaborator", "cloner"] as const;

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
		eq(tales.isOfficial, true),
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
		eq(asset.isOfficial, true),
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
	blockIdColumn: AnyColumn,
	asset: {
		isOfficial: AnyColumn;
		visibility: AnyColumn;
		creatorId: AnyColumn;
	},
	userId: string | null,
) {
	return or(
		eq(asset.isOfficial, true),
		eq(asset.visibility, "public"),
		userId ? eq(asset.creatorId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: blockPermissions.id })
						.from(blockPermissions)
						.where(
							and(
								sql`${blockPermissions.blockId} = ${blockIdColumn}`,
								eq(blockPermissions.userId, userId),
								readablePermissionOverlap(blockPermissions.permissionTypes),
							),
						),
				)
			: undefined,
	);
}

export function fragmentAccessCondition(
	fragmentIdColumn: AnyColumn,
	asset: {
		isOfficial: AnyColumn;
		visibility: AnyColumn;
		creatorId: AnyColumn;
	},
	userId: string | null,
) {
	return or(
		eq(asset.isOfficial, true),
		eq(asset.visibility, "public"),
		userId ? eq(asset.creatorId, userId) : undefined,
		userId
			? exists(
					db
						.select({ id: fragmentPermissions.id })
						.from(fragmentPermissions)
						.where(
							and(
								sql`${fragmentPermissions.fragmentId} = ${fragmentIdColumn}`,
								eq(fragmentPermissions.userId, userId),
								readablePermissionOverlap(fragmentPermissions.permissionTypes),
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
		eq(asset.isOfficial, true),
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
		eq(books.isOfficial, true),
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
		eq(authors.isOfficial, true),
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
