import type { ResolvedTaleBlock, Tale } from "../types";

/**
 * Applies one snap setting to every block in a formatted tale.
 *
 * @param tale - Current formatted tale.
 * @param snap - Snap value applied to every block.
 * @returns Tale with updated block collections and lookup.
 *
 * @example
 * const nextTale = updateAllBlockSnapSettings(tale, true);
 */
export function updateAllBlockSnapSettings(tale: Tale, snap: boolean): Tale {
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
