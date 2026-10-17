import "server-only";

import { db } from "~/server/db";
import { getAccessLabel, getSignedInLibraryUser } from "./access";
import {
	canEditLibraryResource,
	canReadLibraryResource as canViewResource,
} from "./permissions";

export async function getLibraryTaleDetail(taleId: number) {
	const { userId } = await getSignedInLibraryUser();
	const tale = await db.query.tales.findFirst({
		where: (model, { eq }) => eq(model.id, taleId),
		with: {
			book: true,
			creatorById: true,
			permissions: { where: (model, { eq }) => eq(model.userId, userId ?? "") },
			branches: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					permissions: {
						where: (model, { eq }) => eq(model.userId, userId ?? ""),
					},
				},
			},
			scenes: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					branch: true,
					keyframes: {
						orderBy: (model, { asc }) => [asc(model.order)],
						with: {
							page: {
								with: {
									entry: true,
									part: true,
								},
							},
						},
					},
					permissions: {
						where: (model, { eq }) => eq(model.userId, userId ?? ""),
					},
				},
			},
			elements: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					scene: true,
					permissions: {
						where: (model, { eq }) => eq(model.userId, userId ?? ""),
					},
				},
			},
			paths: {
				orderBy: (model, { asc }) => [asc(model.order)],
				with: {
					fromBranch: true,
					toBranch: true,
					permissions: {
						where: (model, { eq }) => eq(model.userId, userId ?? ""),
					},
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
		scenes: sceneRecords,
		elements: elementRecords,
		paths: pathRecords,
		parts,
		entries,
		pages,
		...taleRecord
	} = tale;
	const canViewContents = canViewResource(
		{ ...tale, visibility: "private" },
		userId,
	);

	const branches = branchRecords
		.filter((branch) => canViewContents || canViewResource(branch, userId))
		.map((branch) => ({ ...branch, index: branch.order }));
	const scenes = sceneRecords
		.filter((scene) => canViewContents || canViewResource(scene, userId))
		.map((scene) => {
			const page = scene.keyframes.find((keyframe) => keyframe.page)?.page;
			return {
				...scene,
				index: scene.order,
				page: page ? { ...page, index: page.order } : null,
				entry: page?.entry ?? null,
				entryId: page?.entryId ?? null,
				part: page?.part ?? null,
				partId: page?.partId ?? null,
			};
		});
	const elements = elementRecords
		.filter((element) => canViewContents || canViewResource(element, userId))
		.map((element) => ({
			...element,
			scene: element.scene
				? { ...element.scene, index: element.scene.order }
				: element.scene,
			index: element.order,
		}));
	const paths = pathRecords.filter(
		(path) => canViewContents || canViewResource(path, userId),
	);

	return {
		tale: {
			...taleRecord,
			canEdit: canEditLibraryResource(tale, userId),
			accessLabel: getAccessLabel(tale, userId),
			nodeCounts: {
				branches: branches.length,
				scenes: scenes.length,
				elements: elements.length,
				paths: paths.length,
				parts: parts.length,
				entries: entries.length,
				pages: pages.length,
			},
		},
		branches,
		scenes,
		elements,
		paths,
		parts: parts.map((part) => ({ ...part, index: part.order })),
		entries: entries.map((entry) => ({ ...entry, index: entry.order })),
		pages: pages.map((page) => ({ ...page, index: page.order })),
	};
}

export type LibraryTaleDetail = NonNullable<
	Awaited<ReturnType<typeof getLibraryTaleDetail>>
>;
