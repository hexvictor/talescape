import type {
	AnimationSelection,
	RawTaleRecord,
	ResolvedTaleFragment,
	Tale,
} from "../../types";
import { adjacentIds, indexPosition } from "./shared";

type FragmentStructure = {
	blockId: string;
	branchId: string;
	entryId: string;
	globalIndex: number;
	globalIds: string[];
	pageId: string;
	partId: string;
	siblingIds: string[];
};

/**
 * Resolves animation preset references into concrete tracks.
 *
 * @param selection - Inline and preset animation selection.
 * @returns Flattened animation tracks.
 */
export function resolveAnimations(selection: AnimationSelection) {
	return selection.animations;
}

/**
 * Formats one raw fragment with structural and resolved animation metadata.
 *
 * @param fragment - Raw fragment.
 * @param structure - Parent and ordering metadata.
 * @returns Resolved fragment.
 */
export function resolveFragment(
	fragment: RawTaleRecord["fragments"][number],
	structure: FragmentStructure,
): ResolvedTaleFragment {
	const globalLinks = adjacentIds(structure.globalIds, fragment.id);
	const blockLinks = adjacentIds(structure.siblingIds, fragment.id);
	return {
		...fragment,
		blockId: structure.blockId,
		branchId: structure.branchId,
		entryId: structure.entryId,
		links: {
			nextFragmentId: globalLinks.next,
			nextFragmentIdInBlock: blockLinks.next,
			previousFragmentId: globalLinks.previous,
			previousFragmentIdInBlock: blockLinks.previous,
		},
		pageId: structure.pageId,
		partId: structure.partId,
		position: {
			...indexPosition(structure.globalIndex, structure.globalIds.length),
			isFirstInBlock: blockLinks.index === 0,
			isLastInBlock: blockLinks.index === structure.siblingIds.length - 1,
		},
		resolvedAnimations: {
			ambient: resolveAnimations(fragment.animations.ambient),
			ambientCycleDurationMs:
				fragment.animations.ambient.cycleDurationMs ?? 2400,
			ambientPlayback: fragment.animations.ambient.playback ?? "alternate",
			entering: resolveAnimations(fragment.animations.entering),
			leaving: resolveAnimations(fragment.animations.leaving),
			scrolling: resolveAnimations(fragment.animations.scrolling),
		},
		resolvedVisibleRange: fragment.visibleRange ?? { end: 1, start: 0 },
	};
}

/**
 * Re-resolves an inspector-edited fragment inside the formatted tale.
 *
 * @param tale - Current formatted tale.
 * @param fragment - Edited raw fragment fields.
 * @returns Updated resolved fragment.
 */
export function resolveEditedFragment(
	tale: Tale,
	fragment: RawTaleRecord["fragments"][number],
): ResolvedTaleFragment {
	const current = tale.indexMap.fragmentsById[fragment.id];
	return resolveFragment(
		fragment,
		current
			? {
					blockId: current.blockId,
					branchId: current.branchId,
					entryId: current.entryId,
					globalIds: tale.order.fragmentIds,
					globalIndex: current.position.index,
					pageId: current.pageId,
					partId: current.partId,
					siblingIds:
						tale.indexMap.blocksById[current.blockId]?.fragmentIds ?? [],
				}
			: {
					blockId: "",
					branchId: "",
					entryId: "",
					globalIds: tale.order.fragmentIds,
					globalIndex: tale.order.fragmentIds.indexOf(fragment.id),
					pageId: "",
					partId: "",
					siblingIds: [],
				},
	);
}
