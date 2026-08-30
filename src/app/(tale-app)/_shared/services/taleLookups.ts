import type {
	AnimationPreset,
	BlockStylePreset,
	ResolvedTaleBlock,
	ResolvedTaleBranch,
	ResolvedTaleEntry,
	ResolvedTaleFragment,
	ResolvedTalePage,
	ResolvedTalePart,
	ResolvedTalePath,
	Tale,
	TaleNode,
	TransitionPreset,
	VisibilityPreset,
} from "../types";

export function resolveIds<T>(
	ids: readonly string[],
	index: Readonly<Record<string, T>>,
): T[] {
	return ids.flatMap((id) => {
		const item = index[id];
		return item ? [item] : [];
	});
}

export const getTaleAnimationPresets = (tale: Tale): AnimationPreset[] =>
	resolveIds(tale.order.animationPresetIds, tale.indexMap.animationPresetsById);
export const getTaleBlocks = (tale: Tale): ResolvedTaleBlock[] =>
	resolveIds(tale.order.blockIds, tale.indexMap.blocksById);
export const getTaleBlockStylePresets = (tale: Tale): BlockStylePreset[] =>
	resolveIds(
		tale.order.blockStylePresetIds,
		tale.indexMap.blockStylePresetsById,
	);
export const getTaleBranches = (tale: Tale): ResolvedTaleBranch[] =>
	resolveIds(tale.order.branchIds, tale.indexMap.branchesById);
export const getTaleEntries = (tale: Tale): ResolvedTaleEntry[] =>
	resolveIds(tale.order.entryIds, tale.indexMap.entriesById);
export const getTaleFragments = (tale: Tale): ResolvedTaleFragment[] =>
	resolveIds(tale.order.fragmentIds, tale.indexMap.fragmentsById);
export const getTaleNodes = (tale: Tale): TaleNode[] =>
	resolveIds(tale.order.nodeIds, tale.indexMap.nodesById);
export const getTalePages = (tale: Tale): ResolvedTalePage[] =>
	resolveIds(tale.order.pageIds, tale.indexMap.pagesById);
export const getTaleParts = (tale: Tale): ResolvedTalePart[] =>
	resolveIds(tale.order.partIds, tale.indexMap.partsById);
export const getTalePaths = (tale: Tale): ResolvedTalePath[] =>
	resolveIds(tale.order.pathIds, tale.indexMap.pathsById);
export const getTaleTransitionPresets = (tale: Tale): TransitionPreset[] =>
	resolveIds(
		tale.order.transitionPresetIds,
		tale.indexMap.transitionPresetsById,
	);
export const getTaleVisibilityPresets = (tale: Tale): VisibilityPreset[] =>
	resolveIds(
		tale.order.visibilityPresetIds,
		tale.indexMap.visibilityPresetsById,
	);

export const getBlockFragments = (
	tale: Tale,
	block: ResolvedTaleBlock,
): ResolvedTaleFragment[] =>
	resolveIds(block.fragmentIds, tale.indexMap.fragmentsById);

export const getBlockNodes = (
	tale: Tale,
	block: ResolvedTaleBlock,
): TaleNode[] => resolveIds(block.nodeIds, tale.indexMap.nodesById);
