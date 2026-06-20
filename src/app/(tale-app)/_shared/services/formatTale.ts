import type { Anchor, RawTaleRecord, Tale, TaleBlock } from "../types";
import {
	type BlockStructureLookups,
	resolveBlock,
} from "./formatTale/resolveBlock";
import { resolveFragment } from "./formatTale/resolveFragment";
import {
	resolveBranches,
	resolveEntries,
	resolvePages,
	resolveParts,
	resolvePaths,
} from "./formatTale/resolveNarrative";
import {
	first,
	groupIdsBy,
	last,
	recordById,
	sortedByOrder,
} from "./formatTale/shared";

export { resolveEditedBlock } from "./formatTale/resolveBlock";
export { resolveEditedFragment } from "./formatTale/resolveFragment";

/**
 * Formats raw database reader data into the indexed engine model.
 *
 * @param raw - Raw tale record and related entities.
 * @returns Fully resolved tale structure used by the reader.
 *
 * @example
 * const tale = formatTale(rawRecord);
 */
export function formatTale(raw: RawTaleRecord): Tale {
	const animationPresetsById = recordById(raw.animationPresets);
	const visibilityPresetsById = recordById(raw.visibilityPresets);
	const rawBlocks = raw.blocks;
	const rawBranches = sortedByOrder(raw.branches);
	const rawEntries = sortedByOrder(raw.entries);
	const rawParts = sortedByOrder(raw.parts);
	const rawPaths = raw.paths;
	const rawPages = raw.pages;
	const rawFragments = raw.fragments;
	const rawNodes = raw.nodes;
	const blockIds = rawBlocks.map((block) => block.id);
	const branchIds = rawBranches.map((branch) => branch.id);
	const entryIds = rawEntries.map((entry) => entry.id);
	const fragmentIds = rawFragments.map((fragment) => fragment.id);
	const nodeIds = rawNodes.map((node) => node.id);
	const pageIds = rawPages.map((page) => page.id);
	const numberedPageIds = rawPages
		.filter((page) => page.isPaginated)
		.map((page) => page.id);
	const partIds = rawParts.map((part) => part.id);
	const pathIds = rawPaths.map((path) => path.id);
	const blockStructure = createBlockStructureLookups(rawBlocks, blockIds);
	const fragmentToBlock = createFragmentBlockLookup(rawBlocks);
	const fragments = rawFragments.map((fragment, globalIndex) => {
		const block = fragmentToBlock.get(fragment.id);
		return resolveFragment(fragment, {
			blockId: block?.id ?? "",
			branchId: block?.branchId ?? "",
			entryId: block?.entryId ?? "",
			globalIds: fragmentIds,
			globalIndex,
			pageId: block?.pageId ?? "",
			partId: block?.partId ?? "",
			siblingIds: block?.fragmentIds ?? [],
		});
	});
	const resolvedFragmentsById = recordById(fragments);
	const branches = resolveBranches(
		rawBranches,
		rawPaths,
		blockStructure.blockIdsByBranch,
	);
	const entries = resolveEntries(rawEntries, rawBlocks, rawPages);
	const pages = resolvePages(rawPages, rawEntries, rawBlocks);
	const parts = resolveParts(rawParts, rawEntries, rawPages, rawBlocks);
	const paths = resolvePaths(rawPaths);
	const blockStylePresetsById = recordById(raw.blockStylePresets);
	const transitionPresetsById = recordById(raw.transitionPresets);
	const blocks = rawBlocks.map((block) =>
		resolveBlock(
			block,
			{
				fragmentsById: resolvedFragmentsById,
			},
			blockStructure,
		),
	);
	const rootBranchId =
		branches.find((branch) => branch.position.isRootBranch)?.id ??
		first(branchIds);

	return {
		book: null,
		creator: null,
		id: raw.id,
		slug: raw.slug,
		synopsis: raw.synopsis,
		title: raw.title,
		bounds: {
			firstBlockId: first(blockIds),
			firstBranchId: first(branchIds),
			firstEntryId: first(entryIds),
			firstFragmentId: first(fragmentIds),
			firstPageId: first(pageIds),
			firstPartId: first(partIds),
			lastBlockId: last(blockIds),
			lastBranchId: last(branchIds),
			lastEntryId: last(entryIds),
			lastFragmentId: last(fragmentIds),
			lastPageId: last(pageIds),
			lastPartId: last(partIds),
			rootBranchId,
		},
		counts: {
			blocks: blocks.length,
			branches: branches.length,
			entries: entries.length,
			fragments: fragments.length,
			nodes: rawNodes.length,
			pages: pages.length,
			parts: parts.length,
			paths: paths.length,
		},
		indexMap: {
			anchorsByBlockId: null,
			animationPresetsById,
			blocksById: recordById(blocks),
			blockStylePresetsById,
			branchesById: recordById(branches),
			entriesById: recordById(entries),
			fragmentsById: resolvedFragmentsById,
			nodesById: recordById(rawNodes),
			pagesById: recordById(pages),
			partsById: recordById(parts),
			pathsById: recordById(paths),
			transitionPresetsById,
			visibilityPresetsById,
		},
		order: {
			blockIds,
			branchIds,
			entryIds,
			fragmentIds,
			nodeIds,
			numberedPageIds,
			pageIds,
			partIds,
			pathIds,
		},
		structure: {
			anchors: null,
			animationPresets: raw.animationPresets,
			blocks,
			blockStylePresets: raw.blockStylePresets,
			branches,
			entries,
			fragments,
			nodes: rawNodes,
			pages,
			parts,
			paths,
			transitionPresets: raw.transitionPresets,
			visibilityPresets: raw.visibilityPresets,
		},
	};
}

/**
 * Stores compiled anchors on the formatted tale.
 *
 * @param tale - Current formatted tale.
 * @param anchors - Latest compiled anchors.
 * @returns Tale copy containing anchor collections and lookup.
 *
 * @example
 * const nextTale = setResolvedAnchors(tale, compiled.anchors);
 */
export function setResolvedAnchors(tale: Tale, anchors: Anchor[]): Tale {
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			anchorsByBlockId: recordById(anchors),
		},
		structure: {
			...tale.structure,
			anchors,
		},
	};
}

/**
 * Groups block ids by each narrative relationship.
 *
 * @param blocks - Raw tale blocks.
 * @param blockIds - Global block order.
 * @returns Block relationship lookups.
 */
function createBlockStructureLookups(
	blocks: TaleBlock[],
	blockIds: string[],
): BlockStructureLookups {
	return {
		blockIds,
		blockIdsByBranch: groupIdsBy(
			blocks,
			(block) => block.branchId,
			(block) => block.id,
		),
		blockIdsByEntry: groupIdsBy(
			blocks,
			(block) => block.entryId,
			(block) => block.id,
		),
		blockIdsByPage: groupIdsBy(
			blocks,
			(block) => block.pageId,
			(block) => block.id,
		),
		blockIdsByPart: groupIdsBy(
			blocks,
			(block) => block.partId,
			(block) => block.id,
		),
	};
}

/**
 * Maps fragment ids to their owning raw block.
 *
 * @param blocks - Raw tale blocks.
 * @returns Fragment-to-block lookup.
 */
function createFragmentBlockLookup(
	blocks: TaleBlock[],
): Map<string, TaleBlock> {
	const fragmentToBlock = new Map<string, TaleBlock>();
	for (const block of blocks) {
		for (const fragmentId of block.fragmentIds) {
			fragmentToBlock.set(fragmentId, block);
		}
	}
	return fragmentToBlock;
}
