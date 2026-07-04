import type { ResolvedTaleBlock, Tale, TaleBlockSnapMode } from "../types";

/**
 * Applies one snap setting to every block in a formatted tale.
 *
 * @param tale - Current formatted tale.
 * @param mode - Snap mode applied to every block.
 * @returns Tale with updated block collections and lookup.
 *
 * @example
 * const nextTale = updateAllBlockSnapSettings(tale, "scroll-snap");
 */
export function updateAllBlockSnapSettings(
	tale: Tale,
	mode: TaleBlockSnapMode,
): Tale {
	const blocks = tale.structure.blocks.map((block) => ({
		...block,
		snap: { ...block.snap, mode },
	}));
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
