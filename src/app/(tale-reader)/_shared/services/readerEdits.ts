import type {
	ResolvedTaleBlock,
	ResolvedTaleFragment,
	Tale,
	TaleBlock,
	TaleFragment,
} from "../types";
import { resolveEditedBlock, resolveEditedFragment } from "./formatTale";

export function editBlock(
	tale: Tale,
	blockId: string,
	update: (block: ResolvedTaleBlock) => TaleBlock,
): Tale {
	const current = tale.indexMap.blocksById[blockId];
	if (!current) return tale;

	const block = resolveEditedBlock(tale, update(current));
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
): Tale {
	const current = tale.indexMap.fragmentsById[fragmentId];
	if (!current) return tale;

	const fragment = resolveEditedFragment(tale, update(current));
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
 * Applies one snap setting to every block in the current in-memory edit session.
 *
 * @param tale - Current formatted tale.
 * @param snap - Snap value applied to every block.
 * @returns Tale with updated block collections and lookup.
 */
export function editAllBlocksSnap(tale: Tale, snap: boolean): Tale {
	const blocks = tale.structure.blocks.map((block) => ({ ...block, snap }));
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			blocksById: Object.fromEntries(
				blocks.map((block) => [block.id, block]),
			) as Record<string, ResolvedTaleBlock>,
		},
		structure: { ...tale.structure, blocks },
	};
}
