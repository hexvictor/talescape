import type {
	RawTaleRecord,
	ResolvedTaleKeyframe,
	Tale,
	TaleScene,
} from "../types";
import { resolveElement } from "./formatTale/resolveElement";
import {
	resolveBranches,
	resolveEntries,
	resolvePages,
	resolveParts,
	resolvePaths,
} from "./formatTale/resolveNarrative";
import {
	type SceneStructureLookups,
	resolveScene,
} from "./formatTale/resolveScene";
import {
	first,
	groupIdsBy,
	indexPosition,
	last,
	recordById,
	sortedByOrder,
} from "./formatTale/shared";

export {
	resolveEditedScene,
	resolveEditedSceneWithFrames,
} from "./formatTale/resolveScene";
export { resolveEditedFragment } from "./formatTale/resolveElement";

/**
 * Formats raw database reader data into the indexed engine model.
 *
 * @param raw - Raw tale record and related entities.
 * @returns Fully resolved tale structure used by the reader.
 *
 * @example
 * const tale = formatTale(rawRecord);
 */
export function formatTale(raw: RawTaleRecord): Tale {
	const animationPresetsById = recordById(raw.animationPresets);
	const visibilityPresetsById = recordById(raw.visibilityPresets);
	const rawBlocks = raw.scenes;
	const rawBranches = sortedByOrder(raw.branches);
	const rawEntries = sortedByOrder(raw.entries);
	const rawParts = sortedByOrder(raw.parts);
	const rawPaths = raw.paths;
	const rawPages = raw.pages;
	const rawElements = raw.elements;
	const rawFrames = raw.frames;
	const rawKeyframes = sortedByOrder(raw.keyframes);
	const framesById = recordById(rawFrames);
	const sceneIds = rawBlocks.map((block) => block.id);
	const branchIds = rawBranches.map((branch) => branch.id);
	const entryIds = rawEntries.map((entry) => entry.id);
	const elementIds = rawElements.map((element) => element.id);
	const frameIds = rawFrames.map((frame) => frame.id);
	const keyframeIds = rawKeyframes.map((step) => step.id);
	const pageIds = rawPages.map((page) => page.id);
	const numberedPageIds = rawPages
		.filter((page) => page.isPaginated)
		.map((page) => page.id);
	const partIds = rawParts.map((part) => part.id);
	const pathIds = rawPaths.map((path) => path.id);
	const blockStructure = createSceneStructureLookups(rawBlocks, sceneIds);
	const elementToScene = createElementSceneLookup(rawBlocks);
	const elements = rawElements.map((element, globalIndex) => {
		const scene = elementToScene.get(element.id);
		return resolveElement(element, {
			sceneId: scene?.id ?? "",
			branchId: scene?.branchId ?? "",
			entryId: scene?.entryId ?? "",
			globalIds: elementIds,
			globalIndex,
			pageId: scene?.pageId ?? "",
			partId: scene?.partId ?? "",
			siblingIds: scene?.elementIds ?? [],
		});
	});
	const resolvedElementsById = recordById(elements);
	const keyframes = resolveKeyframes(rawKeyframes);
	const branches = resolveBranches(
		rawBranches,
		rawPaths,
		blockStructure.sceneIdsByBranch,
	);
	const entries = resolveEntries(rawEntries, rawBlocks, rawPages, rawKeyframes);
	const pages = resolvePages(rawPages, rawEntries, rawBlocks, rawKeyframes);
	const parts = resolveParts(
		rawParts,
		rawEntries,
		rawPages,
		rawBlocks,
		rawKeyframes,
	);
	const paths = resolvePaths(rawPaths);
	const sceneStylePresetsById = recordById(raw.sceneStylePresets);
	const transitionPresetsById = recordById(raw.transitionPresets);
	const scenes = rawBlocks.map((block) =>
		resolveScene(
			block,
			{
				elementsById: resolvedElementsById,
				framesById,
			},
			blockStructure,
		),
	);
	const rootBranchId =
		branches.find((branch) => branch.position.isRootBranch)?.id ??
		first(branchIds);

	return {
		backgroundConfig: raw.backgroundConfig,
		book: null,
		breakpoints: raw.breakpoints,
		creator: null,
		firstSceneTransitionMode: raw.firstSceneTransitionMode,
		id: raw.id,
		playbackConfig: raw.playbackConfig,
		slug: raw.slug,
		snapConfig: raw.snapConfig,
		synopsis: raw.synopsis,
		title: raw.title,
		bounds: {
			firstSceneId: first(sceneIds),
			firstBranchId: first(branchIds),
			firstEntryId: first(entryIds),
			firstElementId: first(elementIds),
			firstPageId: first(pageIds),
			firstPartId: first(partIds),
			lastSceneId: last(sceneIds),
			lastBranchId: last(branchIds),
			lastEntryId: last(entryIds),
			lastElementId: last(elementIds),
			lastPageId: last(pageIds),
			lastPartId: last(partIds),
			rootBranchId,
		},
		counts: {
			scenes: scenes.length,
			branches: branches.length,
			entries: entries.length,
			elements: elements.length,
			frames: rawFrames.filter(
				(frame) => !scenes.some((scene) => scene.rootFrameId === frame.id),
			).length,
			pages: pages.length,
			parts: parts.length,
			paths: paths.length,
			keyframes: keyframes.length,
		},
		indexMap: {
			animationPresetsById,
			scenesById: recordById(scenes),
			sceneStylePresetsById,
			branchesById: recordById(branches),
			entriesById: recordById(entries),
			elementsById: resolvedElementsById,
			framesById,
			pagesById: recordById(pages),
			partsById: recordById(parts),
			pathsById: recordById(paths),
			keyframesById: recordById(keyframes),
			transitionPresetsById,
			visibilityPresetsById,
		},
		order: {
			animationPresetIds: raw.animationPresets.map((preset) => preset.id),
			sceneIds,
			sceneStylePresetIds: raw.sceneStylePresets.map((preset) => preset.id),
			branchIds,
			entryIds,
			elementIds,
			frameIds,
			numberedPageIds,
			pageIds,
			partIds,
			pathIds,
			keyframeIds,
			transitionPresetIds: raw.transitionPresets.map((preset) => preset.id),
			visibilityPresetIds: raw.visibilityPresets.map((preset) => preset.id),
		},
	};
}

/**
 * Groups block ids by each narrative relationship.
 *
 * @param scenes - Raw tale scenes.
 * @param sceneIds - Global block order.
 * @returns Scene relationship lookups.
 */
function createSceneStructureLookups(
	scenes: TaleScene[],
	sceneIds: string[],
): SceneStructureLookups {
	return {
		sceneIds,
		sceneIdsByBranch: groupIdsBy(
			scenes,
			(block) => block.branchId,
			(block) => block.id,
		),
		sceneIdsByEntry: groupIdsBy(
			scenes,
			(block) => block.entryId,
			(block) => block.id,
		),
		sceneIdsByPage: groupIdsBy(
			scenes,
			(block) => block.pageId,
			(block) => block.id,
		),
		sceneIdsByPart: groupIdsBy(
			scenes,
			(block) => block.partId,
			(block) => block.id,
		),
	};
}

/**
 * Maps fragment ids to their owning raw block.
 *
 * @param scenes - Raw tale scenes.
 * @returns Fragment-to-block lookup.
 */
function createElementSceneLookup(scenes: TaleScene[]): Map<string, TaleScene> {
	const elementToScene = new Map<string, TaleScene>();
	for (const scene of scenes) {
		for (const elementId of scene.elementIds) {
			elementToScene.set(elementId, scene);
		}
	}
	return elementToScene;
}

function resolveKeyframes(keyframes: RawTaleRecord["keyframes"]): ResolvedTaleKeyframe[] {
	const idsByScene = groupIdsBy(
		keyframes,
		(step) => step.sceneId,
		(step) => step.id,
	);
	return keyframes.map((step) => {
		const siblingIds = idsByScene[step.sceneId] ?? [];
		const index = siblingIds.indexOf(step.id);
		return {
			...step,
			links: {
				nextKeyframeId: siblingIds[index + 1] ?? null,
				previousKeyframeId: siblingIds[index - 1] ?? null,
			},
			position: indexPosition(index, siblingIds.length),
		};
	});
}
