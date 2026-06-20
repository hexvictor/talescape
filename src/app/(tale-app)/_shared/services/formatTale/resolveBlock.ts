import type {
	ResolvedTaleBlock,
	ResolvedTaleFragment,
	Tale,
	TaleBlock,
} from "../../types";
import { resolveAnimations } from "./resolveFragment";
import {
	createFragmentPlacementBuckets,
	resolveBlockNodes,
} from "./resolveNodes";
import { adjacentIds, groupIdsBy, indexPosition, recordById } from "./shared";

type BlockLookups = {
	fragmentsById: Record<string, ResolvedTaleFragment>;
};

export type BlockStructureLookups = {
	blockIds: string[];
	blockIdsByBranch: Record<string, string[]>;
	blockIdsByEntry: Record<string, string[]>;
	blockIdsByPage: Record<string, string[]>;
	blockIdsByPart: Record<string, string[]>;
};

/**
 * Formats one block with fragment, node, relationship, and preset metadata.
 *
 * @param block - Raw block.
 * @param lookups - Resolved preset and fragment lookups.
 * @param structure - Block relationship lookups.
 * @returns Resolved block.
 */
export function resolveBlock(
	block: TaleBlock,
	lookups: BlockLookups,
	structure: BlockStructureLookups,
): ResolvedTaleBlock {
	const fragments = block.fragmentIds.flatMap((id) => {
		const fragment = lookups.fragmentsById[id];
		return fragment ? [fragment] : [];
	});
	const fragmentsById = recordById(fragments);
	const buckets = createFragmentPlacementBuckets(fragments);
	const { nodes, rootNodeId } = resolveBlockNodes(block, buckets);
	const nodesById = recordById(nodes);
	const globalLinks = adjacentIds(structure.blockIds, block.id);
	const branchLinks = adjacentIds(
		structure.blockIdsByBranch[block.branchId] ?? [],
		block.id,
	);
	const entryLinks = adjacentIds(
		structure.blockIdsByEntry[block.entryId] ?? [],
		block.id,
	);
	const pageLinks = adjacentIds(
		structure.blockIdsByPage[block.pageId] ?? [],
		block.id,
	);
	const partLinks = adjacentIds(
		structure.blockIdsByPart[block.partId] ?? [],
		block.id,
	);

	return {
		...block,
		children: { fragmentIds: block.fragmentIds },
		...buckets,
		fragments,
		fragmentsById,
		links: {
			nextBlockId: globalLinks.next,
			nextBlockIdInBranch: branchLinks.next,
			nextBlockIdInEntry: entryLinks.next,
			nextBlockIdInPage: pageLinks.next,
			nextBlockIdInPart: partLinks.next,
			previousBlockId: globalLinks.previous,
			previousBlockIdInBranch: branchLinks.previous,
			previousBlockIdInEntry: entryLinks.previous,
			previousBlockIdInPage: pageLinks.previous,
			previousBlockIdInPart: partLinks.previous,
		},
		nodes,
		nodesById,
		rootNodeId,
		position: {
			...indexPosition(globalLinks.index, structure.blockIds.length),
			branchIndex: branchLinks.index,
			entryIndex: entryLinks.index,
			isFirstInBranch: branchLinks.index === 0,
			isFirstInEntry: entryLinks.index === 0,
			isFirstInPage: pageLinks.index === 0,
			isFirstInPart: partLinks.index === 0,
			isLastInBranch:
				branchLinks.index ===
				(structure.blockIdsByBranch[block.branchId]?.length ?? 0) - 1,
			isLastInEntry:
				entryLinks.index ===
				(structure.blockIdsByEntry[block.entryId]?.length ?? 0) - 1,
			isLastInPage:
				pageLinks.index ===
				(structure.blockIdsByPage[block.pageId]?.length ?? 0) - 1,
			isLastInPart:
				partLinks.index ===
				(structure.blockIdsByPart[block.partId]?.length ?? 0) - 1,
			isPageBlock: pageLinks.index >= 0,
			pageIndex: pageLinks.index,
			partIndex: partLinks.index,
		},
		resolved: {
			background: resolveBlockBackground(block),
			flow: block.transition.flow,
			hasImage: fragments.some((fragment) => fragment.type === "image"),
			readingAnimations: {
				ambient: resolveAnimations(block.reading.animations.ambient),
				ambientCycleDurationMs:
					block.reading.animations.ambient.cycleDurationMs ?? 2400,
				ambientPlayback:
					block.reading.animations.ambient.playback ?? "alternate",
				scrolling: resolveAnimations(block.reading.animations.scrolling),
			},
			style: block.style ?? {},
			transitionAnimations: {
				entering: resolveAnimations(block.transition.animations.entering),
				leaving: resolveAnimations(block.transition.animations.leaving),
			},
		},
	};
}

/**
 * Re-resolves an inspector-edited block inside the formatted tale.
 *
 * @param tale - Current formatted tale.
 * @param block - Edited raw block fields.
 * @returns Updated resolved block.
 */
export function resolveEditedBlock(
	tale: Tale,
	block: TaleBlock,
): ResolvedTaleBlock {
	const blocks = tale.structure.blocks;
	return resolveBlock(
		block,
		{
			fragmentsById: tale.indexMap.fragmentsById,
		},
		{
			blockIds: tale.order.blockIds,
			blockIdsByBranch: groupIdsBy(
				blocks,
				(item) => item.branchId,
				(item) => item.id,
			),
			blockIdsByEntry: groupIdsBy(
				blocks,
				(item) => item.entryId,
				(item) => item.id,
			),
			blockIdsByPage: groupIdsBy(
				blocks,
				(item) => item.pageId,
				(item) => item.id,
			),
			blockIdsByPart: groupIdsBy(
				blocks,
				(item) => item.partId,
				(item) => item.id,
			),
		},
	);
}

/**
 * Resolves inline and preset block background styling.
 *
 * @param block - Raw block style configuration.
 * @returns CSS background value.
 */
function resolveBlockBackground(block: TaleBlock): string {
	if (block.style?.backgroundImage || block.style?.backgroundCss) {
		return [
			block.style.backgroundImage
				? `url(${block.style.backgroundImage}) center / cover no-repeat`
				: null,
			block.style.backgroundCss,
		]
			.filter(Boolean)
			.join(", ");
	}
	return block.style?.background ?? "#0d0b08";
}
