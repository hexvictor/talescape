import type {
	ResolvedTaleBlock,
	ResolvedTaleBranch,
	ResolvedTaleFragment,
	Tale,
	TaleBlock,
	TaleBranch,
	TaleFragment,
	TalePath,
} from "~/app/(tale-app)/_shared/types";
import {
	resolveEditedBlock,
	resolveEditedFragment,
} from "~/app/(tale-app)/_shared/services/formatTale";
import {
	resolveTaleBreakpoint,
	writeBlockBreakpointOverride,
	writeFragmentBreakpointOverride,
} from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";

export function editBlock(
	tale: Tale,
	blockId: string,
	update: (block: ResolvedTaleBlock) => TaleBlock,
	breakpointId: string | null = null,
): Tale {
	const current = resolveTaleBreakpoint(tale, breakpointId).indexMap.blocksById[blockId];
	if (!current) return tale;

	const nextBlock = update(current);
	const baseBlock = tale.indexMap.blocksById[blockId];
	if (!baseBlock) return tale;
	const block = resolveEditedBlock(
		tale,
		writeBlockBreakpointOverride(baseBlock, nextBlock, breakpointId),
	);
	const blocks = tale.structure.blocks.map((item) =>
		item.id === blockId ? block : item,
	);

	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			blocksById: { ...tale.indexMap.blocksById, [blockId]: block },
		},
		structure: { ...tale.structure, blocks },
	};
}

export function editFragment(
	tale: Tale,
	fragmentId: string,
	update: (fragment: ResolvedTaleFragment) => TaleFragment,
	breakpointId: string | null = null,
): Tale {
	const current = resolveTaleBreakpoint(tale, breakpointId).indexMap.fragmentsById[
		fragmentId
	];
	if (!current) return tale;

	const nextFragment = update(current);
	const baseFragment = tale.indexMap.fragmentsById[fragmentId];
	if (!baseFragment) return tale;
	const fragment = resolveEditedFragment(
		tale,
		writeFragmentBreakpointOverride(baseFragment, nextFragment, breakpointId),
	);
	const updatedTale = {
		...tale,
		indexMap: {
			...tale.indexMap,
			fragmentsById: {
				...tale.indexMap.fragmentsById,
				[fragmentId]: fragment,
			},
		},
	};
	const blocks = tale.structure.blocks.map((block) =>
		block.fragmentIds.includes(fragmentId)
			? resolveEditedBlock(updatedTale, block)
			: block,
	);
	const blocksById = Object.fromEntries(
		blocks.map((block) => [block.id, block]),
	) as Record<string, ResolvedTaleBlock>;

	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			blocksById,
			fragmentsById: updatedTale.indexMap.fragmentsById,
		},
		structure: {
			...tale.structure,
			blocks,
			fragments: tale.structure.fragments.map((item) =>
				item.id === fragmentId ? fragment : item,
			),
		},
	};
}

/**
 * Applies an in-memory edit to one branch while preserving derived branch metadata.
 *
 * @param tale - Current formatted tale.
 * @param branchId - Branch id to edit.
 * @param update - Function that returns the edited branch fields.
 * @returns Tale with updated branch collections and lookup.
 *
 * @example
 * const next = editBranch(tale, "1", (branch) => ({ ...branch, title: "Route" }));
 */
export function editBranch(
	tale: Tale,
	branchId: string,
	update: (branch: ResolvedTaleBranch) => TaleBranch,
): Tale {
	const current = tale.indexMap.branchesById[branchId];
	if (!current) return tale;

	const branch = { ...current, ...update(current) };
	const branches = tale.structure.branches.map((item) =>
		item.id === branchId ? branch : item,
	);

	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			branchesById: { ...tale.indexMap.branchesById, [branchId]: branch },
		},
		structure: { ...tale.structure, branches },
	};
}

/**
 * Applies an in-memory edit to one path and invalidates compiled anchors.
 *
 * @param tale - Current formatted tale.
 * @param pathId - Path id to edit.
 * @param update - Function that returns the edited path fields.
 * @returns Tale with updated path collections and lookup.
 *
 * @example
 * const next = editPath(tale, "4", (path) => ({ ...path, label: "Return" }));
 */
export function editPath(
	tale: Tale,
	pathId: string,
	update: (path: TalePath) => TalePath,
): Tale {
	const current = tale.indexMap.pathsById[pathId];
	if (!current) return tale;
	const path = { ...current, ...update(current) };
	const paths = tale.structure.paths.map((item) =>
		item.id === pathId ? { ...item, ...path } : item,
	);
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			anchorsByBlockId: null,
			pathsById: { ...tale.indexMap.pathsById, [pathId]: path },
		},
		structure: {
			...tale.structure,
			anchors: null,
			paths,
		},
	};
}

/**
 * Reorders one block inside the current in-memory tale structure.
 *
 * @param tale - Current formatted tale.
 * @param blockId - Block being moved.
 * @param targetBranchId - Branch receiving the block.
 * @param targetIndex - Zero-based insertion index inside the target branch.
 * @returns Tale with updated block ordering and branch child lists.
 *
 * @example
 * const next = moveBlockInTale(tale, "4", "2", 0);
 */
export function moveBlockInTale(
	tale: Tale,
	blockId: string,
	targetBranchId: string,
	targetIndex: number,
): Tale {
	const movingBlock = tale.indexMap.blocksById[blockId];
	const targetBranch = tale.indexMap.branchesById[targetBranchId];
	if (!movingBlock || !targetBranch) return tale;

	const blocksByBranchId = new Map<string, ResolvedTaleBlock[]>();
	for (const block of tale.structure.blocks) {
		if (block.id === blockId) continue;
		const branchBlocks = blocksByBranchId.get(block.branchId) ?? [];
		branchBlocks.push(block);
		blocksByBranchId.set(block.branchId, branchBlocks);
	}
	const targetBlocks = blocksByBranchId.get(targetBranchId) ?? [];
	targetBlocks.splice(
		Math.max(0, Math.min(targetIndex, targetBlocks.length)),
		0,
		{
			...movingBlock,
			branchId: targetBranchId,
		},
	);
	blocksByBranchId.set(targetBranchId, targetBlocks);

	const blocks = tale.structure.branches.flatMap((branch) =>
		(blocksByBranchId.get(branch.id) ?? []).map((block, index) =>
			resolveEditedBlock(tale, {
				...block,
				branchId: branch.id,
				order: index,
			}),
		),
	);
	return rebuildTaleBlockCollections(tale, blocks);
}

/**
 * Adds an in-memory branch draft to the editor graph.
 *
 * @param tale - Current formatted tale.
 * @returns Tale with a temporary branch draft.
 *
 * @example
 * const next = addDraftBranch(tale);
 */
export function addDraftBranch(tale: Tale): Tale {
	const timestamp = Date.now();
	const id = `draft-branch-${timestamp}`;
	const starterBlockId = `draft-block-${timestamp}`;
	const branch: ResolvedTaleBranch = {
		blockIds: [starterBlockId],
		bounds: {
			firstBlockId: starterBlockId,
			lastBlockId: starterBlockId,
		},
		children: { blockIds: [starterBlockId] },
		counts: { blocks: 1 },
		description: "",
		id,
		links: {
			incomingPathIds: [],
			nextBranchId: null,
			outgoingPathIds: [],
			previousBranchId: tale.bounds.lastBranchId,
		},
		order: tale.structure.branches.length,
		parentBranchId: tale.bounds.rootBranchId,
		path: `draft/${id}`,
		position: {
			hasIncomingPaths: false,
			hasOutgoingPaths: false,
			index: tale.structure.branches.length,
			isChoiceBranch: false,
			isFirst: false,
			isLast: true,
			isRootBranch: false,
			isTerminalBranch: true,
		},
		title: "New Branch",
	};
	const template = tale.structure.blocks[0];
	const branches = [...tale.structure.branches, branch];
	const nextTale = {
		...tale,
		counts: { ...tale.counts, branches: branches.length },
		indexMap: {
			...tale.indexMap,
			branchesById: { ...tale.indexMap.branchesById, [id]: branch },
		},
		order: { ...tale.order, branchIds: branches.map((item) => item.id) },
		structure: { ...tale.structure, branches },
	};
	if (!template) return nextTale;
	const block = resolveEditedBlock(nextTale, {
		...template,
		branchId: id,
		fragmentIds: [],
		id: starterBlockId,
		isChoiceBlock: false,
		nodeIds: [],
		nodes: [],
		order: 0,
		rootNodeId: template.rootNodeId,
		title: "New Block",
	});
	return rebuildTaleBlockCollections(nextTale, [
		...nextTale.structure.blocks,
		block,
	]);
}

/**
 * Adds an in-memory block draft to one branch by cloning a nearby block shape.
 *
 * @param tale - Current formatted tale.
 * @param branchId - Branch receiving the new block.
 * @returns Tale with a temporary block draft.
 *
 * @example
 * const next = addDraftBlock(tale, "2");
 */
export function addDraftBlock(tale: Tale, branchId: string): Tale {
	const template =
		tale.structure.blocks.find((block) => block.branchId === branchId) ??
		tale.structure.blocks[0];
	const branch = tale.indexMap.branchesById[branchId];
	if (!template || !branch) return tale;
	const branchBlocks = tale.structure.blocks.filter(
		(block) => block.branchId === branchId,
	);
	const id = `draft-block-${Date.now()}`;
	const block = resolveEditedBlock(tale, {
		...template,
		branchId,
		fragmentIds: [],
		id,
		isChoiceBlock: false,
		nodeIds: [],
		nodes: [],
		order: branchBlocks.length,
		rootNodeId: template.rootNodeId,
		title: "New Block",
	});
	return rebuildTaleBlockCollections(tale, [...tale.structure.blocks, block]);
}

/**
 * Adds an in-memory path draft between two existing branch nodes.
 *
 * @param tale - Current formatted tale.
 * @param fromBranchId - Source branch id.
 * @param toBranchId - Target branch id.
 * @returns Tale with a temporary path draft when both branches have blocks.
 *
 * @example
 * const next = connectDraftBranches(tale, "1", "2");
 */
export function connectDraftBranches(
	tale: Tale,
	fromBranchId: string,
	toBranchId: string,
): Tale {
	const fromBlocks = tale.structure.blocks
		.filter((block) => block.branchId === fromBranchId)
		.sort((first, second) => first.order - second.order);
	const toBlocks = tale.structure.blocks
		.filter((block) => block.branchId === toBranchId)
		.sort((first, second) => first.order - second.order);
	const fromBlock = fromBlocks.at(-1);
	const toBlock = toBlocks[0];
	if (!fromBlock || !toBlock) return tale;
	const id = `draft-path-${Date.now()}`;
	const path = {
		description: "",
		fromBlockId: fromBlock.id,
		fromBranchId,
		id,
		label: "New Path",
		links: {
			nextPathId: null,
			previousPathId: null,
		},
		order: tale.structure.paths.length,
		toBlockId: toBlock.id,
		toBranchId,
		type: "choice" as const,
	};
	return {
		...tale,
		counts: { ...tale.counts, paths: tale.structure.paths.length + 1 },
		indexMap: {
			...tale.indexMap,
			anchorsByBlockId: null,
			pathsById: { ...tale.indexMap.pathsById, [id]: path },
		},
		order: { ...tale.order, pathIds: [...tale.order.pathIds, id] },
		structure: {
			...tale.structure,
			anchors: null,
			paths: [...tale.structure.paths, path],
		},
	};
}

/**
 * Reconnects an in-memory path to different source or target branches.
 *
 * @param tale - Current formatted tale.
 * @param pathId - Path being reconnected.
 * @param fromBranchId - New source branch id.
 * @param toBranchId - New target branch id.
 * @returns Tale with updated path endpoints when both branches have blocks.
 *
 * @example
 * const next = reconnectDraftPath(tale, "3", "1", "4");
 */
export function reconnectDraftPath(
	tale: Tale,
	pathId: string,
	fromBranchId: string,
	toBranchId: string,
): Tale {
	const path = tale.indexMap.pathsById[pathId];
	if (!path) return tale;
	const fromBlocks = getOrderedBranchBlocks(
		tale.structure.blocks,
		fromBranchId,
	);
	const toBlocks = getOrderedBranchBlocks(tale.structure.blocks, toBranchId);
	const fromBlock = fromBlocks.at(-1);
	const toBlock = toBlocks[0];
	if (!fromBlock || !toBlock) return tale;
	const nextPath = {
		...path,
		fromBlockId: fromBlock.id,
		fromBranchId,
		toBlockId: toBlock.id,
		toBranchId,
	};
	const paths = tale.structure.paths.map((item) =>
		item.id === pathId ? nextPath : item,
	);

	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			anchorsByBlockId: null,
			pathsById: {
				...tale.indexMap.pathsById,
				[pathId]: nextPath,
			},
		},
		structure: {
			...tale.structure,
			anchors: null,
			paths,
		},
	};
}

/**
 * Rebuilds block collection and branch child metadata after editor block changes.
 *
 * @param tale - Current formatted tale.
 * @param blocks - Updated blocks.
 * @returns Tale with refreshed block and branch indexes.
 *
 * @example
 * const next = rebuildTaleBlockCollections(tale, blocks);
 */
function rebuildTaleBlockCollections(
	tale: Tale,
	blocks: ResolvedTaleBlock[],
): Tale {
	const branchOrderById = new Map(
		tale.structure.branches.map((branch, index) => [branch.id, index]),
	);
	const sortedBlocks = [...blocks].sort((first, second) => {
		const firstBranchIndex = branchOrderById.get(first.branchId) ?? 0;
		const secondBranchIndex = branchOrderById.get(second.branchId) ?? 0;
		return firstBranchIndex - secondBranchIndex || first.order - second.order;
	});
	const branches = tale.structure.branches.map((branch) => {
		const blockIds = sortedBlocks
			.filter((block) => block.branchId === branch.id)
			.sort((first, second) => first.order - second.order)
			.map((block) => block.id);
		return {
			...branch,
			blockIds,
			children: { blockIds },
			counts: { ...branch.counts, blocks: blockIds.length },
		};
	});
	return {
		...tale,
		counts: { ...tale.counts, blocks: sortedBlocks.length },
		indexMap: {
			...tale.indexMap,
			anchorsByBlockId: null,
			blocksById: Object.fromEntries(
				sortedBlocks.map((block) => [block.id, block]),
			) as Record<string, ResolvedTaleBlock>,
			branchesById: Object.fromEntries(
				branches.map((branch) => [branch.id, branch]),
			) as Record<string, ResolvedTaleBranch>,
		},
		order: {
			...tale.order,
			blockIds: sortedBlocks.map((block) => block.id),
			branchIds: branches.map((branch) => branch.id),
		},
		structure: {
			...tale.structure,
			anchors: null,
			blocks: sortedBlocks,
			branches,
		},
	};
}

/**
 * Returns the current ordered blocks for one branch.
 *
 * @param blocks - Tale blocks.
 * @param branchId - Branch id to filter by.
 * @returns Ordered branch blocks.
 *
 * @example
 * const blocks = getOrderedBranchBlocks(tale.structure.blocks, "1");
 */
function getOrderedBranchBlocks(
	blocks: ResolvedTaleBlock[],
	branchId: string,
): ResolvedTaleBlock[] {
	return blocks
		.filter((block) => block.branchId === branchId)
		.sort((first, second) => first.order - second.order);
}
