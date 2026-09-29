import type {
	Anchor,
	CompiledReader,
	ResolvedTaleBranch,
	ResolvedTaleEntry,
	ResolvedTalePage,
	ResolvedTalePart,
	ResolvedTaleScene,
	Tale,
	TimelineSegment,
} from "../types";

export function getAnchorBySceneId(
	compiled: CompiledReader,
	sceneId: string,
): Anchor | undefined {
	const index = compiled.anchorIndexBySceneId[sceneId];
	return index === undefined ? undefined : compiled.anchors[index];
}

export function getAnchorBlock(
	tale: Tale,
	anchor: Anchor,
): ResolvedTaleScene | undefined {
	return tale.indexMap.scenesById[anchor.sceneId];
}

export function getAnchorBranch(
	tale: Tale,
	anchor: Anchor,
): ResolvedTaleBranch | undefined {
	return tale.indexMap.branchesById[anchor.branchId];
}

export function getAnchorEntry(
	tale: Tale,
	anchor: Anchor,
): ResolvedTaleEntry | undefined {
	return tale.indexMap.entriesById[anchor.entryId];
}

export function getAnchorPage(
	tale: Tale,
	anchor: Anchor,
): ResolvedTalePage | undefined {
	return tale.indexMap.pagesById[anchor.pageId];
}

export function getAnchorPart(
	tale: Tale,
	anchor: Anchor,
): ResolvedTalePart | undefined {
	return tale.indexMap.partsById[anchor.partId];
}

export function getTransitionAnchors(
	compiled: CompiledReader,
	segment: Extract<TimelineSegment, { type: "transition" }>,
): { from: Anchor | undefined; to: Anchor | undefined } {
	return {
		from:
			segment.fromSceneId === null
				? (compiled.openingTransitionAnchor ?? undefined)
				: getAnchorBySceneId(compiled, segment.fromSceneId),
		to: getAnchorBySceneId(compiled, segment.toSceneId),
	};
}
