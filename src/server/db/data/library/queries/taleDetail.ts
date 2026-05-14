import "server-only";

import { db } from "~/server/db";
import { getAccessLabel, getSignedInLibraryUser } from "./access";

const readablePermissions = ["viewer", "collaborator", "cloner"] as const;

type PermissionRecord = {
	permissionTypes: readonly string[];
};

export async function getLibraryTaleDetail(taleId: number) {
	const { userId } = await getSignedInLibraryUser();
	const tale = await db.query.tales.findFirst({
		where: (model, { eq }) => eq(model.id, taleId),
		with: {
			book: true,
			creatorById: true,
			permissions: true,
			branches: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					permissions: true,
				},
			},
			sections: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					branch: true,
					permissions: true,
				},
			},
			blocks: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					section: {
						with: {
							branch: true,
						},
					},
					entry: true,
					part: true,
					page: true,
					permissions: true,
				},
			},
			fragments: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					block: true,
					permissions: true,
				},
			},
			paths: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					fromBranch: true,
					toBranch: true,
					permissions: true,
				},
			},
			parts: {
				orderBy: (model, { asc }) => [asc(model.index)],
			},
			entries: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					part: true,
				},
			},
			pages: {
				orderBy: (model, { asc }) => [asc(model.index)],
				with: {
					part: true,
					entry: true,
				},
			},
		},
	});

	if (!tale || !canViewTale(tale, userId)) {
		return null;
	}

	const {
		branches: branchRecords,
		sections: sectionRecords,
		blocks: blockRecords,
		fragments: fragmentRecords,
		paths: pathRecords,
		parts,
		entries,
		pages,
		...taleRecord
	} = tale;

	const branches = branchRecords.filter((branch) =>
		canViewAsset(branch, userId),
	);
	const sections = sectionRecords.filter((section) =>
		canViewAsset(section, userId),
	);
	const blocks = blockRecords.filter((block) => canViewAsset(block, userId));
	const fragments = fragmentRecords.filter((fragment) =>
		canViewAsset(fragment, userId),
	);
	const paths = pathRecords.filter((path) => canViewPath(path, userId));

	return {
		tale: {
			...taleRecord,
			accessLabel: getAccessLabel(tale, userId),
			nodeCounts: {
				branches: branches.length,
				sections: sections.length,
				blocks: blocks.length,
				fragments: fragments.length,
				paths: paths.length,
				parts: parts.length,
				entries: entries.length,
				pages: pages.length,
			},
		},
		branches,
		sections,
		blocks,
		fragments,
		paths,
		parts,
		entries,
		pages,
	};
}

export type LibraryTaleDetail = NonNullable<
	Awaited<ReturnType<typeof getLibraryTaleDetail>>
>;

function canViewTale(
	tale: {
		isOfficial: boolean;
		visibility: string;
		creatorId: string;
		permissions: PermissionRecord[];
	},
	userId: string | null,
) {
	return (
		tale.isOfficial ||
		tale.visibility === "public" ||
		(userId !== null && tale.creatorId === userId) ||
		(userId !== null && hasReadablePermission(tale.permissions))
	);
}

function canViewAsset(
	asset: {
		isOfficial: boolean;
		visibility: string;
		creatorId: string;
		permissions: PermissionRecord[];
	},
	userId: string | null,
) {
	return (
		asset.isOfficial ||
		asset.visibility === "public" ||
		(userId !== null && asset.creatorId === userId) ||
		(userId !== null && hasReadablePermission(asset.permissions))
	);
}

function canViewPath(
	path: {
		isOfficial: boolean;
		visibility: string;
		creatorId: string;
		permissions: PermissionRecord[];
	},
	userId: string | null,
) {
	return (
		path.isOfficial ||
		path.visibility === "public" ||
		(userId !== null && path.creatorId === userId) ||
		(userId !== null && hasReadablePermission(path.permissions))
	);
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
