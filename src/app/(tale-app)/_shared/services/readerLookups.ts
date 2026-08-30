import type {
	Anchor,
	CompiledReader,
	ResolvedTaleBlock,
	ResolvedTaleBranch,
	ResolvedTaleEntry,
	ResolvedTalePage,
	ResolvedTalePart,
	Tale,
	TimelineSegment,
} from "../types";

export function getAnchorByBlockId(
	compiled: CompiledReader,
	blockId: string,
): Anchor | undefined {
	const index = compiled.anchorIndexByBlockId[blockId];
	return index === undefined ? undefined : compiled.anchors[index];
}

export function getAnchorBlock(
	tale: Tale,
	anchor: Anchor,
): ResolvedTaleBlock | undefined {
	return tale.indexMap.blocksById[anchor.blockId];
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
			segment.fromBlockId === null
				? (compiled.openingTransitionAnchor ?? undefined)
				: getAnchorByBlockId(compiled, segment.fromBlockId),
		to: getAnchorByBlockId(compiled, segment.toBlockId),
	};
}
