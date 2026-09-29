import type {
	ResolvedTaleElement,
	ResolvedTaleScene,
	Tale,
	TaleFrame,
	TaleScene,
} from "../../types";
import { getTaleScenes } from "../taleLookups";
import { resolveAnimations } from "./resolveElement";
import {
	createElementPlacementBuckets,
	resolveSceneFrames,
} from "./resolveFrames";
import { adjacentIds, groupIdsBy, indexPosition } from "./shared";

type SceneLookups = {
	elementsById: Record<string, ResolvedTaleElement>;
	framesById: Record<string, TaleFrame>;
};

export type SceneStructureLookups = {
	sceneIds: string[];
	sceneIdsByBranch: Record<string, string[]>;
	sceneIdsByEntry: Record<string, string[]>;
	sceneIdsByPage: Record<string, string[]>;
	sceneIdsByPart: Record<string, string[]>;
};

/**
 * Formats one block with fragment, node, relationship, and preset metadata.
 *
 * @param block - Raw block.
 * @param lookups - Resolved preset and fragment lookups.
 * @param structure - Scene relationship lookups.
 * @returns Resolved block.
 */
export function resolveScene(
	scene: TaleScene,
	lookups: SceneLookups,
	structure: SceneStructureLookups,
): ResolvedTaleScene {
	const fragments = scene.elementIds.flatMap((id) => {
		const fragment = lookups.elementsById[id];
		return fragment ? [fragment] : [];
	});
	const buckets = createElementPlacementBuckets(fragments);
	const { frames, rootFrameId } = resolveSceneFrames(
		scene,
		buckets,
		lookups.framesById,
	);
	for (const frame of frames) lookups.framesById[frame.id] = frame;
	const globalLinks = adjacentIds(structure.sceneIds, scene.id);
	const branchLinks = adjacentIds(
		structure.sceneIdsByBranch[scene.branchId] ?? [],
		scene.id,
	);
	const entryLinks = adjacentIds(
		structure.sceneIdsByEntry[scene.entryId] ?? [],
		scene.id,
	);
	const pageLinks = adjacentIds(
		structure.sceneIdsByPage[scene.pageId] ?? [],
		scene.id,
	);
	const partLinks = adjacentIds(
		structure.sceneIdsByPart[scene.partId] ?? [],
		scene.id,
	);

	return {
		...scene,
		...buckets,
		links: {
			nextSceneId: globalLinks.next,
			nextSceneIdInBranch: branchLinks.next,
			nextSceneIdInEntry: entryLinks.next,
			nextSceneIdInPage: pageLinks.next,
			nextSceneIdInPart: partLinks.next,
			previousSceneId: globalLinks.previous,
			previousSceneIdInBranch: branchLinks.previous,
			previousSceneIdInEntry: entryLinks.previous,
			previousSceneIdInPage: pageLinks.previous,
			previousSceneIdInPart: partLinks.previous,
		},
		frameIds: frames.map((frame) => frame.id),
		rootFrameId,
		position: {
			...indexPosition(globalLinks.index, structure.sceneIds.length),
			branchIndex: branchLinks.index,
			entryIndex: entryLinks.index,
			isFirstInBranch: branchLinks.index === 0,
			isFirstInEntry: entryLinks.index === 0,
			isFirstInPage: pageLinks.index === 0,
			isFirstInPart: partLinks.index === 0,
			isLastInBranch:
				branchLinks.index ===
				(structure.sceneIdsByBranch[scene.branchId]?.length ?? 0) - 1,
			isLastInEntry:
				entryLinks.index ===
				(structure.sceneIdsByEntry[scene.entryId]?.length ?? 0) - 1,
			isLastInPage:
				pageLinks.index ===
				(structure.sceneIdsByPage[scene.pageId]?.length ?? 0) - 1,
			isLastInPart:
				partLinks.index ===
				(structure.sceneIdsByPart[scene.partId]?.length ?? 0) - 1,
			isPageScene: pageLinks.index >= 0,
			pageIndex: pageLinks.index,
			partIndex: partLinks.index,
		},
		resolved: {
			background: resolveSceneBackground(scene),
			flow: scene.transition.flow,
			hasImage: fragments.some((fragment) => fragment.type === "image"),
			readingAnimations: {
				ambient: resolveAnimations(scene.reading.animations.ambient),
				ambientCycleDurationMs:
					scene.reading.animations.ambient.cycleDurationMs ?? 2400,
				ambientPlayback:
					scene.reading.animations.ambient.playback ?? "alternate",
				sceneActive: resolveAnimations(
					scene.reading.animations.sceneActive ?? { animations: [] },
				),
				active: resolveAnimations(scene.reading.animations.active),
			},
			style: scene.style ?? {},
			transitionAnimations: {
				intro: resolveAnimations(scene.transition.animations.intro),
				outro: resolveAnimations(scene.transition.animations.outro),
				previousVisible: resolveAnimations(
					scene.transition.animations.previousVisible,
				),
			},
		},
	};
}

/**
 * Re-resolves an inspector-edited block inside the formatted tale.
 *
 * @param tale - Current formatted tale.
 * @param block - Edited raw block fields.
 * @returns Updated resolved block.
 */
export function resolveEditedScene(
	tale: Tale,
	scene: TaleScene,
): ResolvedTaleScene {
	return resolveEditedSceneWithFrames(tale, scene).scene;
}

export function resolveEditedSceneWithFrames(
	tale: Tale,
	scene: TaleScene,
): { scene: ResolvedTaleScene; framesById: Record<string, TaleFrame> } {
	const scenes = getTaleScenes(tale);
	const framesById = { ...tale.indexMap.framesById };
	const resolvedScene = resolveScene(
		scene,
		{
			elementsById: tale.indexMap.elementsById,
			framesById,
		},
		{
			sceneIds: tale.order.sceneIds,
			sceneIdsByBranch: groupIdsBy(
				scenes,
				(item) => item.branchId,
				(item) => item.id,
			),
			sceneIdsByEntry: groupIdsBy(
				scenes,
				(item) => item.entryId,
				(item) => item.id,
			),
			sceneIdsByPage: groupIdsBy(
				scenes,
				(item) => item.pageId,
				(item) => item.id,
			),
			sceneIdsByPart: groupIdsBy(
				scenes,
				(item) => item.partId,
				(item) => item.id,
			),
		},
	);
	return { scene: resolvedScene, framesById };
}

/**
 * Resolves inline and preset block background styling.
 *
 * @param block - Raw block style configuration.
 * @returns CSS background value.
 */
function resolveSceneBackground(block: TaleScene): string {
	if (block.style?.backgroundImage || block.style?.backgroundCss) {
		const backgroundPosition = block.style.backgroundPosition ?? "center";
		const backgroundRepeat = block.style.backgroundRepeat ?? "no-repeat";
		const backgroundSize = block.style.backgroundSize ?? "cover";
		return [
			block.style.backgroundImage
				? `url(${block.style.backgroundImage}) ${backgroundPosition} / ${backgroundSize} ${backgroundRepeat}`
				: null,
			block.style.backgroundCss,
		]
			.filter(Boolean)
			.join(", ");
	}
	return block.style?.background ?? "#0d0b08";
}
