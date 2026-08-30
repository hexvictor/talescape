import type { Anchor, TimelineSegment } from "../types";

/**
 * Converts an active timeline segment into normalized saved block progress.
 *
 * @param activeAnchor - Anchor considered active by the engine.
 * @param segment - Current timeline segment.
 * @param segmentProgress - Current normalized segment progress.
 * @returns Normalized block reading progress.
 *
 * @example
 * const innerProgress = getSavedInnerProgress(anchor, segment, progress);
 */
export function getSavedInnerProgress(
	activeAnchor: Anchor,
	segment: TimelineSegment,
	segmentProgress: number,
): number {
	if (segment.type === "reading" && segment.blockId === activeAnchor.blockId) {
		return segmentProgress;
	}
	if (segment.type === "pause" && segment.blockId === activeAnchor.blockId) {
		return segment.pauseType === "start" ? 0 : 1;
	}
	if (
		segment.type === "transition" &&
		segment.fromBlockId === activeAnchor.blockId
	) {
		return 1;
	}
	return 0;
}
