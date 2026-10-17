import {
	resolveEditedFragment,
	resolveEditedScene,
	resolveEditedSceneWithFrames,
} from "~/app/(tale-app)/_shared/services/formatTale";
import { resolveElement } from "~/app/(tale-app)/_shared/services/formatTale/resolveElement";
import {
	resolveTaleBreakpoint,
	writeBlockBreakpointOverride,
	writeFragmentBreakpointOverride,
} from "~/app/(tale-app)/_shared/services/resolveTaleBreakpoint";
import { scopeResponsiveFrames } from "~/app/(tale-app)/_shared/services/responsiveFrames";
import {
	getTaleBranches,
	getTaleKeyframes,
	getTalePaths,
	getTaleScenes,
} from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	FrameChild,
	ResolvedTaleBranch,
	ResolvedTaleElement,
	ResolvedTaleKeyframe,
	ResolvedTaleScene,
	Tale,
	TaleBranch,
	TaleElement,
	TaleFrame,
	TaleKeyframe,
	TalePath,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";

export type DraftElementInput =
	| {
			label?: string;
			text?: string;
			type: "text";
	  }
	| {
			alt?: string;
			caption?: string;
			fallbackSrc?: string;
			label?: string;
			src?: string;
			type: "image";
	  }
	| {
			label?: string;
			src?: string;
			type: "audio";
	  };

let draftSequence = 0;

function createDraftId(): string {
	draftSequence += 1;
	return String(-(Date.now() + draftSequence));
}

export function editKeyframe(
	tale: Tale,
	keyframeId: string,
	update: (step: ResolvedTaleKeyframe) => TaleKeyframe,
	breakpointId: string | null = null,
): Tale {
	const current = tale.indexMap.keyframesById[keyframeId];
	if (!current) return tale;
	const effective = {
		...current,
		...(breakpointId ? current.responsiveOverrides?.[breakpointId] : {}),
	};
	const edited = update(effective);
	const next = breakpointId
		? {
				...current,
				responsiveOverrides: {
					...current.responsiveOverrides,
					[breakpointId]: {
						actions: edited.actions,
						autoplay: edited.autoplay,
						reading: edited.reading,
						transition: edited.transition,
						snap: edited.snap,
						pageId: edited.pageId,
						order: edited.order,
					},
				},
			}
		: edited;
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			keyframesById: {
				...tale.indexMap.keyframesById,
				[keyframeId]: { ...current, ...next },
			},
		},
	};
}

export function editScene(
	tale: Tale,
	sceneId: string,
	update: (block: ResolvedTaleScene) => TaleScene,
	breakpointId: string | null = null,
): Tale {
	const current = resolveTaleBreakpoint(tale, breakpointId).indexMap.scenesById[
		sceneId
	];
	if (!current) return tale;

	const nextBlock = update(current);
	const baseBlock = tale.indexMap.scenesById[sceneId];
	if (!baseBlock) return tale;
	const block = resolveEditedScene(
		tale,
		writeBlockBreakpointOverride(baseBlock, nextBlock, breakpointId),
	);
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			scenesById: { ...tale.indexMap.scenesById, [sceneId]: block },
		},
	};
}

/** Updates whether a narrative Page participates in page numbering. */
export function editPagePagination(
	tale: Tale,
	pageId: string,
	isPaginated: boolean,
): Tale {
	const page = tale.indexMap.pagesById[pageId];
	if (!page) return tale;
	const pagesById = {
		...tale.indexMap.pagesById,
		[page.id]: { ...page, isPaginated },
	};
	const numberedPageIds = tale.order.pageIds.filter(
		(pageId) => pagesById[pageId]?.isPaginated,
	);
	const numberByPageId = new Map(
		numberedPageIds.map((pageId, index) => [pageId, index + 1]),
	);
	const scenesById = Object.fromEntries(
		Object.values(tale.indexMap.scenesById).map((item) => [
			item.id,
			{
				...item,
				isPaginated: pagesById[item.pageId]?.isPaginated ?? false,
				pageNumber: numberByPageId.get(item.pageId) ?? null,
			},
		]),
	) as Tale["indexMap"]["scenesById"];
	return {
		...tale,
		indexMap: { ...tale.indexMap, scenesById, pagesById },
		order: { ...tale.order, numberedPageIds },
	};
}

export function editSceneFrames(
	tale: Tale,
	sceneId: string,
	nodes: TaleFrame[],
	rootFrameId: string,
	breakpointId: string | null = null,
): Tale {
	const block = tale.indexMap.scenesById[sceneId];
	if (!block) return tale;
	const scoped = breakpointId
		? scopeResponsiveFrames(sceneId, breakpointId, nodes, rootFrameId)
		: { frames: nodes, rootFrameId };
	const framesById = { ...tale.indexMap.framesById };
	for (const node of scoped.frames) framesById[node.id] = node;
	const nextBlock = breakpointId
		? {
				...block,
				responsiveOverrides: {
					...(block.responsiveOverrides ?? {}),
					[breakpointId]: {
						...(block.responsiveOverrides?.[breakpointId] ?? {}),
						frameIds: scoped.frames.map((node) => node.id),
						rootFrameId: scoped.rootFrameId,
					},
				},
			}
		: {
				...block,
				frameIds: scoped.frames.map((node) => node.id),
				rootFrameId: scoped.rootFrameId,
			};
	const nextTale = {
		...tale,
		indexMap: { ...tale.indexMap, framesById },
		order: {
			...tale.order,
			frameIds: [
				...new Set([
					...tale.order.frameIds,
					...scoped.frames.map((node) => node.id),
				]),
			],
		},
	};
	const resolvedBlock = resolveEditedScene(nextTale, nextBlock);
	return {
		...nextTale,
		indexMap: {
			...nextTale.indexMap,
			scenesById: {
				...nextTale.indexMap.scenesById,
				[sceneId]: resolvedBlock,
			},
		},
	};
}

export function addDraftScene(
	tale: Tale,
	branchId: string,
	title = "New Scene",
): Tale {
	const branch = tale.indexMap.branchesById[branchId];
	if (!branch) return tale;
	const scenes = getTaleScenes(tale);
	const branchScenes = scenes.filter((scene) => scene.branchId === branchId);
	const template = branchScenes.at(-1) ?? scenes[0];
	if (!template) return tale;

	const sceneId = createDraftId();
	const scene = resolveEditedScene(tale, {
		...template,
		branchId,
		description: "",
		elementIds: [],
		entryId: template.entryId,
		frameIds: [],
		id: sceneId,
		isChoiceScene: false,
		isPaginated: false,
		keyframeIds: [],
		order: branchScenes.length,
		pageId: template.pageId,
		pageNumber: null,
		partId: template.partId,
		rootFrameId: undefined,
		container: template.container ?? { mode: "stack" },
		title,
	});

	return rebuildTaleSceneCollections(tale, [...scenes, scene]);
}

export function removeDraftScene(tale: Tale, sceneId: string): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	if (!scene) return tale;
	const branchScenes = getTaleScenes(tale).filter(
		(item) => item.branchId === scene.branchId,
	);
	if (branchScenes.length <= 1) return tale;
	const removedFrameIds = new Set(scene.frameIds);
	const removedKeyframeIds = new Set(scene.keyframeIds);
	const removedElementIds = new Set(scene.elementIds);
	const framesById = { ...tale.indexMap.framesById };
	const keyframesById = { ...tale.indexMap.keyframesById };
	const elementsById = { ...tale.indexMap.elementsById };
	for (const id of removedFrameIds) delete framesById[id];
	for (const id of removedKeyframeIds) delete keyframesById[id];
	for (const id of removedElementIds) delete elementsById[id];
	return rebuildTaleSceneCollections(
		{
			...tale,
			indexMap: {
				...tale.indexMap,
				elementsById,
				framesById,
				keyframesById,
				pathsById: Object.fromEntries(
					tale.order.pathIds.flatMap((id) => {
						const path = tale.indexMap.pathsById[id];
						return path &&
							path.fromSceneId !== sceneId &&
							path.toSceneId !== sceneId
							? [[id, path]]
							: [];
					}),
				) as Tale["indexMap"]["pathsById"],
			},
			order: {
				...tale.order,
				elementIds: tale.order.elementIds.filter(
					(id) => !removedElementIds.has(id),
				),
				frameIds: tale.order.frameIds.filter((id) => !removedFrameIds.has(id)),
				keyframeIds: tale.order.keyframeIds.filter(
					(id) => !removedKeyframeIds.has(id),
				),
				pathIds: tale.order.pathIds.filter((id) => {
					const path = tale.indexMap.pathsById[id];
					return (
						path && path.fromSceneId !== sceneId && path.toSceneId !== sceneId
					);
				}),
			},
		},
		getTaleScenes(tale).filter((item) => item.id !== sceneId),
	);
}

export function addDraftFrame(
	tale: Tale,
	sceneId: string,
	name?: string,
): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	if (!scene) return tale;
	const authoredFrameIds = scene.frameIds.filter((id) => {
		const item = tale.indexMap.framesById[id];
		return item && item.kind !== "group" && item.parentFrameId === null;
	});
	const existingKeyframeIds = scene.keyframeIds.filter(
		(id) => tale.indexMap.keyframesById[id] !== undefined,
	);
	const frameId = createDraftId();
	const introKeyframeId = createDraftId();
	const activeKeyframeId = createDraftId();
	const frame: TaleFrame = {
		animations: emptyElementAnimations(),
		children: [],
		id: frameId,
		name: name?.trim() || `Frame ${authoredFrameIds.length + 1}`,
		mode: "stack",
		overflow: "clip",
		parentFrameId: null,
		style: { height: "100%", width: "100%" },
	};
	const introKeyframe = createDraftKeyframeRecord({
		branchId: scene.branchId,
		frameId,
		id: introKeyframeId,
		order: existingKeyframeIds.length,
		sceneId,
		title: "Intro",
	});
	const activeKeyframe = createDraftKeyframeRecord({
		branchId: scene.branchId,
		frameId,
		id: activeKeyframeId,
		order: existingKeyframeIds.length + 1,
		sceneId,
		title: "Active",
	});
	const nextScene = resolveEditedScene(
		{
			...tale,
			indexMap: {
				...tale.indexMap,
				framesById: { ...tale.indexMap.framesById, [frameId]: frame },
			},
		},
		{
			...scene,
			frameIds: [...authoredFrameIds, frameId],
			keyframeIds: [...existingKeyframeIds, introKeyframeId, activeKeyframeId],
		},
	);
	return {
		...tale,
		counts: {
			...tale.counts,
			frames: tale.counts.frames + 1,
			keyframes: tale.counts.keyframes + 2,
		},
		indexMap: {
			...tale.indexMap,
			framesById: { ...tale.indexMap.framesById, [frameId]: frame },
			keyframesById: {
				...tale.indexMap.keyframesById,
				[introKeyframeId]: introKeyframe,
				[activeKeyframeId]: activeKeyframe,
			},
			scenesById: { ...tale.indexMap.scenesById, [sceneId]: nextScene },
		},
		order: {
			...tale.order,
			frameIds: [...tale.order.frameIds, frameId],
			keyframeIds: [
				...tale.order.keyframeIds,
				introKeyframeId,
				activeKeyframeId,
			],
		},
	};
}

/** Adds a layout/animation group inside a Frame without creating Keyframes. */
export function addDraftGroup(
	tale: Tale,
	sceneId: string,
	parentFrameId: string,
	name?: string,
): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	const parent = tale.indexMap.framesById[parentFrameId];
	if (!scene || !parent) return tale;
	const groupId = createDraftId();
	const group: TaleFrame = {
		animations: emptyElementAnimations(),
		children: [],
		id: groupId,
		kind: "group",
		name: name?.trim() || "Group",
		mode: "stack",
		overflow: "visible",
		parentFrameId,
		style: { position: "relative" },
	};
	const nextParent = {
		...parent,
		children: [
			...parent.children,
			{ frameId: groupId, type: "frame" as const },
		],
	};
	const nextScene = resolveEditedScene(
		{
			...tale,
			indexMap: {
				...tale.indexMap,
				framesById: {
					...tale.indexMap.framesById,
					[parentFrameId]: nextParent,
					[groupId]: group,
				},
			},
		},
		{
			...scene,
			frameIds: [...scene.frameIds, groupId],
		},
	);
	return {
		...tale,
		counts: { ...tale.counts, frames: tale.counts.frames + 1 },
		indexMap: {
			...tale.indexMap,
			framesById: {
				...tale.indexMap.framesById,
				[parentFrameId]: nextParent,
				[groupId]: group,
			},
			scenesById: { ...tale.indexMap.scenesById, [sceneId]: nextScene },
		},
		order: { ...tale.order, frameIds: [...tale.order.frameIds, groupId] },
	};
}

/** Moves an Element or Group between Frame/Group containers. */
export function moveDraftFrameChild(
	tale: Tale,
	sceneId: string,
	child: FrameChild,
	targetFrameId: string,
): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	const target = tale.indexMap.framesById[targetFrameId];
	if (!scene || !target) return tale;
	if (
		child.type === "frame" &&
		(child.frameId === targetFrameId ||
			isDraftFrameDescendant(tale, targetFrameId, child.frameId))
	)
		return tale;
	const childId = child.type === "element" ? child.elementId : child.frameId;
	const sourceFrame = Object.values(tale.indexMap.framesById).find((frame) =>
		frame.children.some((item) =>
			child.type === "element"
				? item.type === "element" && item.elementId === child.elementId
				: item.type === "frame" && item.frameId === child.frameId,
		),
	);
	const preservedState =
		sourceFrame?.defaultElementStates?.[childId] ?? "inactive";
	const framesById = Object.fromEntries(
		Object.entries(tale.indexMap.framesById).map(([id, frame]) => [
			id,
			{
				...frame,
				defaultElementStates: Object.fromEntries(
					Object.entries(frame.defaultElementStates ?? {}).filter(
						([stateId]) => stateId !== childId,
					),
				),
				children: frame.children.filter((item) =>
					child.type === "element"
						? item.type !== "element" || item.elementId !== child.elementId
						: item.type !== "frame" || item.frameId !== child.frameId,
				),
			},
		]),
	) as Tale["indexMap"]["framesById"];
	framesById[targetFrameId] = {
		...framesById[targetFrameId],
		children: [...(framesById[targetFrameId]?.children ?? []), child],
		defaultElementStates: {
			...(framesById[targetFrameId]?.defaultElementStates ?? {}),
			[childId]: preservedState,
		},
	} as TaleFrame;
	const elementsById = { ...tale.indexMap.elementsById };
	if (child.type === "element") {
		const element = elementsById[child.elementId];
		if (element)
			elementsById[child.elementId] = {
				...element,
				frameId: targetFrameId,
				placement: { ...element.placement, frameId: targetFrameId },
			};
	} else {
		framesById[child.frameId] = {
			...framesById[child.frameId],
			parentFrameId: targetFrameId,
		} as TaleFrame;
	}
	return {
		...tale,
		indexMap: { ...tale.indexMap, elementsById, framesById },
	};
}

/** Updates a default child state, including the explicit group cascade rules. */
export function setDraftFrameChildDefaultState(
	tale: Tale,
	child: FrameChild,
	state: "active" | "inactive",
): Tale {
	const framesById = Object.fromEntries(
		Object.entries(tale.indexMap.framesById).map(([id, frame]) => [
			id,
			{ ...frame, defaultElementStates: { ...frame.defaultElementStates } },
		]),
	) as Tale["indexMap"]["framesById"];
	const childId = child.type === "element" ? child.elementId : child.frameId;
	const directParentId =
		child.type === "element"
			? tale.indexMap.elementsById[child.elementId]?.frameId
			: tale.indexMap.framesById[child.frameId]?.parentFrameId;
	if (!directParentId || !framesById[directParentId]) return tale;
	framesById[directParentId] = setFrameChildState(
		framesById[directParentId] as TaleFrame,
		childId,
		state,
	);
	if (child.type === "frame") {
		const cascade = (frameId: string): void => {
			const frame = framesById[frameId];
			if (!frame) return;
			for (const nested of frame.children) {
				const id =
					nested.type === "element" ? nested.elementId : nested.frameId;
				framesById[frameId] = setFrameChildState(
					framesById[frameId] as TaleFrame,
					id,
					state,
				);
				if (nested.type === "frame") cascade(nested.frameId);
			}
		};
		cascade(child.frameId);
	}
	if (state === "active") {
		let currentGroupId =
			child.type === "frame"
				? child.frameId
				: tale.indexMap.framesById[directParentId]?.kind === "group"
					? directParentId
					: null;
		while (currentGroupId) {
			const parentId = framesById[currentGroupId]?.parentFrameId;
			if (!parentId || !framesById[parentId]) break;
			framesById[parentId] = setFrameChildState(
				framesById[parentId] as TaleFrame,
				currentGroupId,
				"active",
			);
			currentGroupId = framesById[parentId]?.kind === "group" ? parentId : null;
		}
	}
	return { ...tale, indexMap: { ...tale.indexMap, framesById } };
}

function setFrameChildState(
	frame: TaleFrame,
	childId: string,
	state: "active" | "inactive",
): TaleFrame {
	return {
		...frame,
		defaultElementStates: {
			...(frame.defaultElementStates ?? {}),
			[childId]: state,
		},
	} as TaleFrame;
}

function isDraftFrameDescendant(
	tale: Tale,
	frameId: string,
	ancestorId: string,
): boolean {
	let currentId: string | null = frameId;
	const visited = new Set<string>();
	while (currentId && !visited.has(currentId)) {
		if (currentId === ancestorId) return true;
		visited.add(currentId);
		currentId = tale.indexMap.framesById[currentId]?.parentFrameId ?? null;
	}
	return false;
}

export function removeDraftFrame(
	tale: Tale,
	sceneId: string,
	frameId: string,
): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	const target = tale.indexMap.framesById[frameId];
	if (!scene || !target) return tale;
	const progressionFrameCount = scene.frameIds.filter((id) => {
		const frame = tale.indexMap.framesById[id];
		return frame?.kind !== "group" && frame?.parentFrameId === null;
	}).length;
	if (target.kind !== "group" && progressionFrameCount <= 1) return tale;
	const descendantFrameIds = new Set([frameId]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const frame of Object.values(tale.indexMap.framesById)) {
			if (
				frame.parentFrameId &&
				descendantFrameIds.has(frame.parentFrameId) &&
				!descendantFrameIds.has(frame.id)
			) {
				descendantFrameIds.add(frame.id);
				changed = true;
			}
		}
	}
	const removedKeyframeIds = new Set(
		scene.keyframeIds.filter((id) => {
			const keyframe = tale.indexMap.keyframesById[id];
			return keyframe?.frameId && descendantFrameIds.has(keyframe.frameId);
		}),
	);
	const removedElementIds = new Set(
		scene.elementIds.filter((id) => {
			const element = tale.indexMap.elementsById[id];
			return element?.frameId && descendantFrameIds.has(element.frameId);
		}),
	);
	const framesById = { ...tale.indexMap.framesById };
	const keyframesById = { ...tale.indexMap.keyframesById };
	const elementsById = { ...tale.indexMap.elementsById };
	for (const id of descendantFrameIds) delete framesById[id];
	for (const [id, frame] of Object.entries(framesById)) {
		framesById[id] = {
			...frame,
			children: frame.children.filter(
				(child) =>
					child.type !== "frame" || !descendantFrameIds.has(child.frameId),
			),
		} as TaleFrame;
	}
	for (const id of removedKeyframeIds) delete keyframesById[id];
	for (const id of removedElementIds) delete elementsById[id];
	const nextScene = resolveEditedScene(tale, {
		...scene,
		elementIds: scene.elementIds.filter((id) => !removedElementIds.has(id)),
		frameIds: scene.frameIds.filter((id) => !descendantFrameIds.has(id)),
		keyframeIds: scene.keyframeIds.filter((id) => !removedKeyframeIds.has(id)),
	});
	return {
		...tale,
		counts: {
			...tale.counts,
			elements: Math.max(0, tale.counts.elements - removedElementIds.size),
			frames: Math.max(0, tale.counts.frames - descendantFrameIds.size),
			keyframes: Math.max(0, tale.counts.keyframes - removedKeyframeIds.size),
		},
		indexMap: {
			...tale.indexMap,
			elementsById,
			framesById,
			keyframesById,
			scenesById: { ...tale.indexMap.scenesById, [sceneId]: nextScene },
		},
		order: {
			...tale.order,
			elementIds: tale.order.elementIds.filter(
				(id) => !removedElementIds.has(id),
			),
			frameIds: tale.order.frameIds.filter((id) => !descendantFrameIds.has(id)),
			keyframeIds: tale.order.keyframeIds.filter(
				(id) => !removedKeyframeIds.has(id),
			),
		},
	};
}

export function addDraftKeyframe(
	tale: Tale,
	sceneId: string,
	frameId: string,
	title?: string,
): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	if (!scene) return tale;
	const frameKeyframes = getTaleKeyframes(tale).filter(
		(keyframe) => keyframe.sceneId === sceneId && keyframe.frameId === frameId,
	);
	const id = createDraftId();
	const keyframe = createDraftKeyframeRecord({
		branchId: scene.branchId,
		frameId,
		id,
		order: frameKeyframes.length,
		sceneId,
		title: title?.trim() || `Keyframe ${frameKeyframes.length + 1}`,
	});
	const nextScene = resolveEditedScene(tale, {
		...scene,
		keyframeIds: [...scene.keyframeIds, id],
	});
	return {
		...tale,
		counts: { ...tale.counts, keyframes: tale.counts.keyframes + 1 },
		indexMap: {
			...tale.indexMap,
			keyframesById: { ...tale.indexMap.keyframesById, [id]: keyframe },
			scenesById: { ...tale.indexMap.scenesById, [sceneId]: nextScene },
		},
		order: { ...tale.order, keyframeIds: [...tale.order.keyframeIds, id] },
	};
}

export function removeDraftKeyframe(
	tale: Tale,
	sceneId: string,
	keyframeId: string,
): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	const keyframe = tale.indexMap.keyframesById[keyframeId];
	if (!scene || !keyframe?.frameId) return tale;
	const siblings = scene.keyframeIds.filter(
		(id) => tale.indexMap.keyframesById[id]?.frameId === keyframe.frameId,
	);
	if (siblings.length <= 1) return tale;
	const keyframesById = { ...tale.indexMap.keyframesById };
	delete keyframesById[keyframeId];
	const nextScene = resolveEditedScene(tale, {
		...scene,
		keyframeIds: scene.keyframeIds.filter((id) => id !== keyframeId),
	});
	return {
		...tale,
		counts: {
			...tale.counts,
			keyframes: Math.max(0, tale.counts.keyframes - 1),
		},
		indexMap: {
			...tale.indexMap,
			keyframesById,
			scenesById: { ...tale.indexMap.scenesById, [sceneId]: nextScene },
		},
		order: {
			...tale.order,
			keyframeIds: tale.order.keyframeIds.filter((id) => id !== keyframeId),
		},
	};
}

/** Reorders the Keyframes belonging to one Frame without changing scene order. */
export function reorderDraftKeyframes(
	tale: Tale,
	keyframeIds: string[],
	breakpointId: string | null = null,
): Tale {
	return keyframeIds.reduce(
		(nextTale, keyframeId, order) =>
			editKeyframe(
				nextTale,
				keyframeId,
				(keyframe) => ({
					...keyframe,
					order,
				}),
				breakpointId,
			),
		tale,
	);
}

export function editElement(
	tale: Tale,
	elementId: string,
	update: (fragment: ResolvedTaleElement) => TaleElement,
	breakpointId: string | null = null,
): Tale {
	const current = resolveTaleBreakpoint(tale, breakpointId).indexMap
		.elementsById[elementId];
	if (!current) return tale;

	const nextFragment = update(current);
	const baseFragment = tale.indexMap.elementsById[elementId];
	if (!baseFragment) return tale;
	const fragment = resolveEditedFragment(
		tale,
		writeFragmentBreakpointOverride(baseFragment, nextFragment, breakpointId),
	);
	const updatedTale = {
		...tale,
		indexMap: {
			...tale.indexMap,
			elementsById: {
				...tale.indexMap.elementsById,
				[elementId]: fragment,
			},
		},
	};
	if (!breakpointId && fragment.frameId !== baseFragment.frameId) {
		const framesById = { ...updatedTale.indexMap.framesById };
		for (const id of tale.indexMap.scenesById[current.sceneId]?.frameIds ??
			[]) {
			const frame = framesById[id];
			if (!frame) continue;
			const children = frame.children.filter(
				(child) => child.type !== "element" || child.elementId !== elementId,
			);
			if (id === fragment.frameId)
				children.push({ type: "element", elementId });
			framesById[id] = { ...frame, children };
		}
		updatedTale.indexMap.framesById = framesById;
	}
	const scenes = getTaleScenes(tale).map((block) =>
		block.elementIds.includes(elementId)
			? resolveEditedScene(updatedTale, block)
			: block,
	);
	const scenesById = Object.fromEntries(
		scenes.map((block) => [block.id, block]),
	) as Record<string, ResolvedTaleScene>;

	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			scenesById,
			elementsById: updatedTale.indexMap.elementsById,
			framesById: updatedTale.indexMap.framesById,
		},
	};
}

/** Adds an Element to a Frame, or a positioned Element directly to a Scene. */
export function addDraftElement(
	tale: Tale,
	sceneId: string,
	frameId: string | null,
	input: DraftElementInput | string = "Text element",
): Tale {
	const scene = tale.indexMap.scenesById[sceneId];
	const frame = frameId ? tale.indexMap.framesById[frameId] : undefined;
	if (!scene || (frameId && (!frame || !scene.frameIds.includes(frameId))))
		return tale;
	const id = createDraftId();
	const draft =
		typeof input === "string"
			? ({
					label: input,
					text: input,
					type: "text",
				} satisfies DraftElementInput)
			: input;
	const label = getDraftElementLabel(draft);
	const element: TaleElement = {
		animations: emptyElementAnimations(),
		frameId,
		id,
		label,
		order: scene.elementIds.length,
		placement: frameId
			? { frameId, mode: "normal" }
			: {
					mode: "absolute",
					horizontal: "left",
					vertical: "top",
					unit: "px",
					x: 0,
					y: 0,
					overflow: "clip",
					zIndex: draft.type === "image" ? -1 : 10,
				},
		...(frameId === null && draft.type === "image"
			? {
					style: { width: "100%", height: "100%" },
					imageStyle: {
						width: "100%",
						height: "100%",
						objectFit: "cover" as const,
					},
				}
			: {}),
		...getDraftElementContent(draft, label),
	};
	const withOrder = {
		...tale,
		order: { ...tale.order, elementIds: [...tale.order.elementIds, id] },
	};
	const resolvedElement = resolveElement(element, {
		sceneId,
		branchId: scene.branchId,
		entryId: scene.entryId,
		pageId: scene.pageId,
		partId: scene.partId,
		globalIds: withOrder.order.elementIds,
		globalIndex: withOrder.order.elementIds.length - 1,
		siblingIds: [...scene.elementIds, id],
	});
	const nextFrame = frame
		? {
				...frame,
				children: [
					...frame.children,
					{ elementId: id, type: "element" as const },
				],
			}
		: undefined;
	const withElement = {
		...withOrder,
		indexMap: {
			...withOrder.indexMap,
			elementsById: {
				...withOrder.indexMap.elementsById,
				[id]: resolvedElement,
			},
			framesById:
				nextFrame && frameId
					? { ...withOrder.indexMap.framesById, [frameId]: nextFrame }
					: withOrder.indexMap.framesById,
		},
	};
	const nextScene = resolveEditedScene(withElement, {
		...scene,
		elementIds: [...scene.elementIds, id],
	});
	return {
		...withElement,
		counts: {
			...withElement.counts,
			elements: withElement.counts.elements + 1,
		},
		indexMap: {
			...withElement.indexMap,
			scenesById: { ...withElement.indexMap.scenesById, [sceneId]: nextScene },
		},
	};
}

function getDraftElementLabel(input: DraftElementInput): string {
	const fallback =
		input.type === "image"
			? "Image element"
			: input.type === "audio"
				? "Audio element"
				: "Text element";
	return input.label?.trim() || fallback;
}

function getDraftElementContent(
	input: DraftElementInput,
	label: string,
): Pick<
	TaleElement,
	"alt" | "caption" | "fallbackSrc" | "mediaPlayback" | "src" | "text" | "type"
> {
	if (input.type === "image") {
		return {
			alt: input.alt?.trim() || label,
			caption: input.caption?.trim() || undefined,
			fallbackSrc: input.fallbackSrc?.trim() || undefined,
			src: input.src?.trim() || null,
			type: "image",
		};
	}
	if (input.type === "audio") {
		return {
			mediaPlayback: {
				loop: false,
				maxVolume: 1,
				mode: "controls",
				scope: "scene",
			},
			src: input.src?.trim() || null,
			type: "audio",
		};
	}
	return {
		text: input.text?.trim() || label,
		type: "text",
	};
}

/** Removes an Element and its Keyframe actions from the local Studio draft. */
export function removeDraftElement(tale: Tale, elementId: string): Tale {
	const element = tale.indexMap.elementsById[elementId];
	if (!element) return tale;
	const scene = tale.indexMap.scenesById[element.sceneId];
	if (!scene) return tale;
	const framesById = Object.fromEntries(
		Object.entries(tale.indexMap.framesById).map(([id, frame]) => [
			id,
			{
				...frame,
				children: frame.children.filter(
					(child) => child.type !== "element" || child.elementId !== elementId,
				),
			},
		]),
	) as Tale["indexMap"]["framesById"];
	const keyframesById = Object.fromEntries(
		Object.entries(tale.indexMap.keyframesById).map(([id, keyframe]) => [
			id,
			{
				...keyframe,
				actions: keyframe.actions.filter(
					(action) => action.targetId !== elementId,
				),
			},
		]),
	) as Tale["indexMap"]["keyframesById"];
	const elementsById = { ...tale.indexMap.elementsById };
	delete elementsById[elementId];
	const withMaps = {
		...tale,
		indexMap: { ...tale.indexMap, elementsById, framesById, keyframesById },
		order: {
			...tale.order,
			elementIds: tale.order.elementIds.filter((id) => id !== elementId),
		},
	};
	const nextScene = resolveEditedScene(withMaps, {
		...scene,
		elementIds: scene.elementIds.filter((id) => id !== elementId),
	});
	return {
		...withMaps,
		counts: {
			...withMaps.counts,
			elements: Math.max(0, withMaps.counts.elements - 1),
		},
		indexMap: {
			...withMaps.indexMap,
			scenesById: { ...withMaps.indexMap.scenesById, [scene.id]: nextScene },
		},
	};
}

/**
 * Applies an in-memory edit to one branch while preserving derived branch metadata.
 *
 * @param tale - Current formatted tale.
 * @param branchId - Branch id to edit.
 * @param update - Function that returns the edited branch fields.
 * @returns Tale with updated branch collections and lookup.
 *
 * @example
 * const next = editBranch(tale, "1", (branch) => ({ ...branch, title: "Route" }));
 */
export function editBranch(
	tale: Tale,
	branchId: string,
	update: (branch: ResolvedTaleBranch) => TaleBranch,
): Tale {
	const current = tale.indexMap.branchesById[branchId];
	if (!current) return tale;

	const branch = { ...current, ...update(current) };
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			branchesById: { ...tale.indexMap.branchesById, [branchId]: branch },
		},
	};
}

/**
 * Applies an in-memory edit to one path and invalidates compiled anchors.
 *
 * @param tale - Current formatted tale.
 * @param pathId - Path id to edit.
 * @param update - Function that returns the edited path fields.
 * @returns Tale with updated path collections and lookup.
 *
 * @example
 * const next = editPath(tale, "4", (path) => ({ ...path, label: "Return" }));
 */
export function editPath(
	tale: Tale,
	pathId: string,
	update: (path: TalePath) => TalePath,
): Tale {
	const current = tale.indexMap.pathsById[pathId];
	if (!current) return tale;
	const path = { ...current, ...update(current) };
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			pathsById: { ...tale.indexMap.pathsById, [pathId]: path },
		},
	};
}

/**
 * Reorders one block inside the current in-memory tale structure.
 *
 * @param tale - Current formatted tale.
 * @param sceneId - Scene being moved.
 * @param targetBranchId - Branch receiving the block.
 * @param targetIndex - Zero-based insertion index inside the target branch.
 * @returns Tale with updated block ordering and branch child lists.
 *
 * @example
 * const next = moveBlockInTale(tale, "4", "2", 0);
 */
export function moveBlockInTale(
	tale: Tale,
	sceneId: string,
	targetBranchId: string,
	targetIndex: number,
): Tale {
	const movingBlock = tale.indexMap.scenesById[sceneId];
	const targetBranch = tale.indexMap.branchesById[targetBranchId];
	if (!movingBlock || !targetBranch) return tale;

	const blocksByBranchId = new Map<string, ResolvedTaleScene[]>();
	for (const block of getTaleScenes(tale)) {
		if (block.id === sceneId) continue;
		const branchBlocks = blocksByBranchId.get(block.branchId) ?? [];
		branchBlocks.push(block);
		blocksByBranchId.set(block.branchId, branchBlocks);
	}
	const targetBlocks = blocksByBranchId.get(targetBranchId) ?? [];
	targetBlocks.splice(
		Math.max(0, Math.min(targetIndex, targetBlocks.length)),
		0,
		{
			...movingBlock,
			branchId: targetBranchId,
		},
	);
	blocksByBranchId.set(targetBranchId, targetBlocks);

	const scenes = getTaleBranches(tale).flatMap((branch) =>
		(blocksByBranchId.get(branch.id) ?? []).map((block, index) =>
			resolveEditedScene(tale, {
				...block,
				branchId: branch.id,
				order: index,
			}),
		),
	);
	return rebuildTaleSceneCollections(tale, scenes);
}

/**
 * Adds an in-memory branch draft to the editor graph.
 *
 * @param tale - Current formatted tale.
 * @returns Tale with a temporary branch draft.
 *
 * @example
 * const next = addDraftBranch(tale);
 */
export function addDraftBranch(tale: Tale, title = "New Branch"): Tale {
	const id = createDraftId();
	const starterSceneId = createDraftId();
	const frameId = createDraftId();
	const keyframeId = createDraftId();
	const elementId = createDraftId();
	const branch: ResolvedTaleBranch = {
		sceneIds: [starterSceneId],
		bounds: {
			firstSceneId: starterSceneId,
			lastSceneId: starterSceneId,
		},
		counts: { scenes: 1 },
		description: "",
		id,
		links: {
			incomingPathIds: [],
			nextBranchId: null,
			outgoingPathIds: [],
			previousBranchId: tale.bounds.lastBranchId,
		},
		order: getTaleBranches(tale).length,
		parentBranchId: tale.bounds.rootBranchId,
		path: `draft/${Math.abs(Number(id))}`,
		position: {
			hasIncomingPaths: false,
			hasOutgoingPaths: false,
			index: getTaleBranches(tale).length,
			isChoiceBranch: false,
			isFirst: false,
			isLast: true,
			isRootBranch: false,
			isTerminalBranch: true,
		},
		title: title.trim() || "New Branch",
	};
	const template = getTaleScenes(tale)[0];
	const branches = [...getTaleBranches(tale), branch];
	const nextTale = {
		...tale,
		counts: { ...tale.counts, branches: branches.length },
		indexMap: {
			...tale.indexMap,
			branchesById: { ...tale.indexMap.branchesById, [id]: branch },
		},
		order: { ...tale.order, branchIds: branches.map((item) => item.id) },
	};
	if (!template) return nextTale;
	const frame: TaleFrame = {
		animations: emptyElementAnimations(),
		children: [{ elementId, type: "element" }],
		id: frameId,
		name: "Opening frame",
		mode: "stack",
		overflow: "clip",
		parentFrameId: null,
		style: { minHeight: "100dvh", minWidth: "100dvw", padding: 32 },
	};
	const element: TaleElement = {
		animations: emptyElementAnimations(),
		frameId,
		id: elementId,
		label: "Branch title",
		order: 0,
		placement: { frameId, mode: "normal" },
		style: { fontSize: "clamp(2rem, 7vw, 6rem)", fontWeight: 900 },
		text: title.trim() || "New Branch",
		type: "text",
	};
	const keyframe = createDraftKeyframeRecord({
		branchId: id,
		frameId,
		id: keyframeId,
		order: 0,
		sceneId: starterSceneId,
		title: "Opening",
	});
	const taleWithStarterItems = {
		...nextTale,
		counts: {
			...nextTale.counts,
			elements: nextTale.counts.elements + 1,
			frames: nextTale.counts.frames + 1,
			keyframes: nextTale.counts.keyframes + 1,
		},
		indexMap: {
			...nextTale.indexMap,
			elementsById: {
				...nextTale.indexMap.elementsById,
				[elementId]: resolveEditedFragment(nextTale, element),
			},
			framesById: { ...nextTale.indexMap.framesById, [frameId]: frame },
			keyframesById: {
				...nextTale.indexMap.keyframesById,
				[keyframeId]: keyframe,
			},
		},
		order: {
			...nextTale.order,
			elementIds: [...nextTale.order.elementIds, elementId],
			frameIds: [...nextTale.order.frameIds, frameId],
			keyframeIds: [...nextTale.order.keyframeIds, keyframeId],
		},
	};
	const resolved = resolveEditedSceneWithFrames(taleWithStarterItems, {
		...template,
		branchId: id,
		elementIds: [elementId],
		id: starterSceneId,
		isChoiceScene: false,
		frameIds: [frameId],
		keyframeIds: [keyframeId],
		order: 0,
		rootFrameId: undefined,
		title: `${title.trim() || "New Branch"} opening`,
	});
	const nextTaleWithNodes = withResolvedNodes(
		taleWithStarterItems,
		resolved.framesById,
	);
	return rebuildTaleSceneCollections(nextTaleWithNodes, [
		...getTaleScenes(nextTale),
		resolved.scene,
	]);
}

/** Removes a non-root Branch subtree and every structural item that belongs only to it. */
export function removeDraftBranch(tale: Tale, branchId: string): Tale {
	if (branchId === tale.bounds.rootBranchId) return tale;
	const branch = tale.indexMap.branchesById[branchId];
	if (!branch || tale.order.branchIds.length <= 1) return tale;
	const branchIds = getBranchSubtreeIds(tale, branchId);
	const sceneIds = new Set(
		getTaleScenes(tale)
			.filter((scene) => branchIds.has(scene.branchId))
			.map((scene) => scene.id),
	);
	const frameIds = new Set<string>();
	const keyframeIds = new Set<string>();
	const elementIds = new Set<string>();
	for (const sceneId of sceneIds) {
		const scene = tale.indexMap.scenesById[sceneId];
		if (!scene) continue;
		for (const id of scene.frameIds) frameIds.add(id);
		for (const id of scene.keyframeIds) keyframeIds.add(id);
		for (const id of scene.elementIds) elementIds.add(id);
	}
	const pathsById = Object.fromEntries(
		Object.entries(tale.indexMap.pathsById).filter(
			([, path]) =>
				!branchIds.has(path.fromBranchId) &&
				!branchIds.has(path.toBranchId) &&
				!sceneIds.has(path.fromSceneId) &&
				!sceneIds.has(path.toSceneId),
		),
	) as Tale["indexMap"]["pathsById"];
	const next = {
		...tale,
		counts: {
			...tale.counts,
			branches: Math.max(0, tale.counts.branches - branchIds.size),
			elements: Math.max(0, tale.counts.elements - elementIds.size),
			frames: Math.max(0, tale.counts.frames - frameIds.size),
			keyframes: Math.max(0, tale.counts.keyframes - keyframeIds.size),
			paths: Object.keys(pathsById).length,
		},
		indexMap: {
			...tale.indexMap,
			branchesById: Object.fromEntries(
				Object.entries(tale.indexMap.branchesById).filter(
					([id]) => !branchIds.has(id),
				),
			) as Tale["indexMap"]["branchesById"],
			elementsById: Object.fromEntries(
				Object.entries(tale.indexMap.elementsById).filter(
					([id]) => !elementIds.has(id),
				),
			) as Tale["indexMap"]["elementsById"],
			framesById: Object.fromEntries(
				Object.entries(tale.indexMap.framesById).filter(
					([id]) => !frameIds.has(id),
				),
			) as Tale["indexMap"]["framesById"],
			keyframesById: Object.fromEntries(
				Object.entries(tale.indexMap.keyframesById).filter(
					([id]) => !keyframeIds.has(id),
				),
			) as Tale["indexMap"]["keyframesById"],
			pathsById,
		},
		order: {
			...tale.order,
			branchIds: tale.order.branchIds.filter((id) => !branchIds.has(id)),
			elementIds: tale.order.elementIds.filter((id) => !elementIds.has(id)),
			frameIds: tale.order.frameIds.filter((id) => !frameIds.has(id)),
			keyframeIds: tale.order.keyframeIds.filter((id) => !keyframeIds.has(id)),
			pathIds: tale.order.pathIds.filter((id) => pathsById[id] !== undefined),
		},
	};
	return rebuildTaleSceneCollections(
		next,
		getTaleScenes(tale).filter((scene) => !sceneIds.has(scene.id)),
	);
}

function getBranchSubtreeIds(tale: Tale, branchId: string): Set<string> {
	const childrenByParentId = new Map<string, string[]>();
	for (const branch of Object.values(tale.indexMap.branchesById)) {
		if (!branch.parentBranchId) continue;
		const children = childrenByParentId.get(branch.parentBranchId) ?? [];
		children.push(branch.id);
		childrenByParentId.set(branch.parentBranchId, children);
	}
	const branchIds = new Set<string>();
	const pending = [branchId];
	while (pending.length > 0) {
		const id = pending.pop();
		if (!id || branchIds.has(id)) continue;
		branchIds.add(id);
		pending.push(...(childrenByParentId.get(id) ?? []));
	}
	return branchIds;
}

/**
 * Adds an in-memory block draft to one branch by cloning a nearby block shape.
 *
 * @param tale - Current formatted tale.
 * @param branchId - Branch receiving the new block.
 * @returns Tale with a temporary block draft.
 *
 * @example
 * const next = addDraftBlock(tale, "2");
 */
export function addDraftBlock(
	tale: Tale,
	branchId: string,
	title = "New Scene",
): Tale {
	const template =
		getTaleScenes(tale).find((block) => block.branchId === branchId) ??
		getTaleScenes(tale)[0];
	const branch = tale.indexMap.branchesById[branchId];
	if (!template || !branch) return tale;
	const branchBlocks = getTaleScenes(tale).filter(
		(block) => block.branchId === branchId,
	);
	const id = createDraftId();
	const resolved = resolveEditedSceneWithFrames(tale, {
		...template,
		branchId,
		elementIds: [],
		id,
		isChoiceScene: false,
		frameIds: [],
		order: branchBlocks.length,
		rootFrameId: template.rootFrameId,
		title: title.trim() || "New Scene",
	});
	const taleWithNodes = withResolvedNodes(tale, resolved.framesById);
	return rebuildTaleSceneCollections(taleWithNodes, [
		...getTaleScenes(tale),
		resolved.scene,
	]);
}

function withResolvedNodes(
	tale: Tale,
	framesById: Record<string, TaleFrame>,
): Tale {
	return {
		...tale,
		indexMap: { ...tale.indexMap, framesById },
	};
}

function emptyElementAnimations() {
	return {
		active: { animations: [] },
		ambient: { animations: [] },
		previousFrameBridge: { animations: [] },
		previousFrameBridgeLoop: { animations: [] },
		frameIntro: { animations: [] },
		frameOutro: { animations: [] },
		nextFrameBridge: { animations: [] },
		nextFrameBridgeLoop: { animations: [] },
		intro: { animations: [] },
		outro: { animations: [] },
		previousBridge: { animations: [] },
		previousBridgeLoop: { animations: [] },
		sceneIntro: { animations: [] },
		sceneOutro: { animations: [] },
		nextBridge: { animations: [] },
		nextBridgeLoop: { animations: [] },
	};
}

function createDraftKeyframeRecord({
	branchId,
	frameId,
	id,
	order,
	sceneId,
	title,
}: {
	branchId: string;
	frameId: string;
	id: string;
	order: number;
	sceneId: string;
	title: string;
}): ResolvedTaleKeyframe {
	return {
		actions: [],
		branchId,
		description: "",
		frameId,
		id,
		order,
		pageId: null,
		reading: {
			activeLength: order === 0 ? 0 : 520,
			activeLengthMode: order === 0 ? "manual" : "content",
			animations: {
				active: { animations: [] },
				ambient: { animations: [] },
			},
			pauses: { atEnd: 0, atStart: 0 },
		},
		sceneId,
		links: { nextKeyframeId: null, previousKeyframeId: null },
		position: { index: order, isFirst: order === 0, isLast: false },
		snap: { mode: "scroll-snap", strategy: "shared" },
		title,
		transition: {
			introLength: order === 0 ? 320 : 0,
			outroLength: 0,
		},
	};
}

/**
 * Adds an in-memory path draft between two existing branch nodes.
 *
 * @param tale - Current formatted tale.
 * @param fromBranchId - Source branch id.
 * @param toBranchId - Target branch id.
 * @returns Tale with a temporary path draft when both branches have scenes.
 *
 * @example
 * const next = connectDraftBranches(tale, "1", "2");
 */
export function connectDraftBranches(
	tale: Tale,
	fromBranchId: string,
	toBranchId: string,
): Tale {
	const fromBlocks = getTaleScenes(tale)
		.filter((block) => block.branchId === fromBranchId)
		.sort((first, second) => first.order - second.order);
	const toBlocks = getTaleScenes(tale)
		.filter((block) => block.branchId === toBranchId)
		.sort((first, second) => first.order - second.order);
	const fromBlock = fromBlocks.at(-1);
	const toBlock = toBlocks[0];
	if (!fromBlock || !toBlock) return tale;
	const id = createDraftId();
	const path = {
		description: "",
		fromSceneId: fromBlock.id,
		fromKeyframeId: fromBlock.keyframeIds.at(-1) ?? null,
		fromBranchId,
		id,
		label: "New Path",
		links: {
			nextPathId: null,
			previousPathId: null,
		},
		order: getTalePaths(tale).length,
		toSceneId: toBlock.id,
		toKeyframeId: toBlock.keyframeIds[0] ?? null,
		toBranchId,
		type: "choice" as const,
	};
	const withPath = {
		...tale,
		counts: { ...tale.counts, paths: getTalePaths(tale).length + 1 },
		indexMap: {
			...tale.indexMap,
			pathsById: { ...tale.indexMap.pathsById, [id]: path },
		},
		order: { ...tale.order, pathIds: [...tale.order.pathIds, id] },
	};
	const frameId = fromBlock.frameIds.at(-1);
	if (!frameId) return withPath;
	const withChoice = addDraftElement(
		withPath,
		fromBlock.id,
		frameId,
		`Choose ${tale.indexMap.branchesById[toBranchId]?.title ?? "branch"}`,
	);
	const choiceId = withChoice.order.elementIds.at(-1);
	return choiceId
		? editElement(withChoice, choiceId, (element) => ({
				...element,
				pathId: id,
				type: "choiceButton",
			}))
		: withChoice;
}

/**
 * Reconnects an in-memory path to different source or target branches.
 *
 * @param tale - Current formatted tale.
 * @param pathId - Path being reconnected.
 * @param fromBranchId - New source branch id.
 * @param toBranchId - New target branch id.
 * @returns Tale with updated path endpoints when both branches have scenes.
 *
 * @example
 * const next = reconnectDraftPath(tale, "3", "1", "4");
 */
export function reconnectDraftPath(
	tale: Tale,
	pathId: string,
	fromBranchId: string,
	toBranchId: string,
): Tale {
	const path = tale.indexMap.pathsById[pathId];
	if (!path) return tale;
	const fromBlocks = getOrderedBranchBlocks(getTaleScenes(tale), fromBranchId);
	const toBlocks = getOrderedBranchBlocks(getTaleScenes(tale), toBranchId);
	const fromBlock = fromBlocks.at(-1);
	const toBlock = toBlocks[0];
	if (!fromBlock || !toBlock) return tale;
	const nextPath = {
		...path,
		fromSceneId: fromBlock.id,
		fromBranchId,
		toSceneId: toBlock.id,
		toBranchId,
	};
	return {
		...tale,
		indexMap: {
			...tale.indexMap,
			pathsById: {
				...tale.indexMap.pathsById,
				[pathId]: nextPath,
			},
		},
	};
}

/**
 * Rebuilds block collection and branch child metadata after editor block changes.
 *
 * @param tale - Current formatted tale.
 * @param scenes - Updated scenes.
 * @returns Tale with refreshed block and branch indexes.
 *
 * @example
 * const next = rebuildTaleSceneCollections(tale, scenes);
 */
function rebuildTaleSceneCollections(
	tale: Tale,
	scenes: ResolvedTaleScene[],
): Tale {
	const branchOrderById = new Map(
		getTaleBranches(tale).map((branch, index) => [branch.id, index]),
	);
	const sortedBlocks = [...scenes].sort((first, second) => {
		const firstBranchIndex = branchOrderById.get(first.branchId) ?? 0;
		const secondBranchIndex = branchOrderById.get(second.branchId) ?? 0;
		return firstBranchIndex - secondBranchIndex || first.order - second.order;
	});
	const branches = getTaleBranches(tale).map((branch) => {
		const sceneIds = sortedBlocks
			.filter((block) => block.branchId === branch.id)
			.sort((first, second) => first.order - second.order)
			.map((block) => block.id);
		return {
			...branch,
			sceneIds,
			counts: { ...branch.counts, scenes: sceneIds.length },
		};
	});
	const rebuilt: Tale = {
		...tale,
		counts: { ...tale.counts, scenes: sortedBlocks.length },
		indexMap: {
			...tale.indexMap,
			scenesById: Object.fromEntries(
				sortedBlocks.map((block) => [block.id, block]),
			) as Record<string, ResolvedTaleScene>,
			branchesById: Object.fromEntries(
				branches.map((branch) => [branch.id, branch]),
			) as Record<string, ResolvedTaleBranch>,
		},
		order: {
			...tale.order,
			sceneIds: sortedBlocks.map((block) => block.id),
			branchIds: branches.map((branch) => branch.id),
		},
	};
	const sceneIds = sortedBlocks.map((scene) => scene.id);
	const refreshedScenes = sortedBlocks.map((scene, index) => {
		const branchSceneIds = branches.find(
			(branch) => branch.id === scene.branchId,
		)?.sceneIds ?? [scene.id];
		const branchIndex = branchSceneIds.indexOf(scene.id);
		return {
			...scene,
			links: {
				...scene.links,
				nextSceneId: sceneIds[index + 1] ?? null,
				nextSceneIdInBranch: branchSceneIds[branchIndex + 1] ?? null,
				previousSceneId: sceneIds[index - 1] ?? null,
				previousSceneIdInBranch: branchSceneIds[branchIndex - 1] ?? null,
			},
			position: {
				...scene.position,
				branchIndex,
				index,
				isFirst: index === 0,
				isFirstInBranch: branchIndex === 0,
				isLast: index === sceneIds.length - 1,
				isLastInBranch: branchIndex === branchSceneIds.length - 1,
			},
		};
	});
	return {
		...rebuilt,
		indexMap: {
			...rebuilt.indexMap,
			scenesById: Object.fromEntries(
				refreshedScenes.map((scene) => [scene.id, scene]),
			) as Record<string, ResolvedTaleScene>,
		},
	};
}

/**
 * Returns the current ordered scenes for one branch.
 *
 * @param scenes - Tale scenes.
 * @param branchId - Branch id to filter by.
 * @returns Ordered branch scenes.
 *
 * @example
 * const scenes = getOrderedBranchBlocks(getTaleScenes(tale), "1");
 */
function getOrderedBranchBlocks(
	scenes: ResolvedTaleScene[],
	branchId: string,
): ResolvedTaleScene[] {
	return scenes
		.filter((block) => block.branchId === branchId)
		.sort((first, second) => first.order - second.order);
}
