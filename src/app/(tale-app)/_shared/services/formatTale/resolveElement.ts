import type {
	AnimationSelection,
	RawTaleRecord,
	ResolvedTaleElement,
	Tale,
} from "../../types";
import { adjacentIds, indexPosition } from "./shared";

type FragmentStructure = {
	sceneId: string;
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
export function resolveElement(
	fragment: RawTaleRecord["elements"][number],
	structure: FragmentStructure,
): ResolvedTaleElement {
	const globalLinks = adjacentIds(structure.globalIds, fragment.id);
	const blockLinks = adjacentIds(structure.siblingIds, fragment.id);
	return {
		...fragment,
		sceneId: structure.sceneId,
		branchId: structure.branchId,
		entryId: structure.entryId,
		links: {
			nextElementId: globalLinks.next,
			nextElementIdInScene: blockLinks.next,
			previousElementId: globalLinks.previous,
			previousElementIdInScene: blockLinks.previous,
		},
		pageId: structure.pageId,
		partId: structure.partId,
		position: {
			...indexPosition(structure.globalIndex, structure.globalIds.length),
			isFirstInScene: blockLinks.index === 0,
			isLastInScene: blockLinks.index === structure.siblingIds.length - 1,
		},
		resolvedAnimations: {
			ambient: resolveAnimations(fragment.animations.ambient),
			ambientCycleDurationMs:
				fragment.animations.ambient.cycleDurationMs ?? 2400,
			ambientPlayback: fragment.animations.ambient.playback ?? "alternate",
			intro: resolveAnimations(fragment.animations.intro),
			outro: resolveAnimations(fragment.animations.outro),
			active: resolveAnimations(fragment.animations.active),
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
	fragment: RawTaleRecord["elements"][number],
): ResolvedTaleElement {
	const current = tale.indexMap.elementsById[fragment.id];
	return resolveElement(
		fragment,
		current
			? {
					sceneId: current.sceneId,
					branchId: current.branchId,
					entryId: current.entryId,
					globalIds: tale.order.elementIds,
					globalIndex: current.position.index,
					pageId: current.pageId,
					partId: current.partId,
					siblingIds:
						tale.indexMap.scenesById[current.sceneId]?.elementIds ?? [],
				}
			: {
					sceneId: "",
					branchId: "",
					entryId: "",
					globalIds: tale.order.elementIds,
					globalIndex: tale.order.elementIds.indexOf(fragment.id),
					pageId: "",
					partId: "",
					siblingIds: [],
				},
	);
}
