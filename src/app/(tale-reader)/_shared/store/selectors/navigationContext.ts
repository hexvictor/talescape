import type { Block } from "~/server/db/data/tale-reader/types/blocks";
import type { Branch } from "~/server/db/data/tale-reader/types/branches";
import type { Page } from "~/server/db/data/tale-reader/types/pages";
import type { Path } from "~/server/db/data/tale-reader/types/paths";
import type { TaleContent } from "~/server/db/data/tale-reader/types/tales";
import type {
	NavigationBlockBoundaries,
	NavigationContext,
	NavigationEntityPosition,
	NavigationPagePosition,
	NavigationPathContext,
} from "../types/navigation";

export function createNavigationContext({
	activePathIds,
	block,
	content,
}: {
	activePathIds: number[];
	block: Block;
	content: TaleContent;
}): NavigationContext {
	const branchIds = collectActiveBranchIds(content, activePathIds);
	const activeBranches = Object.values(content.indexMap.branchesById)
		.filter((branch): branch is Branch => !!branch)
		.filter((branch) => branchIds.has(branch.id))
		.sort((a, b) => a.position.index - b.position.index);
	const activeBlocks = Object.values(content.indexMap.blocksById)
		.filter((candidate): candidate is Block => !!candidate)
		.filter((candidate) => branchIds.has(candidate.branchId))
		.sort((a, b) => a.position.index - b.position.index);
	const activeSections = collectUniquePositioned(
		activeBlocks,
		(item) => item.section,
	);
	const activeParts = collectUniquePositioned(
		activeBlocks,
		(item) => item.part,
	);
	const activeEntries = collectUniquePositioned(
		activeBlocks,
		(item) => item.entry,
	);
	const activePages = collectEffectivePages(activeBlocks);
	const activePaginatedPages = activePages.filter((page) => page.isPaginated);
	const effectivePage = getEffectivePageFromBlocks(activeBlocks, block.id);

	return {
		block: getEntityPosition(activeBlocks, block.id),
		blockBoundaries: getBlockBoundaries(activeBlocks, block),
		branch: getEntityPosition(activeBranches, block.branch.id),
		section: getEntityPosition(activeSections, block.section.id),
		part: getEntityPosition(activeParts, block.part.id),
		entry: getEntityPosition(activeEntries, block.entry.id),
		page: getPagePosition({
			allPages: activePages,
			effectivePage,
			paginatedPages: activePaginatedPages,
		}),
		paths: getCurrentPathContexts({
			activeBranches,
			block,
			content,
		}),
	};
}

export function getEffectivePage({
	activePathIds,
	block,
	content,
}: {
	activePathIds: number[];
	block: Block;
	content: TaleContent;
}) {
	if (block.page) return block.page;

	const branchIds = collectActiveBranchIds(content, activePathIds);
	const activeBlocks = Object.values(content.indexMap.blocksById)
		.filter((candidate): candidate is Block => !!candidate)
		.filter((candidate) => branchIds.has(candidate.branchId))
		.sort((a, b) => a.position.index - b.position.index);

	return getEffectivePageFromBlocks(activeBlocks, block.id);
}

function getPagePosition({
	allPages,
	effectivePage,
	paginatedPages,
}: {
	allPages: Page[];
	effectivePage: Page | null;
	paginatedPages: Page[];
}): NavigationPagePosition {
	return {
		...getEntityPosition(allPages, effectivePage?.id),
		allPages: getEntityPosition(allPages, effectivePage?.id),
		paginatedPages: effectivePage?.isPaginated
			? getEntityPosition(paginatedPages, effectivePage.id)
			: {
					index: null,
					isFirst: false,
					isLast: false,
					total: paginatedPages.length,
				},
	};
}

function collectEffectivePages(blocks: Block[]) {
	const byId = new Map<number, Page>();

	for (const block of blocks) {
		if (!block.page || byId.has(block.page.id)) continue;
		byId.set(block.page.id, block.page);
	}

	return [...byId.values()].sort((a, b) => a.position.index - b.position.index);
}

function getBlockBoundaries(
	activeBlocks: Block[],
	block: Block,
): NavigationBlockBoundaries {
	const index = activeBlocks.findIndex((item) => item.id === block.id);

	return {
		isFirstInTale: index === 0,
		isLastInTale: index >= 0 && index === activeBlocks.length - 1,
		isFirstInBranch: isFirstMatching(activeBlocks, block, "branchId"),
		isLastInBranch: isLastMatching(activeBlocks, block, "branchId"),
		isFirstInSection: isFirstMatching(activeBlocks, block, "sectionId"),
		isLastInSection: isLastMatching(activeBlocks, block, "sectionId"),
		isFirstInPart: isFirstMatching(activeBlocks, block, "partId"),
		isLastInPart: isLastMatching(activeBlocks, block, "partId"),
		isFirstInEntry: isFirstMatching(activeBlocks, block, "entryId"),
		isLastInEntry: isLastMatching(activeBlocks, block, "entryId"),
	};
}

function isFirstMatching(
	activeBlocks: Block[],
	block: Block,
	key: "branchId" | "entryId" | "partId" | "sectionId",
) {
	return activeBlocks.find((item) => item[key] === block[key])?.id === block.id;
}

function isLastMatching(
	activeBlocks: Block[],
	block: Block,
	key: "branchId" | "entryId" | "partId" | "sectionId",
) {
	for (let index = activeBlocks.length - 1; index >= 0; index--) {
		const item = activeBlocks[index];
		if (item?.[key] === block[key]) return item.id === block.id;
	}

	return false;
}

function getCurrentPathContexts({
	activeBranches,
	block,
	content,
}: {
	activeBranches: Branch[];
	block: Block;
	content: TaleContent;
}): NavigationPathContext[] {
	const pathIds = new Set<number>();

	if (block.position.isFirstInBranch && !block.branch.position.isRootBranch) {
		for (const pathId of block.branch.links.incomingPathIds) {
			pathIds.add(pathId);
		}
	}

	if (block.position.isLastInBranch) {
		for (const pathId of block.branch.links.outgoingPathIds) {
			pathIds.add(pathId);
		}
	}

	return [...pathIds]
		.map((pathId) => content.indexMap.pathsById[pathId])
		.filter((path): path is Path => !!path)
		.map((path) => {
			const fromBranch =
				path.fromBranch ?? content.indexMap.branchesById[path.fromBranchId];
			const toBranch =
				path.toBranch ?? content.indexMap.branchesById[path.toBranchId];

			return {
				direction:
					path.fromBranchId === block.branchId ? "outgoing" : "incoming",
				path,
				fromBranch: {
					id: path.fromBranchId,
					name: fromBranch?.name ?? `Branch ${path.fromBranchId}`,
					position: getEntityPosition(activeBranches, path.fromBranchId),
				},
				toBranch: {
					id: path.toBranchId,
					name: toBranch?.name ?? `Branch ${path.toBranchId}`,
					position: getEntityPosition(activeBranches, path.toBranchId),
				},
			};
		});
}

function getEffectivePageFromBlocks(blocks: Block[], blockId: number) {
	let currentPage: Page | null = null;

	for (const block of blocks) {
		if (block.page) {
			currentPage = block.page;
		}

		if (block.id === blockId) {
			return currentPage;
		}
	}

	return null;
}

function collectUniquePositioned<
	T extends { id: number; position: { index: number } },
>(blocks: Block[], getItem: (block: Block) => T | null | undefined) {
	const byId = new Map<number, T>();

	for (const block of blocks) {
		const item = getItem(block);
		if (!item || byId.has(item.id)) continue;
		byId.set(item.id, item);
	}

	return [...byId.values()].sort((a, b) => a.position.index - b.position.index);
}

function getEntityPosition(
	items: { id: number }[],
	id: number | null | undefined,
): NavigationEntityPosition {
	if (id == null) {
		return {
			index: null,
			isFirst: false,
			isLast: false,
			total: items.length,
		};
	}

	const index = items.findIndex((item) => item.id === id);

	return {
		index: index >= 0 ? index : null,
		isFirst: index === 0,
		isLast: index >= 0 && index === items.length - 1,
		total: items.length,
	};
}

function collectActiveBranchIds(content: TaleContent, activePathIds: number[]) {
	const selectedPathIds = new Set(activePathIds);
	const branchIds = new Set<number>();
	const rootBranches = Object.values(content.indexMap.branchesById)
		.filter(Boolean)
		.filter((branch) => branch.position.isRootBranch);

	const visit = (branchId: number) => {
		if (branchIds.has(branchId)) return;
		const branch = content.indexMap.branchesById[branchId];
		if (!branch) return;

		branchIds.add(branchId);

		for (const pathId of branch.links.outgoingPathIds) {
			const path = content.indexMap.pathsById[pathId];
			if (!path) continue;
			if (path.type === "choice" && !selectedPathIds.has(path.id)) continue;

			visit(path.toBranchId);
		}
	};

	for (const branch of rootBranches) {
		visit(branch.id);
	}

	return branchIds;
}
