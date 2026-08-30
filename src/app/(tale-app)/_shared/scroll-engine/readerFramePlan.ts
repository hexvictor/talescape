import {
	getAnchorByBlockId,
	getTransitionAnchors,
} from "../services/readerLookups";
import type { Anchor, CompiledReader } from "../types";
import { getUniqueAnchors } from "./readerVisibility";

export type ReaderFramePlan = {
	activeAnchorIndex: number | undefined;
	foregroundBlockIds: Set<string>;
	paintedBlockIds: Set<string>;
	visibleAnchors: Anchor[];
};

/**
 * Compiles the anchor sets needed by each timeline segment so the frame loop
 * does not rebuild arrays and sets while scrolling.
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
				: [getAnchorByBlockId(compiled, segment.blockId)];
		const paintedAnchors = segmentAnchors.filter((anchor): anchor is Anchor =>
			Boolean(anchor),
		);
		const visibleAnchors = getUniqueAnchors(paintedAnchors);
		const foregroundBlockIds =
			segment.type === "transition"
				? new Set(
						[segment.fromBlockId, segment.toBlockId].filter(
							(blockId): blockId is string => blockId !== null,
						),
					)
				: new Set([segment.blockId]);
		const activeBlockId =
			segment.type === "transition" ? segment.fromBlockId : segment.blockId;

		return {
			activeAnchorIndex:
				activeBlockId === null
					? -1
					: compiled.anchorIndexByBlockId[activeBlockId],
			foregroundBlockIds,
			paintedBlockIds: new Set(paintedAnchors.map((anchor) => anchor.blockId)),
			visibleAnchors,
		};
	});
}
