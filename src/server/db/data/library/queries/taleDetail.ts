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
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					permissions: true,
				},
			},
			blocks: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					branch: true,
					page: {
						with: {
							entry: true,
							part: true,
						},
					},
					permissions: true,
				},
			},
			fragments: {
				orderBy: (model, { asc }) => [asc(model.order)],
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
				orderBy: (model, { asc }) => [asc(model.order)],
			},
			entries: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					part: true,
				},
			},
			pages: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					part: true,
					entry: true,
				},
			},
		},
	});

	if (!tale || !canViewResource(tale, userId)) {
		return null;
	}

	const {
		branches: branchRecords,
		blocks: blockRecords,
		fragments: fragmentRecords,
		paths: pathRecords,
		parts,
		entries,
		pages,
		...taleRecord
	} = tale;

	const branches = branchRecords
		.filter((branch) => canViewResource(branch, userId))
		.map((branch) => ({ ...branch, index: branch.order }));
	const blocks = blockRecords
		.filter((block) => canViewResource(block, userId))
		.map((block) => ({
			...block,
			index: block.order,
			page: { ...block.page, index: block.page.order },
			entry: block.page.entry,
			entryId: block.page.entryId,
			part: block.page.part,
			partId: block.page.partId,
		}));
	const fragments = fragmentRecords
		.filter((fragment) => canViewResource(fragment, userId))
		.map((fragment) => ({
			...fragment,
			block: fragment.block
				? { ...fragment.block, index: fragment.block.order }
				: fragment.block,
			index: fragment.order,
		}));
	const paths = pathRecords.filter((path) => canViewResource(path, userId));

	return {
		tale: {
			...taleRecord,
			accessLabel: getAccessLabel(tale, userId),
			nodeCounts: {
				branches: branches.length,
				blocks: blocks.length,
				fragments: fragments.length,
				paths: paths.length,
				parts: parts.length,
				entries: entries.length,
				pages: pages.length,
			},
		},
		branches,
		blocks,
		fragments,
		paths,
		parts: parts.map((part) => ({ ...part, index: part.order })),
		entries: entries.map((entry) => ({ ...entry, index: entry.order })),
		pages: pages.map((page) => ({ ...page, index: page.order })),
	};
}

export type LibraryTaleDetail = NonNullable<
	Awaited<ReturnType<typeof getLibraryTaleDetail>>
>;

/**
 * Checks shared visibility and permission rules for a library resource.
 *
 * @param resource - Tale or reader asset with access metadata.
 * @param userId - Signed-in user id, when available.
 * @returns Whether the resource can be shown.
 */
function canViewResource(
	resource: {
		isOfficial: boolean;
		visibility: string;
		creatorId: string;
		permissions: PermissionRecord[];
	},
	userId: string | null,
) {
	return (
		resource.isOfficial ||
		resource.visibility === "public" ||
		(userId !== null && resource.creatorId === userId) ||
		(userId !== null && hasReadablePermission(resource.permissions))
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
