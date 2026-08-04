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
		const paintedAnchors =
			segment.type === "transition"
				? [segment.from, segment.to]
				: [segment.anchor];
		const visibleAnchors =
			segment.type === "transition"
				? getUniqueAnchors([segment.from, segment.to])
				: [segment.anchor];
		const foregroundBlockIds =
			segment.type === "transition"
				? new Set([segment.from.block.id, segment.to.block.id])
				: new Set([segment.anchor.block.id]);
		const activeBlockId =
			segment.type === "transition"
				? segment.from.block.id
				: segment.anchor.block.id;

		return {
			activeAnchorIndex: compiled.anchorIndexByBlockId[activeBlockId],
			foregroundBlockIds,
			paintedBlockIds: new Set(paintedAnchors.map((anchor) => anchor.block.id)),
			visibleAnchors,
		};
	});
}
