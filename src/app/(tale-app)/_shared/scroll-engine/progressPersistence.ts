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
	if (segment.type === "reading" && segment.anchor.id === activeAnchor.id) {
		return segmentProgress;
	}
	if (segment.type === "pause" && segment.anchor.id === activeAnchor.id) {
		return segment.pauseType === "start" ? 0 : 1;
	}
	if (segment.type === "transition" && segment.from.id === activeAnchor.id) {
		return 1;
	}
	return 0;
}
