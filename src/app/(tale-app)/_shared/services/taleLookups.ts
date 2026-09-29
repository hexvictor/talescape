import type {
	AnimationPreset,
	ResolvedTaleBranch,
	ResolvedTaleElement,
	ResolvedTaleEntry,
	ResolvedTaleKeyframe,
	ResolvedTalePage,
	ResolvedTalePart,
	ResolvedTalePath,
	ResolvedTaleScene,
	SceneStylePreset,
	Tale,
	TaleFrame,
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
export const getTaleScenes = (tale: Tale): ResolvedTaleScene[] =>
	resolveIds(tale.order.sceneIds, tale.indexMap.scenesById);
export const getTaleSceneStylePresets = (tale: Tale): SceneStylePreset[] =>
	resolveIds(
		tale.order.sceneStylePresetIds,
		tale.indexMap.sceneStylePresetsById,
	);
export const getTaleBranches = (tale: Tale): ResolvedTaleBranch[] =>
	resolveIds(tale.order.branchIds, tale.indexMap.branchesById);
export const getTaleEntries = (tale: Tale): ResolvedTaleEntry[] =>
	resolveIds(tale.order.entryIds, tale.indexMap.entriesById);
export const getTaleElements = (tale: Tale): ResolvedTaleElement[] =>
	resolveIds(tale.order.elementIds, tale.indexMap.elementsById);
export const getTaleFrames = (tale: Tale): TaleFrame[] =>
	resolveIds(tale.order.frameIds, tale.indexMap.framesById);
export const getTalePages = (tale: Tale): ResolvedTalePage[] =>
	resolveIds(tale.order.pageIds, tale.indexMap.pagesById);
export const getTaleParts = (tale: Tale): ResolvedTalePart[] =>
	resolveIds(tale.order.partIds, tale.indexMap.partsById);
export const getTalePaths = (tale: Tale): ResolvedTalePath[] =>
	resolveIds(tale.order.pathIds, tale.indexMap.pathsById);
export const getTaleKeyframes = (tale: Tale): ResolvedTaleKeyframe[] =>
	resolveIds(tale.order.keyframeIds, tale.indexMap.keyframesById);

/** Returns progression-owning Frames while excluding nested layout Groups. */
export const getSceneProgressionFrameIds = (
	tale: Tale,
	scene: ResolvedTaleScene,
): string[] =>
	scene.frameIds.filter((id) => {
		const frame = tale.indexMap.framesById[id];
		return frame?.kind !== "group" && frame?.parentFrameId === null;
	});
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
	block: ResolvedTaleScene,
): ResolvedTaleElement[] =>
	resolveIds(block.elementIds, tale.indexMap.elementsById);

export const getBlockNodes = (
	tale: Tale,
	block: ResolvedTaleScene,
): TaleFrame[] => resolveIds(block.frameIds, tale.indexMap.framesById);
