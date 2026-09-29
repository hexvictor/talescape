import {
	getAnchorBySceneId,
	getTransitionAnchors,
} from "../services/readerLookups";
import type { Anchor, CompiledReader } from "../types";
import { getUniqueAnchors } from "./readerVisibility";

export type ReaderFramePlan = {
	activeAnchorIndex: number | undefined;
	foregroundSceneIds: Set<string>;
	paintedSceneIds: Set<string>;
	visibleAnchors: Anchor[];
};

/**
 * Compiles the anchor sets needed by each timeline segment so the frame loop
 * does not rebuild arrays and sets while active.
 *
 * @param compiled - Compiled reader route and timeline.
 * @returns Frame plans indexed by segment index.
 *
 * @example
 * const plans = compileReaderFramePlans(compiled);
 * const plan = plans[segment.index];
 */
export function compileReaderFramePlans(
	compiled: CompiledReader,
): ReaderFramePlan[] {
	return compiled.segments.map((segment) => {
		const segmentAnchors =
			segment.type === "transition"
				? Object.values(getTransitionAnchors(compiled, segment))
				: [getAnchorBySceneId(compiled, segment.sceneId)];
		const paintedAnchors = segmentAnchors.filter((anchor): anchor is Anchor =>
			Boolean(anchor),
		);
		const visibleAnchors = getUniqueAnchors(paintedAnchors);
		const foregroundSceneIds =
			segment.type === "transition"
				? new Set(
						[segment.fromSceneId, segment.toSceneId].filter(
							(sceneId): sceneId is string => sceneId !== null,
						),
					)
				: new Set([segment.sceneId]);
		const activeSceneId =
			segment.type === "transition" ? segment.fromSceneId : segment.sceneId;

		return {
			activeAnchorIndex:
				activeSceneId === null
					? -1
					: compiled.anchorIndexBySceneId[activeSceneId],
			foregroundSceneIds,
			paintedSceneIds: new Set(paintedAnchors.map((anchor) => anchor.sceneId)),
			visibleAnchors,
		};
	});
}
