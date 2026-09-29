import type { Anchor, TimelineSegment } from "../types";

export function getSavedKeyframeId(
	activeAnchor: Anchor,
	segment: TimelineSegment,
	segments: TimelineSegment[],
): string {
	if (segment.type !== "transition") return segment.keyframeId;
	const searchDirection = segment.toSceneId === activeAnchor.sceneId ? 1 : -1;
	for (
		let index = segment.index + searchDirection;
		index >= 0 && index < segments.length;
		index += searchDirection
	) {
		const candidate = segments[index];
		if (!candidate || candidate.type === "transition") continue;
		if (candidate.sceneId === activeAnchor.sceneId) return candidate.keyframeId;
	}
	return `${activeAnchor.sceneId}:default-keyframe`;
}

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
	if (segment.type === "reading" && segment.sceneId === activeAnchor.sceneId) {
		return segmentProgress;
	}
	if (segment.type === "pause" && segment.sceneId === activeAnchor.sceneId) {
		return segment.pauseType === "start" || segment.pauseType === "frame-enter"
			? 0
			: 1;
	}
	if (
		segment.type === "transition" &&
		segment.fromSceneId === activeAnchor.sceneId
	) {
		return 1;
	}
	return 0;
}
