import type { Anchor, Tale } from "../types";

/**
 * Prevents future stacked blocks from leaking into view before their
 * transition becomes active while still allowing adjacent linear layouts
 * to remain visible inside the same viewport.
 *
 * The filter keeps all past anchors, keeps any currently foreground
 * transition anchors, and hides the first future stacked block plus any
 * later anchors until that transition is actually entered.
 *
 * @param anchors - Spatially visible candidate anchors.
 * @param activeAnchorIndex - Route index of the currently active block.
 * @param anchorIndexByBlockId - Route index lookup for each block.
 * @param foregroundBlockIds - Blocks explicitly active in the current segment.
 * @param tale - Tale containing canonical block transition settings.
 * @returns Timeline-eligible anchors that may be painted this frame.
 *
 * @example
 * const visible = filterTimelineVisibleAnchors(candidates, 3, indexById, foregroundIds, tale);
 */
export function filterTimelineVisibleAnchors(
	anchors: readonly Anchor[],
	activeAnchorIndex: number | undefined,
	anchorIndexByBlockId: Record<string, number | undefined>,
	foregroundBlockIds: ReadonlySet<string>,
	tale: Tale,
): Anchor[] {
	if (activeAnchorIndex === undefined) return [...anchors];

	const nextHiddenStackIndex = anchors.reduce<number | null>(
		(nearest, anchor) => {
			const routeIndex = anchorIndexByBlockId[anchor.blockId];
			if (
				routeIndex === undefined ||
				routeIndex <= activeAnchorIndex ||
				foregroundBlockIds.has(anchor.blockId) ||
				tale.indexMap.blocksById[anchor.blockId]?.transition.flow.type !==
					"stack"
			) {
				return nearest;
			}
			return nearest === null ? routeIndex : Math.min(nearest, routeIndex);
		},
		null,
	);

	if (nextHiddenStackIndex === null) return [...anchors];

	return anchors.filter((anchor) => {
		const routeIndex = anchorIndexByBlockId[anchor.blockId];
		if (routeIndex === undefined) return true;
		if (routeIndex <= activeAnchorIndex) return true;
		if (foregroundBlockIds.has(anchor.blockId)) return true;
		return routeIndex < nextHiddenStackIndex;
	});
}
