import type { Anchor, CompiledReader } from "../types";
import type { ReaderDomRegistry } from "./readerDomRegistry";

/**
 * Removes duplicate anchors while preserving order.
 *
 * @param anchors - Candidate anchors.
 * @returns Unique anchors.
 */
export function getUniqueAnchors(anchors: Anchor[]): Anchor[] {
	const seen = new Set<string>();
	return anchors.filter((anchor) => {
		if (seen.has(anchor.blockId)) return false;
		seen.add(anchor.blockId);
		return true;
	});
}

/**
 * Resolves every mounted anchor that needs a deterministic animation style.
 *
 * Nearby hidden blocks are included so their future entering state is painted
 * before they can intersect the viewport.
 *
 * @param paintedAnchors - Anchors visible or controlled by an active takeover.
 * @param nearbyAnchors - Anchors mounted in the render window.
 * @returns Unique anchors whose current or resting animation state must be painted.
 *
 * @example
 * const anchors = getReaderStyleAnchors(visibleAnchors, nearbyAnchors);
 */
export function getReaderStyleAnchors(
	paintedAnchors: readonly Anchor[],
	nearbyAnchors: readonly Anchor[],
): Anchor[] {
	return getUniqueAnchors([...paintedAnchors, ...nearbyAnchors]);
}

/**
 * Creates a visibility painter that updates mounted blocks only when the
 * visible set, foreground set, or DOM registry changes.
 *
 * @param registry - Direct references to mounted reader elements.
 * @param anchorIndexByBlockId - Route index lookup used for proximity layering.
 * @returns Cached visibility painter.
 */
export function createReaderVisibilityPainter(
	registry: ReaderDomRegistry,
	anchorIndexByBlockId: CompiledReader["anchorIndexByBlockId"],
): (
	anchors: Anchor[],
	foregroundBlockIds: Set<string>,
	activeAnchorIndex: number | undefined,
) => void {
	let previousKey = "";

	return (anchors, foregroundBlockIds, activeAnchorIndex): void => {
		const visibleIds = new Set(anchors.map((anchor) => anchor.blockId));
		const visibleKey = anchors.map((anchor) => anchor.blockId).join("|");
		const foregroundKey = [...foregroundBlockIds].join("|");
		const key = `${registry.getRevision()}:${visibleKey}:${foregroundKey}:${activeAnchorIndex ?? -1}`;
		if (key === previousKey) return;
		previousKey = key;

		for (const [blockId, element] of registry.blockElementById) {
			const visible = visibleIds.has(blockId);
			const visibility = visible ? "visible" : "hidden";
			const pointerEvents = visible ? "auto" : "none";
			const routeIndex = anchorIndexByBlockId[blockId];
			const distance =
				activeAnchorIndex === undefined || routeIndex === undefined
					? 0
					: Math.abs(routeIndex - activeAnchorIndex);
			const zIndex = visible
				? foregroundBlockIds.has(blockId)
					? String(100 + Math.max(routeIndex ?? 0, 0))
					: String(Math.max(1, 50 - distance))
				: "0";
			if (element.style.visibility !== visibility) {
				element.style.visibility = visibility;
			}
			if (element.style.pointerEvents !== pointerEvents) {
				element.style.pointerEvents = pointerEvents;
			}
			if (element.style.zIndex !== zIndex) element.style.zIndex = zIndex;
			element.dataset.readerViewportState = visible ? "visible" : "nearby";

			for (const fixedElement of registry.fixedElementsByBlockId.get(blockId) ??
				[]) {
				const fixedPointerEvents = fixedElement.dataset.readerRole?.endsWith(
					"fixed-fragment-layer",
				)
					? "none"
					: pointerEvents;
				if (fixedElement.style.visibility !== visibility) {
					fixedElement.style.visibility = visibility;
				}
				if (fixedElement.style.pointerEvents !== fixedPointerEvents) {
					fixedElement.style.pointerEvents = fixedPointerEvents;
				}
			}
		}
	};
}
