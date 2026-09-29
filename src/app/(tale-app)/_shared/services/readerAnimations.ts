import { gsap } from "gsap";
import type {
	AmbientAnimationSelection,
	AnimationTrack,
	CompiledReader,
	KeyframeAction,
	ResolvedTaleElement,
	ResolvedTaleScene,
	Tale,
	TaleFrame,
	TimelineSegment,
	ViewportSize,
} from "../types";
import { clamp, lerp } from "./readerMath";
import { resolveIds } from "./taleLookups";

type AnimationValues = {
	blur: number;
	opacity: number;
	rotate: number;
	scale: number;
	translateX: number;
	translateY: number;
	translateZ: number;
};

type CompiledAnimationTrack = AnimationTrack & {
	commitId: string;
	ease: (progress: number) => number;
	inverseDuration: number;
	pathSampler?: (progress: number) => { x: number; y: number };
};

type CompiledAnimationSelection = readonly CompiledAnimationTrack[];

type ElementAnimationPlan = {
	ambient: CompiledAnimationSelection;
	applyInitialStateBeforeStart: boolean;
	carryEnteringEndForward: boolean;
	carryScrollingEndForward: boolean;
	showDuringSceneIntro: boolean;
	showDuringSceneOutro: boolean;
	showDuringPreviousBridge: boolean;
	showDuringNextBridge: boolean;
	showDuringFrameIntro: boolean;
	showDuringFrameOutro: boolean;
	showDuringPreviousFrameBridge: boolean;
	showDuringNextFrameBridge: boolean;
	timelineFrameId: string | null;
	previousFrameBridge: CompiledAnimationSelection;
	previousFrameBridgeLoop: CompiledAnimationSelection;
	frameIntro: CompiledAnimationSelection;
	frameOutro: CompiledAnimationSelection;
	nextFrameBridge: CompiledAnimationSelection;
	nextFrameBridgeLoop: CompiledAnimationSelection;
	previousBridge: CompiledAnimationSelection;
	previousBridgeLoop: CompiledAnimationSelection;
	sceneIntro: CompiledAnimationSelection;
	sceneOutro: CompiledAnimationSelection;
	nextBridge: CompiledAnimationSelection;
	nextBridgeLoop: CompiledAnimationSelection;
	intro: CompiledAnimationSelection;
	introLoop: CompiledAnimationSelection;
	hasAnimation: boolean;
	hover: CompiledAnimationSelection;
	hoverDurationMs: number;
	outro: CompiledAnimationSelection;
	outroLoop: CompiledAnimationSelection;
	active: CompiledAnimationSelection;
	activeLoop: CompiledAnimationSelection;
	visibleRange: ResolvedTaleElement["resolvedVisibleRange"];
};

type KeyframeAnimationRange = {
	endSegmentIndex: number;
	startSegmentIndex: number;
};

type ElementProgressionRange = {
	end: number;
	enterEnd: number;
	leaveStart: number;
	readEnd: number;
	readStart: number;
	start: number;
};

type BlockAnimationPlan = {
	ambient: CompiledAnimationSelection;
	carryEnteringEndForward: boolean;
	carryPreviousBridgeEndForward: boolean;
	carrySceneActiveEndForward: boolean;
	carryScrollingEndForward: boolean;
	previousVisibleDuringEnter: CompiledAnimationSelection;
	hover: CompiledAnimationSelection;
	hoverDurationMs: number;
	active: CompiledAnimationSelection;
	activeLoop: CompiledAnimationSelection;
	sceneActive: CompiledAnimationSelection;
	sceneActiveLoop: CompiledAnimationSelection;
	sceneIntro: CompiledAnimationSelection;
	sceneIntroLoop: CompiledAnimationSelection;
	sceneOutro: CompiledAnimationSelection;
	sceneOutroLoop: CompiledAnimationSelection;
	previousBridge: CompiledAnimationSelection;
	previousBridgeLoop: CompiledAnimationSelection;
	nextBridge: CompiledAnimationSelection;
	nextBridgeLoop: CompiledAnimationSelection;
};

export type ReaderAnimationPlan = {
	hiddenBeforeIntroFrames: Set<string>;
	elementKeyframes: Map<
		string,
		Array<{
			id: string;
			state: KeyframeAction["type"];
			tracks: CompiledAnimationSelection;
		}>
	>;
	nodeKeyframes: Map<
		string,
		Array<{
			id: string;
			state: KeyframeAction["type"];
			tracks: CompiledAnimationSelection;
		}>
	>;
	ambientSceneIds: Set<string>;
	animatedSceneIds: Set<string>;
	animatedElementIdsBySceneId: Map<string, string[]>;
	blockAnimationsById: Map<string, BlockAnimationPlan>;
	defaultActiveElementIds: Set<string>;
	defaultActiveFrameIds: Set<string>;
	fragmentAnimationsById: Map<string, ElementAnimationPlan>;
	elementProgressionRangeById: Map<string, ElementProgressionRange>;
	nodeAnimationsById: Map<string, ElementAnimationPlan>;
	keyframeIdsByElementId: Map<string, string[]>;
	keyframeIdsByFrameId: Map<string, string[]>;
	keyframeRangeById: Map<string, KeyframeAnimationRange>;
	sceneActiveRangeById: Map<string, { end: number; start: number }>;
	animatedFrameIdsBySceneId: Map<string, string[]>;
};

const defaultGsapEase = gsap.parseEase("power2.out");
const writtenValuesByElement = new WeakMap<
	HTMLElement,
	{ filter: string; opacity: string; transform: string }
>();
const hoverStateByTracks = new WeakMap<
	object,
	{ changedAt: number; hovered: boolean; startProgress: number }
>();

/**
 * Compiles animation tracks and indexes once for the active reader route.
 *
 * @param compiled - Compiled reader route.
 * @param viewport - Active viewport used to compile viewport-relative translation values.
 * @returns Animation programs indexed by block and fragment id.
 *
 * @example
 * const animationPlan = compileReaderAnimationPlan(compiled);
 */
export function compileReaderAnimationPlan(
	compiled: CompiledReader,
	tale: Tale,
	viewport: ViewportSize,
): ReaderAnimationPlan {
	const elementKeyframes: ReaderAnimationPlan["elementKeyframes"] = new Map();
	const nodeKeyframes: ReaderAnimationPlan["nodeKeyframes"] = new Map();
	const hiddenBeforeIntroFrames = new Set<string>();
	const ambientSceneIds = new Set<string>();
	const animatedSceneIds = new Set<string>();
	const animatedElementIdsBySceneId = new Map<string, string[]>();
	const blockAnimationsById = new Map<string, BlockAnimationPlan>();
	const defaultActiveElementIds = new Set<string>();
	const defaultActiveFrameIds = new Set<string>();
	const fragmentAnimationsById = new Map<string, ElementAnimationPlan>();
	const elementProgressionRangeById = new Map<
		string,
		ElementProgressionRange
	>();
	const nodeAnimationsById = new Map<string, ElementAnimationPlan>();
	const keyframeIdsByElementId = new Map<string, string[]>();
	const keyframeIdsByFrameId = new Map<string, string[]>();
	const keyframeRangeById = compileKeyframeAnimationRanges(compiled);
	const sceneActiveRangeById = compileSceneActiveRanges(compiled);
	const animatedFrameIdsBySceneId = new Map<string, string[]>();

	for (
		let anchorIndex = 0;
		anchorIndex < compiled.anchors.length;
		anchorIndex++
	) {
		const anchor = compiled.anchors[anchorIndex];
		if (!anchor) continue;
		const block = tale.indexMap.scenesById[anchor.sceneId];
		if (!block) continue;
		const blockCompilation = compileBlockAnimations(block, viewport);
		blockAnimationsById.set(block.id, blockCompilation.plan);
		if (blockCompilation.hasAnimation) animatedSceneIds.add(block.id);
		if (blockCompilation.hasAmbient) ambientSceneIds.add(block.id);

		const animatedFrameIds: string[] = [];
		const sceneFrames = resolveIds(block.frameIds, tale.indexMap.framesById);
		const frameBySourceId = new Map(
			sceneFrames.map((frame) => [
				frame.id.split(":").at(-1) ?? frame.id,
				frame,
			]),
		);
		const directKeyframeIdsByFrameId = new Map<string, string[]>();
		for (const keyframeId of block.keyframeIds) {
			const step = tale.indexMap.keyframesById[keyframeId];
			if (!step?.frameId) continue;
			const ids = directKeyframeIdsByFrameId.get(step.frameId) ?? [];
			ids.push(step.id);
			directKeyframeIdsByFrameId.set(step.frameId, ids);
		}
		const resolveFrameKeyframeIds = (frame: TaleFrame): string[] => {
			let current: TaleFrame | undefined = frame;
			const visited = new Set<string>();
			while (current && !visited.has(current.id)) {
				visited.add(current.id);
				const sourceId = current.id.split(":").at(-1) ?? current.id;
				const direct =
					directKeyframeIdsByFrameId.get(current.id) ??
					directKeyframeIdsByFrameId.get(sourceId);
				if (direct) return direct;
				const parentId: string | null = current.parentFrameId;
				if (!parentId) break;
				current =
					tale.indexMap.framesById[parentId] ??
					frameBySourceId.get(parentId.split(":").at(-1) ?? parentId);
			}
			return [];
		};
		for (const node of sceneFrames) {
			const parentFrame = node.parentFrameId
				? tale.indexMap.framesById[node.parentFrameId]
				: undefined;
			if (
				node.id === block.rootFrameId ||
				parentFrame?.defaultElementStates?.[node.id] === "active"
			)
				defaultActiveFrameIds.add(node.id);
			if (
				node.visibleBeforeIntro !== true &&
				node.visibleDuringSceneIntro !== true &&
				node.id !== block.rootFrameId
			)
				hiddenBeforeIntroFrames.add(node.id);
			const sourceFrameId = node.id.split(":").at(-1) ?? node.id;
			const linkedKeyframeIds = resolveFrameKeyframeIds(node);
			if (linkedKeyframeIds.length) {
				keyframeIdsByFrameId.set(node.id, linkedKeyframeIds);
				keyframeIdsByFrameId.set(sourceFrameId, linkedKeyframeIds);
			}
			const nodeAnimations =
				node.kind === "group"
					? node.animations
					: {
							...node.animations,
							intro: node.transition?.introEnabled
								? node.animations.intro
								: { animations: [] },
							outro: node.transition?.outroEnabled
								? node.animations.outro
								: { animations: [] },
						};
			const nodePlan = compileEntityAnimations(
				nodeAnimations,
				{ end: 1, start: 0 },
				`node:${node.id}`,
				viewport,
				{
					timelineFrameId: resolveTimelineFrameId(tale, node.id),
					showDuringSceneIntro:
						node.visibleDuringSceneIntro === true ||
						node.visibleBeforeIntro === true,
					showDuringSceneOutro: node.visibleDuringSceneOutro === true,
					showDuringPreviousBridge: node.visibleDuringPreviousBridge === true,
					showDuringNextBridge: node.visibleDuringNextBridge === true,
					showDuringFrameIntro: node.visibleDuringFrameIntro === true,
					showDuringFrameOutro: node.visibleDuringFrameOutro === true,
					showDuringPreviousFrameBridge:
						node.visibleDuringPreviousFrameBridge === true,
					showDuringNextFrameBridge: node.visibleDuringNextFrameBridge === true,
				},
			);
			nodeAnimationsById.set(node.id, nodePlan);
			if (linkedKeyframeIds.length) {
				const states = linkedKeyframeIds.map((id) => {
					const action = getEntityKeyframeAction(
						tale,
						id,
						node.id,
						"frame",
						node.parentFrameId,
					);
					return {
						id,
						state: action?.type ?? ("continue" as const),
						tracks: compileTracks(
							getAnimationTracks(
								action?.animationTarget === "children"
									? undefined
									: action?.animation,
							),
							`keyframe:${id}:frame:${node.id}`,
							viewport,
						),
					};
				});
				if (states.some((state) => state.state !== "continue")) {
					nodeKeyframes.set(node.id, states);
					nodePlan.hasAnimation = true;
				}
			}
			if (hiddenBeforeIntroFrames.has(node.id)) nodePlan.hasAnimation = true;
			if (nodePlan.hasAnimation) animatedFrameIds.push(node.id);
			if (hasContinuousEntityAnimation(nodePlan)) ambientSceneIds.add(block.id);
		}
		animatedFrameIdsBySceneId.set(block.id, animatedFrameIds);

		const animatedElementIds: string[] = [];
		compileElementProgressionRanges(tale, block, elementProgressionRangeById);
		for (const fragment of resolveIds(
			block.elementIds,
			tale.indexMap.elementsById,
		)) {
			const immediateOwnerFrame = fragment.frameId
				? (tale.indexMap.framesById[fragment.frameId] ??
					frameBySourceId.get(
						fragment.frameId.split(":").at(-1) ?? fragment.frameId,
					))
				: undefined;
			const timelineFrameId = resolveTimelineFrameId(tale, fragment.frameId);
			const ownerFrame = timelineFrameId
				? tale.indexMap.framesById[timelineFrameId]
				: immediateOwnerFrame;
			const fragmentPlan = compileEntityAnimations(
				fragment.animations,
				fragment.resolvedVisibleRange,
				`fragment:${fragment.id}`,
				viewport,
				{
					timelineFrameId,
					showDuringSceneIntro:
						(ownerFrame?.visibleDuringSceneIntro === true ||
							ownerFrame?.visibleBeforeIntro === true) &&
						fragment.visibleDuringSceneIntro === true,
					showDuringSceneOutro:
						ownerFrame?.visibleDuringSceneOutro === true &&
						fragment.visibleDuringSceneOutro === true,
					showDuringPreviousBridge:
						ownerFrame?.visibleDuringPreviousBridge === true &&
						fragment.visibleDuringPreviousBridge === true,
					showDuringNextBridge:
						ownerFrame?.visibleDuringNextBridge === true &&
						fragment.visibleDuringNextBridge === true,
					showDuringFrameIntro:
						ownerFrame?.transition?.introEnabled === true &&
						fragment.visibleDuringFrameIntro === true,
					showDuringFrameOutro:
						ownerFrame?.transition?.outroEnabled === true &&
						fragment.visibleDuringFrameOutro === true,
					showDuringPreviousFrameBridge:
						ownerFrame?.transition?.previousBridgeEnabled === true &&
						fragment.visibleDuringPreviousFrameBridge === true,
					showDuringNextFrameBridge:
						ownerFrame?.transition?.nextBridgeEnabled === true &&
						fragment.visibleDuringNextFrameBridge === true,
				},
			);
			fragmentAnimationsById.set(fragment.id, fragmentPlan);
			if (
				immediateOwnerFrame?.defaultElementStates?.[fragment.id] === "active"
			) {
				defaultActiveElementIds.add(fragment.id);
			}
			const frameKeyframeIds = ownerFrame
				? (keyframeIdsByFrameId.get(ownerFrame.id) ??
					resolveFrameKeyframeIds(ownerFrame))
				: [];
			const actionKeyframeIds = block.keyframeIds.filter((id) =>
				tale.indexMap.keyframesById[id]?.actions?.some(
					(action) =>
						action.targetType === "element" && action.targetId === fragment.id,
				),
			);
			const linkedKeyframeIds = actionKeyframeIds.length
				? frameKeyframeIds.length
					? frameKeyframeIds
					: actionKeyframeIds
				: frameKeyframeIds;
			if (linkedKeyframeIds.length)
				keyframeIdsByElementId.set(fragment.id, linkedKeyframeIds);
			if (linkedKeyframeIds.length) {
				const states = linkedKeyframeIds
					.filter((id) => keyframeRangeById.has(id))
					.sort(
						(a, b) =>
							(keyframeRangeById.get(a)?.startSegmentIndex ?? 0) -
							(keyframeRangeById.get(b)?.startSegmentIndex ?? 0),
					)
					.map((id) => {
						const action = getEntityKeyframeAction(
							tale,
							id,
							fragment.id,
							"element",
							fragment.frameId,
						);
						return {
							id,
							state: action?.type ?? ("continue" as const),
							tracks: compileTracks(
								getAnimationTracks(action?.animation),
								`keyframe:${id}:${fragment.id}`,
								viewport,
							),
						};
					});
				elementKeyframes.set(fragment.id, states);
				fragmentPlan.hasAnimation = true;
			}
			if (fragmentPlan.hasAnimation) animatedElementIds.push(fragment.id);
			if (hasContinuousEntityAnimation(fragmentPlan))
				ambientSceneIds.add(block.id);
		}
		animatedElementIdsBySceneId.set(block.id, animatedElementIds);
	}

	return {
		hiddenBeforeIntroFrames,
		elementKeyframes,
		nodeKeyframes,
		ambientSceneIds,
		animatedSceneIds,
		animatedElementIdsBySceneId,
		blockAnimationsById,
		defaultActiveElementIds,
		defaultActiveFrameIds,
		fragmentAnimationsById,
		elementProgressionRangeById,
		nodeAnimationsById,
		keyframeIdsByElementId,
		keyframeIdsByFrameId,
		keyframeRangeById,
		sceneActiveRangeById,
		animatedFrameIdsBySceneId,
	};
}

function compileSceneActiveRanges(
	compiled: CompiledReader,
): Map<string, { end: number; start: number }> {
	const ranges = new Map<string, { end: number; start: number }>();
	for (const segment of compiled.segments) {
		if (
			segment.type === "transition" ||
			(segment.type === "pause" && segment.phaseOwner === "scene")
		)
			continue;
		const current = ranges.get(segment.sceneId);
		ranges.set(segment.sceneId, {
			end: Math.max(current?.end ?? segment.end, segment.end),
			start: Math.min(current?.start ?? segment.start, segment.start),
		});
	}
	return ranges;
}

function getAnimationTracks(
	selection: KeyframeAction["animation"] | undefined,
): AnimationTrack[] {
	const legacy = selection as
		| (KeyframeAction["animation"] & { tracks?: AnimationTrack[] })
		| undefined;
	return legacy?.animations ?? legacy?.tracks ?? [];
}

function getEntityKeyframeAction(
	tale: Tale,
	keyframeId: string,
	targetId: string,
	targetType: KeyframeAction["targetType"],
	ownerFrameId: string | null,
): KeyframeAction | undefined {
	const actions = tale.indexMap.keyframesById[keyframeId]?.actions ?? [];
	const direct = actions.find(
		(action) =>
			action.targetType === targetType && action.targetId === targetId,
	);
	if (direct) return direct;
	let currentId = ownerFrameId;
	const visited = new Set<string>();
	while (currentId && !visited.has(currentId)) {
		visited.add(currentId);
		const inherited = actions.find(
			(action) =>
				action.targetType === "frame" &&
				action.targetId === currentId &&
				action.animationTarget === "children",
		);
		if (inherited) return inherited;
		currentId = tale.indexMap.framesById[currentId]?.parentFrameId ?? null;
	}
	return undefined;
}

function compileElementProgressionRanges(
	tale: Tale,
	scene: ResolvedTaleScene,
	target: Map<string, ElementProgressionRange>,
): void {
	for (const keyframeId of scene.keyframeIds) {
		const step = tale.indexMap.keyframesById[keyframeId];
		if (!step?.frameId) continue;
		const elements = scene.elementIds
			.flatMap((elementId) => {
				const element = tale.indexMap.elementsById[elementId];
				return element?.progression?.enabled ? [element] : [];
			})
			.filter((element) =>
				isDescendantFrame(tale, element.frameId, step.frameId as string),
			)
			.sort((left, right) => left.order - right.order);
		const lengths = elements.map((element) => {
			const progression = element.progression;
			if (!progression) return 0;
			return (
				Math.max(progression.introLength, 0) +
				Math.max(progression.pauses.atStart, 0) +
				Math.max(progression.activeLength, 1) +
				Math.max(progression.pauses.atEnd, 0) +
				Math.max(progression.outroLength, 0)
			);
		});
		const total = lengths.reduce((sum, length) => sum + length, 0);
		if (total <= 0) continue;
		let completed = 0;
		for (let index = 0; index < elements.length; index++) {
			const element = elements[index];
			const progression = element?.progression;
			if (!element || !progression) continue;
			const start = completed / total;
			const enterEnd =
				(completed + Math.max(progression.introLength, 0)) / total;
			const readStart =
				(completed +
					Math.max(progression.introLength, 0) +
					Math.max(progression.pauses.atStart, 0)) /
				total;
			const readEnd =
				(readStart * total + Math.max(progression.activeLength, 1)) / total;
			const leaveStart =
				(readEnd * total + Math.max(progression.pauses.atEnd, 0)) / total;
			completed += lengths[index] ?? 0;
			target.set(element.id, {
				end: completed / total,
				enterEnd,
				leaveStart,
				readEnd,
				readStart,
				start,
			});
		}
	}
}

function isDescendantFrame(
	tale: Tale,
	frameId: string | null,
	ancestorFrameId: string,
): boolean {
	let currentId = frameId;
	const visited = new Set<string>();
	const ancestorSource = ancestorFrameId.split(":").at(-1) ?? ancestorFrameId;
	while (currentId && !visited.has(currentId)) {
		visited.add(currentId);
		if (
			currentId === ancestorFrameId ||
			(currentId.split(":").at(-1) ?? currentId) === ancestorSource
		)
			return true;
		currentId = tale.indexMap.framesById[currentId]?.parentFrameId ?? null;
	}
	return false;
}

function resolveTimelineFrameId(
	tale: Tale,
	frameId: string | null,
): string | null {
	let currentId = frameId;
	const visited = new Set<string>();
	while (currentId && !visited.has(currentId)) {
		visited.add(currentId);
		const frame = tale.indexMap.framesById[currentId];
		if (!frame) return currentId;
		if (frame.kind !== "group") return frame.id;
		currentId = frame.parentFrameId;
	}
	return null;
}

function compileKeyframeAnimationRanges(
	compiled: CompiledReader,
): Map<string, KeyframeAnimationRange> {
	const ranges = new Map<string, KeyframeAnimationRange>();
	for (const segment of compiled.segments) {
		if (segment.type === "transition") continue;
		if (segment.type === "pause" && segment.phaseOwner) continue;
		const current = ranges.get(segment.keyframeId);
		if (current) {
			current.endSegmentIndex = segment.index;
		} else {
			ranges.set(segment.keyframeId, {
				endSegmentIndex: segment.index,
				startSegmentIndex: segment.index,
			});
		}
	}
	return ranges;
}

/**
 * Compiles one block's scroll, transition, override, and ambient tracks.
 *
 * @param block - Resolved block animation source.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Compiled block plan and indexing flags.
 */
function compileBlockAnimations(
	block: ResolvedTaleScene,
	viewport: ViewportSize,
): {
	hasAmbient: boolean;
	hasAnimation: boolean;
	plan: BlockAnimationPlan;
} {
	const plan: BlockAnimationPlan = {
		ambient: compileAmbientTracks(
			block.resolved.readingAnimations.ambient,
			block.resolved.readingAnimations.ambientCycleDurationMs,
			block.resolved.readingAnimations.ambientPlayback,
			`block:${block.id}:loop`,
			viewport,
		),
		carryEnteringEndForward:
			block.transition.animations.intro.carryEndStateForward ?? false,
		carryPreviousBridgeEndForward:
			block.transition.animations.previousBridge?.carryEndStateForward ?? false,
		carrySceneActiveEndForward:
			block.reading.animations.sceneActive?.carryEndStateForward ?? false,
		carryScrollingEndForward:
			block.reading.animations.active.carryEndStateForward ?? false,
		hover: compileTracks(
			block.reading.animations.hover?.animations ?? [],
			`block:${block.id}:hover`,
			viewport,
		),
		hoverDurationMs: Math.max(
			(block.reading.animations.hover?.durationSeconds ?? 0.2) * 1000,
			50,
		),
		active: compileTracks(
			block.resolved.readingAnimations.active,
			`block:${block.id}:active`,
			viewport,
		),
		activeLoop: compileOptionalAmbientTracks(
			block.reading.animations.activeLoop,
			`block:${block.id}:active-loop`,
			viewport,
		),
		sceneActive: compileTracks(
			block.resolved.readingAnimations.sceneActive ?? [],
			`block:${block.id}:scene-active`,
			viewport,
		),
		sceneActiveLoop: compileOptionalAmbientTracks(
			block.reading.animations.sceneActiveLoop,
			`block:${block.id}:scene-active-loop`,
			viewport,
		),
		previousVisibleDuringEnter: compileTracks(
			block.resolved.transitionAnimations.previousVisible,
			`block:${block.id}:previous-visible`,
			viewport,
		),
		sceneIntro: compileTracks(
			block.resolved.transitionAnimations.intro,
			`block:${block.id}:intro`,
			viewport,
		),
		sceneIntroLoop: compileOptionalAmbientTracks(
			block.transition.animations.introLoop,
			`block:${block.id}:intro-loop`,
			viewport,
		),
		sceneOutro: compileTracks(
			block.resolved.transitionAnimations.outro,
			`block:${block.id}:outro`,
			viewport,
		),
		sceneOutroLoop: compileOptionalAmbientTracks(
			block.transition.animations.outroLoop,
			`block:${block.id}:outro-loop`,
			viewport,
		),
		previousBridge: compileTracks(
			block.transition.animations.previousBridge?.animations ?? [],
			`block:${block.id}:previous-bridge`,
			viewport,
		),
		previousBridgeLoop: compileOptionalAmbientTracks(
			block.transition.animations.previousBridgeLoop,
			`block:${block.id}:previous-bridge-loop`,
			viewport,
		),
		nextBridge: compileTracks(
			block.transition.animations.nextBridge?.animations ?? [],
			`block:${block.id}:next-bridge`,
			viewport,
		),
		nextBridgeLoop: compileOptionalAmbientTracks(
			block.transition.animations.nextBridgeLoop,
			`block:${block.id}:next-bridge-loop`,
			viewport,
		),
	};
	return {
		hasAmbient: [
			plan.ambient,
			plan.hover,
			plan.activeLoop,
			plan.sceneActiveLoop,
			plan.sceneIntroLoop,
			plan.sceneOutroLoop,
			plan.previousBridgeLoop,
			plan.nextBridgeLoop,
		].some((selection) => selection.length > 0),
		hasAnimation: [
			plan.ambient,
			plan.hover,
			plan.previousVisibleDuringEnter,
			plan.active,
			plan.activeLoop,
			plan.sceneActive,
			plan.sceneActiveLoop,
			plan.sceneIntro,
			plan.sceneIntroLoop,
			plan.sceneOutro,
			plan.sceneOutroLoop,
			plan.previousBridge,
			plan.previousBridgeLoop,
			plan.nextBridge,
			plan.nextBridgeLoop,
		].some((selection) => selection.length > 0),
		plan,
	};
}

function hasContinuousEntityAnimation(plan: ElementAnimationPlan): boolean {
	return [
		plan.ambient,
		plan.previousFrameBridgeLoop,
		plan.previousBridgeLoop,
		plan.introLoop,
		plan.hover,
		plan.nextFrameBridgeLoop,
		plan.nextBridgeLoop,
		plan.outroLoop,
		plan.activeLoop,
	].some((selection) => selection.length > 0);
}

/**
 * Compiles one fragment's animation tracks and visibility behavior.
 *
 * @param animations - Resolved fragment or node animation source.
 * @param visibleRange - Entity visibility range inside block reading progress.
 * @param commitPrefix - Stable prefix used for committed track identifiers.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Compiled fragment animation plan.
 */
function compileEntityAnimations(
	animations: TaleFrame["animations"] | ResolvedTaleElement["animations"],
	visibleRange: ResolvedTaleElement["resolvedVisibleRange"],
	commitPrefix: string,
	viewport: ViewportSize,
	options: {
		timelineFrameId?: string | null;
		showDuringSceneIntro?: boolean;
		showDuringSceneOutro?: boolean;
		showDuringPreviousBridge?: boolean;
		showDuringNextBridge?: boolean;
		showDuringFrameIntro?: boolean;
		showDuringFrameOutro?: boolean;
		showDuringPreviousFrameBridge?: boolean;
		showDuringNextFrameBridge?: boolean;
	} = {},
): ElementAnimationPlan {
	const plan: ElementAnimationPlan = {
		ambient: compileAmbientTracks(
			animations.ambient.animations,
			animations.ambient.cycleDurationMs ?? 2400,
			animations.ambient.playback ?? "alternate",
			`${commitPrefix}:loop`,
			viewport,
		),
		applyInitialStateBeforeStart:
			animations.intro.applyInitialStateBeforeStart ?? true,
		carryEnteringEndForward: animations.intro.carryEndStateForward ?? false,
		carryScrollingEndForward: animations.active.carryEndStateForward ?? false,
		showDuringSceneIntro: options.showDuringSceneIntro ?? true,
		showDuringSceneOutro: options.showDuringSceneOutro ?? true,
		showDuringPreviousBridge: options.showDuringPreviousBridge ?? true,
		showDuringNextBridge: options.showDuringNextBridge ?? true,
		showDuringFrameIntro: options.showDuringFrameIntro ?? true,
		showDuringFrameOutro: options.showDuringFrameOutro ?? true,
		showDuringPreviousFrameBridge:
			options.showDuringPreviousFrameBridge ?? true,
		showDuringNextFrameBridge: options.showDuringNextFrameBridge ?? true,
		timelineFrameId: options.timelineFrameId ?? null,
		previousFrameBridge: compileTracks(
			animations.previousFrameBridge?.animations ?? [],
			`${commitPrefix}:previous-frame-bridge`,
			viewport,
		),
		previousFrameBridgeLoop: compileOptionalAmbientTracks(
			animations.previousFrameBridgeLoop,
			`${commitPrefix}:previous-frame-bridge-loop`,
			viewport,
		),
		frameIntro: compileTracks(
			animations.frameIntro?.animations ?? [],
			`${commitPrefix}:frame-intro`,
			viewport,
		),
		frameOutro: compileTracks(
			animations.frameOutro?.animations ?? [],
			`${commitPrefix}:frame-outro`,
			viewport,
		),
		nextFrameBridge: compileTracks(
			animations.nextFrameBridge?.animations ?? [],
			`${commitPrefix}:next-frame-bridge`,
			viewport,
		),
		nextFrameBridgeLoop: compileOptionalAmbientTracks(
			animations.nextFrameBridgeLoop,
			`${commitPrefix}:next-frame-bridge-loop`,
			viewport,
		),
		previousBridge: compileTracks(
			animations.previousBridge?.animations ?? [],
			`${commitPrefix}:previous-bridge`,
			viewport,
		),
		previousBridgeLoop: compileOptionalAmbientTracks(
			animations.previousBridgeLoop,
			`${commitPrefix}:previous-bridge-loop`,
			viewport,
		),
		sceneIntro: compileTracks(
			animations.sceneIntro?.animations ?? [],
			`${commitPrefix}:scene-intro`,
			viewport,
		),
		sceneOutro: compileTracks(
			animations.sceneOutro?.animations ?? [],
			`${commitPrefix}:scene-outro`,
			viewport,
		),
		nextBridge: compileTracks(
			animations.nextBridge?.animations ?? [],
			`${commitPrefix}:next-bridge`,
			viewport,
		),
		nextBridgeLoop: compileOptionalAmbientTracks(
			animations.nextBridgeLoop,
			`${commitPrefix}:next-bridge-loop`,
			viewport,
		),
		intro: compileTracks(
			animations.intro.animations,
			`${commitPrefix}:intro`,
			viewport,
		),
		introLoop: compileOptionalAmbientTracks(
			animations.introLoop,
			`${commitPrefix}:intro-loop`,
			viewport,
		),
		hasAnimation: false,
		hover: compileTracks(
			animations.hover?.animations ?? [],
			`${commitPrefix}:hover`,
			viewport,
		),
		hoverDurationMs: Math.max(
			(animations.hover?.durationSeconds ?? 0.2) * 1000,
			50,
		),
		outro: compileTracks(
			animations.outro.animations,
			`${commitPrefix}:outro`,
			viewport,
		),
		outroLoop: compileOptionalAmbientTracks(
			animations.outroLoop,
			`${commitPrefix}:outro-loop`,
			viewport,
		),
		active: compileTracks(
			animations.active.animations,
			`${commitPrefix}:active`,
			viewport,
		),
		activeLoop: compileOptionalAmbientTracks(
			animations.activeLoop,
			`${commitPrefix}:active-loop`,
			viewport,
		),
		visibleRange,
	};
	plan.hasAnimation =
		plan.ambient.length > 0 ||
		plan.previousFrameBridge.length > 0 ||
		plan.previousFrameBridgeLoop.length > 0 ||
		plan.frameIntro.length > 0 ||
		plan.frameOutro.length > 0 ||
		plan.nextFrameBridge.length > 0 ||
		plan.nextFrameBridgeLoop.length > 0 ||
		plan.previousBridge.length > 0 ||
		plan.previousBridgeLoop.length > 0 ||
		plan.sceneIntro.length > 0 ||
		plan.sceneOutro.length > 0 ||
		plan.nextBridge.length > 0 ||
		plan.nextBridgeLoop.length > 0 ||
		plan.introLoop.length > 0 ||
		plan.intro.length > 0 ||
		plan.hover.length > 0 ||
		plan.outro.length > 0 ||
		plan.outroLoop.length > 0 ||
		plan.active.length > 0 ||
		plan.activeLoop.length > 0 ||
		plan.visibleRange.start !== 0 ||
		plan.visibleRange.end !== 1;
	return plan;
}

/**
 * Checks whether any visible block requires continuous animation frames.
 *
 * @param plan - Compiled animation plan.
 * @param sceneIds - Visible block ids.
 * @returns Whether the frame loop should continue while scroll is idle.
 */
export function hasAmbientAnimations(
	plan: ReaderAnimationPlan,
	sceneIds: readonly string[],
): boolean {
	return sceneIds.some((sceneId) => plan.ambientSceneIds.has(sceneId));
}

/**
 * Evaluates a block animation into a reusable values object.
 *
 * @param plan - Compiled animation plan.
 * @param sceneId - Scene being painted.
 * @param segment - Active timeline segment.
 * @param progress - Normalized segment progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether the block requires an animation style write.
 */
export function evaluateBlockAnimation(
	plan: ReaderAnimationPlan,
	tale: Tale,
	sceneId: string,
	segment: TimelineSegment,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered = false,
): boolean {
	if (!plan.animatedSceneIds.has(sceneId)) return false;
	resetValues(target);
	const blockAnimations = plan.blockAnimationsById.get(sceneId);
	const sceneActiveProgress = getSceneActiveProgress(
		plan,
		sceneId,
		segment,
		progress,
	);

	if (segment.type === "pause" && segment.phaseOwner === "scene") {
		if (blockAnimations?.carryPreviousBridgeEndForward) {
			evaluateTracks(
				blockAnimations.previousBridge,
				1,
				target,
				committedAnimationIds,
			);
		}
		if (blockAnimations?.carryEnteringEndForward) {
			evaluateTracks(
				blockAnimations.sceneIntro,
				1,
				target,
				committedAnimationIds,
			);
		}
		if (segment.pauseType === "frame-enter") {
			evaluateTracks(
				blockAnimations?.sceneIntro ?? [],
				progress,
				target,
				committedAnimationIds,
			);
		} else {
			evaluateTracks(
				blockAnimations?.sceneActive ?? [],
				1,
				target,
				committedAnimationIds,
				"replace",
				(blockAnimations?.carryEnteringEndForward ?? false) ||
					(blockAnimations?.carryPreviousBridgeEndForward ?? false),
			);
			evaluateTracks(
				blockAnimations?.active ?? [],
				1,
				target,
				committedAnimationIds,
				"replace",
				blockAnimations?.carryEnteringEndForward ?? false,
			);
			evaluateTracks(
				blockAnimations?.sceneOutro ?? [],
				progress,
				target,
				committedAnimationIds,
				"replace",
				(blockAnimations?.carryScrollingEndForward ?? false) ||
					(blockAnimations?.carrySceneActiveEndForward ?? false),
			);
		}
		const scene = tale.indexMap.scenesById[sceneId];
		if (
			isSceneLoopActive(tale, scene, segment, scene?.reading.animations.ambient)
		)
			evaluateAmbient(
				blockAnimations?.ambient ?? [],
				timeMs,
				segment.pauseType === "frame-enter" ? 0 : 1,
				target,
			);
		const loop =
			segment.pauseType === "frame-enter"
				? scene?.transition.animations.introLoop
				: scene?.transition.animations.outroLoop;
		if (isSceneLoopActive(tale, scene, segment, loop))
			evaluateAmbient(
				segment.pauseType === "frame-enter"
					? (blockAnimations?.sceneIntroLoop ?? [])
					: (blockAnimations?.sceneOutroLoop ?? []),
				timeMs,
				progress,
				target,
			);
		evaluateHover(
			blockAnimations?.hover ?? [],
			blockAnimations?.hoverDurationMs ?? 200,
			hovered,
			timeMs,
			target,
		);
		return true;
	}

	if (segment.type === "reading" || segment.type === "pause") {
		const readingProgress =
			segment.type === "pause"
				? segment.pauseType === "start" || segment.pauseType === "frame-enter"
					? 0
					: 1
				: progress;
		if (blockAnimations?.carryPreviousBridgeEndForward) {
			evaluateTracks(
				blockAnimations.previousBridge,
				1,
				target,
				committedAnimationIds,
			);
		}
		if (blockAnimations?.carryEnteringEndForward) {
			evaluateTracks(
				blockAnimations.sceneIntro,
				1,
				target,
				committedAnimationIds,
			);
		}
		evaluateTracks(
			blockAnimations?.sceneActive ?? [],
			sceneActiveProgress,
			target,
			committedAnimationIds,
			"replace",
			(blockAnimations?.carryEnteringEndForward ?? false) ||
				(blockAnimations?.carryPreviousBridgeEndForward ?? false),
		);
		evaluateTracks(
			blockAnimations?.active ?? [],
			readingProgress,
			target,
			committedAnimationIds,
			"replace",
			blockAnimations?.carryEnteringEndForward ?? false,
		);
		const scene = tale.indexMap.scenesById[sceneId];
		if (
			isSceneLoopActive(tale, scene, segment, scene?.reading.animations.ambient)
		)
			evaluateAmbient(
				blockAnimations?.ambient ?? [],
				timeMs,
				readingProgress,
				target,
			);
		if (
			isSceneLoopActive(
				tale,
				scene,
				segment,
				scene?.reading.animations.sceneActiveLoop,
			)
		)
			evaluateAmbient(
				blockAnimations?.sceneActiveLoop ?? [],
				timeMs,
				sceneActiveProgress,
				target,
			);
		if (
			isSceneLoopActive(
				tale,
				scene,
				segment,
				scene?.reading.animations.activeLoop,
			)
		)
			evaluateAmbient(
				blockAnimations?.activeLoop ?? [],
				timeMs,
				readingProgress,
				target,
			);
		evaluateHover(
			blockAnimations?.hover ?? [],
			blockAnimations?.hoverDurationMs ?? 200,
			hovered,
			timeMs,
			target,
		);
		return true;
	}

	const isEntering = segment.toSceneId === sceneId;
	const destinationAnimations = plan.blockAnimationsById.get(segment.toSceneId);
	const transition =
		tale.indexMap.scenesById[isEntering ? segment.toSceneId : sceneId]
			?.transition;
	if (!transition) return false;
	const opening = segment.phase === "opening" || segment.fromSceneId === null;
	const enabled = opening
		? transition.introEnabled === true
		: isEntering
			? segment.incomingBridgeEnabled !== false
			: segment.outgoingBridgeEnabled !== false;
	const tracks = !enabled
		? []
		: opening
			? (destinationAnimations?.sceneIntro ?? [])
			: isEntering
				? (destinationAnimations?.previousBridge ?? [])
				: (blockAnimations?.nextBridge ?? []);
	if (!isEntering) {
		if (blockAnimations?.carryEnteringEndForward) {
			evaluateTracks(
				blockAnimations.sceneIntro,
				1,
				target,
				committedAnimationIds,
			);
		}
		if (blockAnimations?.carryPreviousBridgeEndForward) {
			evaluateTracks(
				blockAnimations.previousBridge,
				1,
				target,
				committedAnimationIds,
			);
		}
		evaluateTracks(
			blockAnimations?.sceneActive ?? [],
			1,
			target,
			committedAnimationIds,
			"replace",
			(blockAnimations?.carryEnteringEndForward ?? false) ||
				(blockAnimations?.carryPreviousBridgeEndForward ?? false),
		);
		evaluateTracks(
			blockAnimations?.active ?? [],
			1,
			target,
			committedAnimationIds,
			"replace",
			blockAnimations?.carryEnteringEndForward ?? false,
		);
		if (
			!blockAnimations?.carryScrollingEndForward &&
			!blockAnimations?.carrySceneActiveEndForward
		)
			resetValues(target);
	}
	evaluateTracks(
		tracks,
		progress,
		target,
		committedAnimationIds,
		"replace",
		!isEntering &&
			((blockAnimations?.carryScrollingEndForward ?? false) ||
				(blockAnimations?.carrySceneActiveEndForward ?? false)),
	);
	const scene = tale.indexMap.scenesById[sceneId];
	if (
		isSceneLoopActive(tale, scene, segment, scene?.reading.animations.ambient)
	)
		evaluateAmbient(blockAnimations?.ambient ?? [], timeMs, progress, target);
	const phaseLoop = opening
		? scene?.transition.animations.introLoop
		: isEntering
			? scene?.transition.animations.previousBridgeLoop
			: scene?.transition.animations.nextBridgeLoop;
	if (isSceneLoopActive(tale, scene, segment, phaseLoop))
		evaluateAmbient(
			opening
				? (blockAnimations?.sceneIntroLoop ?? [])
				: isEntering
					? (blockAnimations?.previousBridgeLoop ?? [])
					: (blockAnimations?.nextBridgeLoop ?? []),
			timeMs,
			progress,
			target,
		);
	evaluateHover(
		blockAnimations?.hover ?? [],
		blockAnimations?.hoverDurationMs ?? 200,
		hovered,
		timeMs,
		target,
	);
	return true;
}

function getSceneActiveProgress(
	plan: ReaderAnimationPlan,
	sceneId: string,
	segment: TimelineSegment,
	segmentProgress: number,
): number {
	const range = plan.sceneActiveRangeById.get(sceneId);
	if (!range) return segment.type === "transition" ? 0 : segmentProgress;
	if (segment.type === "transition")
		return segment.fromSceneId === sceneId ? 1 : 0;
	const scroll = lerp(segment.start, segment.end, segmentProgress);
	return (
		clamp(scroll - range.start, 0, range.end - range.start) /
		Math.max(range.end - range.start, 0.0001)
	);
}

/**
 * Evaluates the destination block's custom takeover tracks onto one previous
 * visible block while that destination block is intro.
 *
 * @param plan - Compiled animation plan.
 * @param destinationSceneId - Incoming block that owns the takeover policy.
 * @param progress - Normalized destination intro progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether any custom previous-visible tracks were applied.
 *
 * @example
 * evaluatePreviousVisibleBlockAnimation(plan, segment.toSceneId, 0.5, committedIds, values);
 */
export function evaluatePreviousVisibleBlockAnimation(
	plan: ReaderAnimationPlan,
	destinationSceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	target: AnimationValues,
): boolean {
	const destinationAnimations =
		plan.blockAnimationsById.get(destinationSceneId);
	const tracks = destinationAnimations?.previousVisibleDuringEnter ?? [];
	if (tracks.length === 0) return false;
	evaluateTracks(tracks, progress, target, committedAnimationIds);
	return true;
}

/**
 * Evaluates a fragment animation into a reusable values object.
 *
 * @param plan - Compiled animation plan.
 * @param elementId - Fragment being painted.
 * @param segment - Active timeline segment.
 * @param sceneId - Owning block id.
 * @param progress - Normalized segment progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable values object reused by the caller.
 * @returns Whether the fragment requires an animation style write.
 */
export function evaluateElementAnimation(
	plan: ReaderAnimationPlan,
	elementId: string,
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered = false,
): boolean {
	const animations = plan.fragmentAnimationsById.get(elementId);
	const states = plan.elementKeyframes.get(elementId);
	if (animations) {
		if (!states?.length) {
			const bridgePainted = evaluateSceneBridgeEntityAnimation(
				animations,
				segment,
				sceneId,
				progress,
				committedAnimationIds,
				timeMs,
				target,
				hovered,
			);
			if (bridgePainted !== null) return bridgePainted;
		}
		const framePhase = evaluateFramePhaseAnimation(
			animations,
			segment,
			progress,
			committedAnimationIds,
			timeMs,
			target,
			false,
		);
		if (framePhase !== null) return framePhase;
	}
	if (states?.length && animations) {
		resetValues(target);
		let index = states.findIndex(
			(item) =>
				segment.type !== "transition" &&
				!(segment.type === "pause" && segment.phaseOwner) &&
				item.id === segment.keyframeId,
		);
		if (index < 0) {
			for (let candidate = states.length - 1; candidate >= 0; candidate--) {
				if (
					(plan.keyframeRangeById.get(states[candidate]?.id ?? "")
						?.endSegmentIndex ?? Number.POSITIVE_INFINITY) < segment.index
				) {
					index = candidate;
					break;
				}
			}
			if (index < 0) {
				if (plan.defaultActiveElementIds.has(elementId)) {
					evaluateFragmentAmbient(animations, "active", timeMs, 1, target);
					evaluateSceneEntityTransition(
						animations,
						segment,
						sceneId,
						progress,
						committedAnimationIds,
						target,
					);
					evaluateHover(
						animations.hover,
						animations.hoverDurationMs,
						hovered,
						timeMs,
						target,
					);
					return true;
				}
				target.opacity = 0;
				evaluateSceneEntityTransition(
					animations,
					segment,
					sceneId,
					progress,
					committedAnimationIds,
					target,
				);
				return true;
			}
		}
		const state = states[index];
		if (!state) {
			target.opacity = 0;
			return true;
		}
		let carriedVisible = plan.defaultActiveElementIds.has(elementId);
		if (!carriedVisible) target.opacity = 0;
		// Rebuild the prior end state so reverse scrolling and direct jumps agree.
		for (const previous of states.slice(0, index)) {
			if (doesKeyframeStateEndInactive(previous.state)) {
				target.opacity = 0;
				carriedVisible = false;
			} else if (previous.state !== "continue") {
				if (!carriedVisible) resetValues(target);
				evaluateTracks(previous.tracks, 1, target, committedAnimationIds);
				carriedVisible = true;
			}
		}
		if (isInactiveKeyframeState(state.state)) {
			target.opacity = 0;
			evaluateSceneEntityTransition(
				animations,
				segment,
				sceneId,
				progress,
				committedAnimationIds,
				target,
			);
			return true;
		}
		if (state.state === "continue") {
			if (!carriedVisible) target.opacity = 0;
			else {
				evaluateFragmentAmbient(animations, "active", timeMs, 1, target);
				evaluateSceneEntityTransition(
					animations,
					segment,
					sceneId,
					progress,
					committedAnimationIds,
					target,
				);
				evaluateHover(
					animations.hover,
					animations.hoverDurationMs,
					hovered,
					timeMs,
					target,
				);
			}
			return true;
		}
		if (!carriedVisible) resetValues(target);
		const ownSegment =
			segment.type !== "transition" &&
			!(segment.type === "pause" && segment.phaseOwner) &&
			segment.keyframeId === state.id;
		let amount = 1;
		if (ownSegment) {
			if (state.state === "intro")
				amount =
					segment.type === "pause" && segment.pauseType === "frame-enter"
						? progress
						: 1;
			else if (state.state === "outro")
				amount =
					segment.type === "pause" && segment.pauseType === "frame-leave"
						? progress
						: 0;
			else
				amount =
					segment.type === "reading"
						? progress
						: segment.type === "pause" &&
								(segment.pauseType === "start" ||
									segment.pauseType === "frame-enter")
							? 0
							: 1;
		}
		evaluateTracks(state.tracks, amount, target, committedAnimationIds);
		evaluateSceneEntityTransition(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			target,
		);
		const phase =
			state.state === "intro"
				? "intro"
				: state.state === "outro"
					? "outro"
					: "active";
		evaluateFragmentAmbient(animations, phase, timeMs, amount, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (!animations?.hasAnimation) return false;
	const linkedKeyframeIds = plan.keyframeIdsByElementId.get(elementId);
	if (linkedKeyframeIds?.length) {
		const progressionRange = plan.elementProgressionRangeById.get(elementId);
		if (!progressionRange)
			return evaluateFrameOwnedEntityAnimation(
				plan,
				animations,
				linkedKeyframeIds,
				segment,
				sceneId,
				progress,
				committedAnimationIds,
				timeMs,
				target,
				hovered,
			);
		return evaluateKeyframeOwnedEntityAnimation(
			plan,
			animations,
			linkedKeyframeIds[0] as string,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			timeMs,
			target,
			hovered,
			progressionRange,
		);
	}
	resetValues(target);

	if (segment.type === "reading" && segment.sceneId === sceneId) {
		evaluateReadingFragment(
			animations,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, "active", timeMs, progress, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.type === "pause" && segment.sceneId === sceneId) {
		evaluateReadingFragment(
			animations,
			segment.pauseType === "start" || segment.pauseType === "frame-enter"
				? 0
				: 1,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(
			animations,
			"active",
			timeMs,
			segment.pauseType === "start" || segment.pauseType === "frame-enter"
				? 0
				: 1,
			target,
		);
		evaluateSceneEntityTransition(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.type === "transition" && segment.toSceneId === sceneId) {
		evaluateReadingFragment(animations, 0, committedAnimationIds, target);
		evaluateSceneEntityTransition(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, "intro", timeMs, 0, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.type === "transition" && segment.fromSceneId === sceneId) {
		evaluateReadingFragment(animations, 1, committedAnimationIds, target);
		evaluateSceneEntityTransition(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, "outro", timeMs, 1, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	target.opacity = 0;
	evaluateFragmentAmbient(animations, "intro", timeMs, 0, target);
	return true;
}

function evaluateFramePhaseAnimation(
	animations: ElementAnimationPlan,
	segment: TimelineSegment,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	directFrame: boolean,
): boolean | null {
	if (
		segment.type !== "pause" ||
		segment.phaseOwner !== "frame" ||
		!segment.framePhase ||
		!animations.timelineFrameId
	)
		return null;
	const incoming =
		segment.framePhase === "bridge" &&
		segment.toFrameId === animations.timelineFrameId;
	const outgoing =
		segment.framePhase === "bridge" &&
		segment.fromFrameId === animations.timelineFrameId;
	const ownPhase =
		segment.frameId === animations.timelineFrameId &&
		(segment.framePhase === "intro" || segment.framePhase === "outro");
	if (!incoming && !outgoing && !ownPhase) return null;
	resetValues(target);
	const show = directFrame
		? true
		: segment.framePhase === "intro"
			? animations.showDuringFrameIntro
			: segment.framePhase === "outro"
				? animations.showDuringFrameOutro
				: incoming
					? animations.showDuringPreviousFrameBridge
					: animations.showDuringNextFrameBridge;
	if (!show) {
		target.opacity = 0;
		return true;
	}
	const tracks = directFrame
		? segment.framePhase === "intro"
			? animations.intro
			: segment.framePhase === "outro"
				? animations.outro
				: incoming
					? animations.previousFrameBridge
					: animations.nextFrameBridge
		: segment.framePhase === "intro"
			? animations.frameIntro
			: segment.framePhase === "outro"
				? animations.frameOutro
				: incoming
					? animations.previousFrameBridge
					: animations.nextFrameBridge;
	evaluateTracks(tracks, progress, target, committedAnimationIds);
	if (directFrame && segment.framePhase !== "bridge")
		evaluateAmbient(
			segment.framePhase === "intro"
				? animations.introLoop
				: animations.outroLoop,
			timeMs,
			progress,
			target,
		);
	if (segment.framePhase === "bridge")
		evaluateAmbient(
			incoming
				? animations.previousFrameBridgeLoop
				: animations.nextFrameBridgeLoop,
			timeMs,
			progress,
			target,
		);
	return true;
}

/**
 * Evaluates one node animation using the same timeline semantics as fragments.
 *
 * @param plan - Compiled reader animation plan.
 * @param frameId - Node being painted.
 * @param segment - Active reader segment.
 * @param sceneId - Node owner block id.
 * @param progress - Normalized segment progress.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param timeMs - Current animation clock.
 * @param target - Reusable output values.
 * @returns Whether the node needs an animation style write.
 */
export function evaluateNodeAnimation(
	plan: ReaderAnimationPlan,
	frameId: string,
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered = false,
): boolean {
	const animations = plan.nodeAnimationsById.get(frameId);
	if (!animations) return false;
	const actionStates = plan.nodeKeyframes.get(frameId);
	if (!actionStates?.length) {
		const bridgePainted = evaluateSceneBridgeEntityAnimation(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			timeMs,
			target,
			hovered,
		);
		if (bridgePainted !== null) return bridgePainted;
	}
	const framePhase = evaluateFramePhaseAnimation(
		animations,
		segment,
		progress,
		committedAnimationIds,
		timeMs,
		target,
		animations.timelineFrameId === frameId,
	);
	if (framePhase !== null) return framePhase;
	if (actionStates?.length) {
		const painted = evaluateSparseKeyframeActions(
			plan,
			actionStates,
			plan.defaultActiveFrameIds.has(frameId),
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			timeMs,
			target,
			hovered,
		);
		if (
			segment.type === "reading" &&
			segment.sceneId === sceneId &&
			target.opacity !== 0
		) {
			evaluateTracks(
				animations.active,
				progress,
				target,
				committedAnimationIds,
			);
		}
		return painted;
	}
	const linkedKeyframeIds = plan.keyframeIdsByFrameId.get(frameId);
	const firstRange = linkedKeyframeIds?.flatMap((id) => {
		const range = plan.keyframeRangeById.get(id);
		return range ? [range] : [];
	})[0];
	const visibleDuringIncomingPhase =
		segment.type === "transition" &&
		segment.toSceneId === sceneId &&
		(segment.phase === "opening" || segment.fromSceneId === null
			? animations.showDuringSceneIntro
			: animations.showDuringPreviousBridge &&
				segment.incomingBridgeEnabled !== false);
	if (
		plan.hiddenBeforeIntroFrames.has(frameId) &&
		!visibleDuringIncomingPhase &&
		(!firstRange || segment.index < firstRange.startSegmentIndex)
	) {
		resetValues(target);
		target.opacity = 0;
		return true;
	}
	if (linkedKeyframeIds?.length)
		return evaluateFrameOwnedEntityAnimation(
			plan,
			animations,
			linkedKeyframeIds,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			timeMs,
			target,
			hovered,
		);
	return evaluateEntityAnimation(
		animations,
		segment,
		sceneId,
		progress,
		committedAnimationIds,
		timeMs,
		target,
		hovered,
	);
}

function evaluateSparseKeyframeActions(
	plan: ReaderAnimationPlan,
	states: Array<{
		id: string;
		state: KeyframeAction["type"];
		tracks: CompiledAnimationSelection;
	}>,
	defaultActive: boolean,
	animations: ElementAnimationPlan,
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered: boolean,
): boolean {
	resetValues(target);
	let index = states.findIndex(
		(state) =>
			segment.type !== "transition" &&
			!(segment.type === "pause" && segment.phaseOwner) &&
			state.id === segment.keyframeId,
	);
	if (index < 0) {
		for (let candidate = states.length - 1; candidate >= 0; candidate--) {
			if (
				(plan.keyframeRangeById.get(states[candidate]?.id ?? "")
					?.endSegmentIndex ?? Number.POSITIVE_INFINITY) < segment.index
			) {
				index = candidate;
				break;
			}
		}
	}
	let visible = defaultActive;
	for (const previous of states.slice(0, Math.max(index, 0))) {
		if (doesKeyframeStateEndInactive(previous.state)) visible = false;
		else if (previous.state !== "continue") visible = true;
	}
	const state = index >= 0 ? states[index] : undefined;
	if (!state || state.state === "continue") {
		if (!visible) target.opacity = 0;
		else evaluateFragmentAmbient(animations, "active", timeMs, 1, target);
		evaluateSceneEntityTransition(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			target,
		);
		return true;
	}
	if (isInactiveKeyframeState(state.state)) {
		target.opacity = 0;
		return true;
	}
	const ownSegment =
		segment.type !== "transition" &&
		!(segment.type === "pause" && segment.phaseOwner) &&
		segment.keyframeId === state.id;
	let amount = 1;
	if (ownSegment) {
		if (state.state === "intro" || state.state === "show")
			amount =
				segment.type === "pause" && segment.pauseType === "frame-enter"
					? progress
					: 1;
		else if (state.state === "outro")
			amount =
				segment.type === "pause" && segment.pauseType === "frame-leave"
					? progress
					: 0;
		else amount = segment.type === "reading" ? progress : 1;
	}
	evaluateTracks(state.tracks, amount, target, committedAnimationIds);
	evaluateSceneEntityTransition(
		animations,
		segment,
		sceneId,
		progress,
		committedAnimationIds,
		target,
	);
	evaluateFragmentAmbient(
		animations,
		state.state === "intro"
			? "intro"
			: state.state === "outro"
				? "outro"
				: "active",
		timeMs,
		amount,
		target,
	);
	evaluateHover(
		animations.hover,
		animations.hoverDurationMs,
		hovered,
		timeMs,
		target,
	);
	return true;
}

function evaluateFrameOwnedEntityAnimation(
	plan: ReaderAnimationPlan,
	animations: ElementAnimationPlan,
	keyframeIds: readonly string[],
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered: boolean,
): boolean {
	if (!animations.hasAnimation) return false;
	resetValues(target);
	const ranges = keyframeIds.flatMap((id) => {
		const range = plan.keyframeRangeById.get(id);
		return range ? [range] : [];
	});
	const firstRange = ranges[0];
	const lastRange = ranges.at(-1);
	const activeKeyframeIndex =
		segment.type === "transition"
			? -1
			: keyframeIds.indexOf(segment.keyframeId);
	const paintInitial = (): void => {
		if (animations.applyInitialStateBeforeStart)
			evaluateTracks(
				animations.intro,
				0,
				target,
				committedAnimationIds,
				"replace",
				false,
				true,
			);
	};
	const paintReading = (value: number): void => {
		if (animations.carryEnteringEndForward)
			evaluateTracks(animations.intro, 1, target, committedAnimationIds);
		evaluateTracks(
			animations.active,
			value,
			target,
			committedAnimationIds,
			"replace",
			animations.carryEnteringEndForward,
		);
	};
	const paintLeaving = (value: number): void => {
		paintReading(1);
		if (!animations.carryScrollingEndForward) resetValues(target);
		evaluateTracks(
			animations.outro,
			value,
			target,
			committedAnimationIds,
			"replace",
			animations.carryScrollingEndForward,
		);
	};
	if (segment.type === "transition") {
		if (segment.toSceneId === sceneId) {
			paintInitial();
			evaluateSceneEntityTransition(
				animations,
				segment,
				sceneId,
				progress,
				committedAnimationIds,
				target,
			);
		} else if (segment.fromSceneId === sceneId) {
			paintReading(1);
			evaluateSceneEntityTransition(
				animations,
				segment,
				sceneId,
				progress,
				committedAnimationIds,
				target,
			);
		} else target.opacity = 0;
	} else if (segment.sceneId !== sceneId) {
		target.opacity = 0;
	} else if (activeKeyframeIndex < 0) {
		if (!firstRange || segment.index < firstRange.startSegmentIndex)
			paintInitial();
		else if (lastRange && segment.index > lastRange.endSegmentIndex)
			paintLeaving(1);
		else paintReading(1);
	} else {
		const local =
			(activeKeyframeIndex +
				(segment.type === "reading"
					? progress
					: segment.pauseType === "start" || segment.pauseType === "frame-enter"
						? 0
						: 1)) /
			Math.max(keyframeIds.length, 1);
		paintReading(local);
	}
	const phase =
		segment.type === "transition"
			? segment.toSceneId === sceneId
				? "intro"
				: "outro"
			: "active";
	evaluateFragmentAmbient(animations, phase, timeMs, progress, target);
	evaluateHover(
		animations.hover,
		animations.hoverDurationMs,
		hovered,
		timeMs,
		target,
	);
	return true;
}

function isInactiveKeyframeState(state: KeyframeAction["type"]): boolean {
	return ["inactive", "hide", "disable", "stop", "pause"].includes(state);
}

function doesKeyframeStateEndInactive(state: KeyframeAction["type"]): boolean {
	return state === "outro" || isInactiveKeyframeState(state);
}

/** Paints a Frame or nested Element against the Keyframe that owns its progression. */
function evaluateKeyframeOwnedEntityAnimation(
	plan: ReaderAnimationPlan,
	animations: ElementAnimationPlan,
	keyframeId: string,
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered: boolean,
	progressionRange: ElementProgressionRange | undefined,
): boolean {
	if (!animations.hasAnimation) return false;
	resetValues(target);
	const range = plan.keyframeRangeById.get(keyframeId);
	const paintInitialState = (): void => {
		if (animations.applyInitialStateBeforeStart) {
			evaluateTracks(
				animations.intro,
				0,
				target,
				committedAnimationIds,
				"replace",
				false,
				true,
			);
		}
	};
	const paintReadingState = (readingProgress: number): void => {
		if (animations.carryEnteringEndForward) {
			evaluateTracks(animations.intro, 1, target, committedAnimationIds);
		}
		evaluateTracks(
			animations.active,
			readingProgress,
			target,
			committedAnimationIds,
			"replace",
			animations.carryEnteringEndForward,
		);
	};
	const paintLeavingState = (leavingProgress: number): void => {
		paintReadingState(1);
		if (!animations.carryScrollingEndForward) resetValues(target);
		evaluateTracks(
			animations.outro,
			leavingProgress,
			target,
			committedAnimationIds,
			"replace",
			animations.carryScrollingEndForward,
		);
	};
	if (
		progressionRange &&
		segment.type === "reading" &&
		segment.sceneId === sceneId &&
		segment.keyframeId === keyframeId
	) {
		if (progress < progressionRange.start) {
			paintInitialState();
			evaluateFragmentAmbient(animations, "intro", timeMs, 0, target);
		} else if (progress < progressionRange.enterEnd) {
			const local = normalizeRange(
				progress,
				progressionRange.start,
				progressionRange.enterEnd,
			);
			evaluateTracks(animations.intro, local, target, committedAnimationIds);
			evaluateFragmentAmbient(animations, "intro", timeMs, local, target);
		} else if (progress < progressionRange.readStart) {
			evaluateTracks(animations.intro, 1, target, committedAnimationIds);
			evaluateFragmentAmbient(animations, "intro", timeMs, 1, target);
		} else if (progress <= progressionRange.readEnd) {
			const local = normalizeRange(
				progress,
				progressionRange.readStart,
				progressionRange.readEnd,
			);
			paintReadingState(local);
			evaluateFragmentAmbient(animations, "active", timeMs, local, target);
		} else if (progress < progressionRange.leaveStart) {
			paintReadingState(1);
			evaluateFragmentAmbient(animations, "active", timeMs, 1, target);
		} else if (progress < progressionRange.end) {
			const local = normalizeRange(
				progress,
				progressionRange.leaveStart,
				progressionRange.end,
			);
			paintLeavingState(local);
			evaluateFragmentAmbient(animations, "outro", timeMs, local, target);
		} else {
			paintLeavingState(1);
			evaluateFragmentAmbient(animations, "outro", timeMs, 1, target);
		}
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}

	if (segment.type === "transition") {
		if (segment.toSceneId === sceneId) {
			paintInitialState();
			evaluateSceneEntityTransition(
				animations,
				segment,
				sceneId,
				progress,
				committedAnimationIds,
				target,
			);
		} else if (segment.fromSceneId === sceneId) {
			paintReadingState(1);
			evaluateSceneEntityTransition(
				animations,
				segment,
				sceneId,
				progress,
				committedAnimationIds,
				target,
			);
		} else target.opacity = 0;
		evaluateFragmentAmbient(
			animations,
			segment.toSceneId === sceneId ? "intro" : "outro",
			timeMs,
			segment.toSceneId === sceneId ? 0 : 1,
			target,
		);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.sceneId !== sceneId) {
		target.opacity = 0;
		return true;
	}
	if (segment.keyframeId !== keyframeId) {
		if (!range || segment.index < range.startSegmentIndex) paintInitialState();
		else paintLeavingState(1);
		evaluateFragmentAmbient(
			animations,
			range && segment.index > range.endSegmentIndex ? "outro" : "intro",
			timeMs,
			range && segment.index > range.endSegmentIndex ? 1 : 0,
			target,
		);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}

	if (segment.type === "reading") {
		paintReadingState(progress);
		evaluateFragmentAmbient(animations, "active", timeMs, progress, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.pauseType === "frame-enter") {
		evaluateTracks(animations.intro, progress, target, committedAnimationIds);
		evaluateFragmentAmbient(animations, "intro", timeMs, progress, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.pauseType === "frame-leave") {
		paintLeavingState(progress);
		evaluateFragmentAmbient(animations, "outro", timeMs, progress, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	const readingProgress = segment.pauseType === "start" ? 0 : 1;
	paintReadingState(readingProgress);
	evaluateFragmentAmbient(
		animations,
		"active",
		timeMs,
		readingProgress,
		target,
	);
	evaluateHover(
		animations.hover,
		animations.hoverDurationMs,
		hovered,
		timeMs,
		target,
	);
	return true;
}

/**
 * Evaluates a compiled node or fragment animation plan.
 *
 * @param animations - Compiled entity animations.
 * @param segment - Active reader segment.
 * @param sceneId - Owning block id.
 * @param progress - Segment progress.
 * @param committedAnimationIds - Completed one-way track ids.
 * @param timeMs - Current animation clock.
 * @param target - Reusable output values.
 * @returns Whether styles should be written.
 */
function evaluateEntityAnimation(
	animations: ElementAnimationPlan,
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered: boolean,
): boolean {
	if (!animations.hasAnimation) return false;
	resetValues(target);
	if (segment.type === "reading" && segment.sceneId === sceneId) {
		evaluateReadingFragment(
			animations,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, "active", timeMs, progress, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.type === "pause" && segment.sceneId === sceneId) {
		const readingProgress =
			segment.pauseType === "start" || segment.pauseType === "frame-enter"
				? 0
				: 1;
		evaluateReadingFragment(
			animations,
			readingProgress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(
			animations,
			"active",
			timeMs,
			readingProgress,
			target,
		);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.type === "transition" && segment.toSceneId === sceneId) {
		evaluateReadingFragment(animations, 0, committedAnimationIds, target);
		evaluateSceneEntityTransition(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, "intro", timeMs, progress, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	if (segment.type === "transition" && segment.fromSceneId === sceneId) {
		evaluateReadingFragment(animations, 1, committedAnimationIds, target);
		evaluateSceneEntityTransition(
			animations,
			segment,
			sceneId,
			progress,
			committedAnimationIds,
			target,
		);
		evaluateFragmentAmbient(animations, "outro", timeMs, progress, target);
		evaluateHover(
			animations.hover,
			animations.hoverDurationMs,
			hovered,
			timeMs,
			target,
		);
		return true;
	}
	target.opacity = 0;
	return true;
}

/**
 * Composes one fragment's repeating tracks over its timeline animation.
 *
 * @param animations - Compiled fragment animation plan.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable animation values receiving the composition.
 * @returns Nothing.
 *
 * @example
 * evaluateFragmentAmbient(animations, performance.now(), values);
 */
function evaluateFragmentAmbient(
	animations: ElementAnimationPlan,
	phase: "intro" | "outro" | "active",
	timeMs: number,
	readingProgress: number,
	target: AnimationValues,
): void {
	evaluateAmbient(animations.ambient, timeMs, readingProgress, target);
	evaluateAmbient(
		phase === "intro"
			? animations.introLoop
			: phase === "outro"
				? animations.outroLoop
				: animations.activeLoop,
		timeMs,
		readingProgress,
		target,
	);
}

function evaluateSceneBridgeEntityAnimation(
	animations: ElementAnimationPlan,
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	timeMs: number,
	target: AnimationValues,
	hovered: boolean,
): boolean | null {
	if (
		segment.type !== "transition" ||
		segment.phase === "opening" ||
		segment.fromSceneId === null
	)
		return null;
	const incoming = segment.toSceneId === sceneId;
	const outgoing = segment.fromSceneId === sceneId;
	if (!incoming && !outgoing) return null;
	resetValues(target);
	const visible = incoming
		? animations.showDuringPreviousBridge &&
			segment.incomingBridgeEnabled !== false
		: animations.showDuringNextBridge &&
			segment.outgoingBridgeEnabled !== false;
	if (!visible) {
		target.opacity = 0;
		return true;
	}
	const tracks = incoming ? animations.previousBridge : animations.nextBridge;
	evaluateTracks(tracks, progress, target, committedAnimationIds);
	evaluateAmbient(
		incoming ? animations.previousBridgeLoop : animations.nextBridgeLoop,
		timeMs,
		progress,
		target,
	);
	// General loops and hover remain available in every Scene phase.
	evaluateAmbient(animations.ambient, timeMs, progress, target);
	evaluateHover(
		animations.hover,
		animations.hoverDurationMs,
		hovered,
		timeMs,
		target,
	);
	return true;
}

function evaluateSceneEntityTransition(
	animations: ElementAnimationPlan,
	segment: TimelineSegment,
	sceneId: string,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	target: AnimationValues,
): void {
	if (
		segment.type === "pause" &&
		segment.phaseOwner === "scene" &&
		segment.sceneId === sceneId
	) {
		const intro = segment.pauseType === "frame-enter";
		if (
			(intro && !animations.showDuringSceneIntro) ||
			(!intro && !animations.showDuringSceneOutro)
		)
			return;
		evaluateTracks(
			intro ? animations.sceneIntro : animations.sceneOutro,
			progress,
			target,
			committedAnimationIds,
		);
		return;
	}
	if (segment.type !== "transition") return;
	if (segment.phase === "opening" || segment.fromSceneId === null) {
		if (segment.toSceneId !== sceneId || !animations.showDuringSceneIntro)
			return;
		evaluateTracks(
			animations.sceneIntro,
			progress,
			target,
			committedAnimationIds,
		);
		return;
	}
	if (segment.toSceneId === sceneId) {
		if (
			!animations.showDuringPreviousBridge ||
			segment.incomingBridgeEnabled === false
		)
			return;
		evaluateTracks(
			animations.previousBridge,
			progress,
			target,
			committedAnimationIds,
		);
		evaluateAmbient(
			animations.previousBridgeLoop,
			performance.now(),
			progress,
			target,
		);
		return;
	}
	if (segment.fromSceneId === sceneId) {
		if (
			!animations.showDuringNextBridge ||
			segment.outgoingBridgeEnabled === false
		)
			return;
		evaluateTracks(
			animations.nextBridge,
			progress,
			target,
			committedAnimationIds,
		);
		evaluateAmbient(
			animations.nextBridgeLoop,
			performance.now(),
			progress,
			target,
		);
	}
}

function evaluateHover(
	tracks: CompiledAnimationSelection,
	durationMs: number,
	hovered: boolean,
	timeMs: number,
	target: AnimationValues,
): void {
	if (tracks.length === 0) return;
	let state = hoverStateByTracks.get(tracks);
	if (!state) {
		state = { changedAt: timeMs, hovered, startProgress: hovered ? 0 : 0 };
		hoverStateByTracks.set(tracks, state);
	} else if (state.hovered !== hovered) {
		const elapsed = Math.max(timeMs - state.changedAt, 0) / durationMs;
		const current = clamp(
			state.startProgress + (state.hovered ? elapsed : -elapsed),
			0,
			1,
		);
		state = { changedAt: timeMs, hovered, startProgress: current };
		hoverStateByTracks.set(tracks, state);
	}
	const elapsed = Math.max(timeMs - state.changedAt, 0) / durationMs;
	const hoverProgress = clamp(
		state.startProgress + (state.hovered ? elapsed : -elapsed),
		0,
		1,
	);
	evaluateTracks(
		tracks,
		hoverProgress,
		target,
		undefined,
		"compose",
		false,
		true,
	);
}

function isSceneLoopActive(
	tale: Tale,
	scene: ResolvedTaleScene | undefined,
	segment: TimelineSegment,
	selection: AmbientAnimationSelection | undefined,
): boolean {
	if (!scene || (!selection?.startFrameId && !selection?.endFrameId))
		return true;
	const frameIds = scene.frameIds.filter(
		(id) =>
			id !== scene.rootFrameId &&
			tale.indexMap.framesById[id]?.kind !== "group",
	);
	if (frameIds.length === 0) return true;
	const step =
		segment.type === "transition"
			? segment.toSceneId === scene.id
				? tale.indexMap.keyframesById[scene.keyframeIds[0] ?? ""]
				: tale.indexMap.keyframesById[scene.keyframeIds.at(-1) ?? ""]
			: tale.indexMap.keyframesById[segment.keyframeId];
	const activeIndex = findFrameIndex(frameIds, step?.frameId ?? null);
	if (activeIndex < 0) return true;
	const startIndex = Math.max(
		0,
		findFrameIndex(frameIds, selection.startFrameId ?? null),
	);
	const configuredEnd = findFrameIndex(frameIds, selection.endFrameId ?? null);
	const endIndex = configuredEnd < 0 ? frameIds.length - 1 : configuredEnd;
	return (
		activeIndex >= Math.min(startIndex, endIndex) &&
		activeIndex <= Math.max(startIndex, endIndex)
	);
}

function findFrameIndex(frameIds: string[], targetId: string | null): number {
	if (!targetId) return -1;
	const sourceId = targetId.split(":").at(-1) ?? targetId;
	return frameIds.findIndex(
		(id) => id === targetId || (id.split(":").at(-1) ?? id) === sourceId,
	);
}

function normalizeRange(value: number, start: number, end: number): number {
	return clamp((value - start) / Math.max(end - start, 0.0001), 0, 1);
}

/**
 * Creates a reusable identity animation values object.
 *
 * @returns Mutable identity values.
 */
export function createAnimationValues(): AnimationValues {
	return {
		blur: 0,
		opacity: 1,
		rotate: 0,
		scale: 1,
		translateX: 0,
		translateY: 0,
		translateZ: 0,
	};
}

/**
 * Writes evaluated animation values directly and skips unchanged properties.
 *
 * @param element - Animated DOM element.
 * @param values - Evaluated animation values.
 * @returns Nothing.
 */
export function writeAnimationValues(
	element: HTMLElement,
	values: AnimationValues,
): void {
	const opacity = String(values.opacity);
	const transform = `translate3d(${values.translateX}px, ${values.translateY}px, ${values.translateZ}px) scale(${values.scale}) rotate(${values.rotate}deg)`;
	const filter =
		Math.abs(values.blur) < 0.001 ? "none" : `blur(${values.blur}px)`;
	const previous = writtenValuesByElement.get(element);

	if (previous?.opacity !== opacity) element.style.opacity = opacity;
	if (previous?.transform !== transform) element.style.transform = transform;
	if (previous?.filter !== filter) element.style.filter = filter;
	element.dataset.readerAnimationWritten = "true";
	writtenValuesByElement.set(element, { filter, opacity, transform });
}

/**
 * Clears animation-owned inline styles from an element.
 *
 * Opacity is restored from the authored style when provided because the
 * animation painter writes to the same inline property React uses.
 */
export function resetAnimationStyles(
	element: HTMLElement,
	authoredOpacity?: number,
): void {
	element.style.removeProperty("filter");
	element.style.removeProperty("transform");
	if (authoredOpacity === undefined) element.style.removeProperty("opacity");
	else element.style.opacity = String(authoredOpacity);
	delete element.dataset.readerAnimationWritten;
	writtenValuesByElement.delete(element);
}

/**
 * Compiles normalized animation track ranges.
 *
 * @param tracks - Authored animation tracks.
 * @param commitPrefix - Stable prefix used for committed track identifiers.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Tracks with precomputed inverse durations.
 */
function compileTracks(
	tracks: readonly AnimationTrack[],
	commitPrefix: string,
	viewport: ViewportSize,
): CompiledAnimationSelection {
	return tracks.map((track, index) => {
		const id = track.id ?? `${track.property}-${index}`;
		const compiledTrack = compileTranslateTrack(track, viewport);
		return {
			...compiledTrack,
			commitId: `${commitPrefix}:${id}`,
			ease:
				gsap.parseEase(compiledTrack.easing ?? "power2.out") ?? defaultGsapEase,
			inverseDuration:
				1 / Math.max(0.0001, compiledTrack.end - compiledTrack.start),
			pathSampler:
				compiledTrack.property === "motionPath"
					? compileMotionPathSampler(compiledTrack.path)
					: undefined,
		};
	});
}

/**
 * Compiles ambient tracks as full-cycle animations without timeline offsets.
 *
 * @param tracks - Authored looping animation tracks.
 * @param fallbackDurationMs - Legacy selection duration used by older data.
 * @param fallbackPlayback - Legacy selection direction used by older data.
 * @param commitPrefix - Stable prefix used for committed track identifiers.
 * @param viewport - Active viewport used for relative translation values.
 * @returns Ambient tracks normalized to the complete repeating cycle.
 */
function compileAmbientTracks(
	tracks: readonly AnimationTrack[],
	fallbackDurationMs: number,
	fallbackPlayback: "alternate" | "restart",
	commitPrefix: string,
	viewport: ViewportSize,
): CompiledAnimationSelection {
	return compileTracks(
		tracks.map((track) => ({
			...track,
			end: 1,
			loopDurationSeconds:
				track.loopDurationSeconds ?? fallbackDurationMs / 1000,
			loopPlayback: track.loopPlayback ?? fallbackPlayback,
			start: 0,
		})),
		commitPrefix,
		viewport,
	);
}

function compileOptionalAmbientTracks(
	selection: AmbientAnimationSelection | undefined,
	commitPrefix: string,
	viewport: ViewportSize,
): CompiledAnimationSelection {
	return compileAmbientTracks(
		selection?.animations ?? [],
		selection?.cycleDurationMs ?? 2400,
		selection?.playback ?? "alternate",
		commitPrefix,
		viewport,
	);
}

/**
 * Converts viewport-relative translation values into pixels during compilation.
 *
 * @param track - Authored animation track.
 * @param viewport - Active viewport dimensions.
 * @returns Track with pixel translation values ready for frame evaluation.
 */
function compileTranslateTrack(
	track: AnimationTrack,
	viewport: ViewportSize,
): AnimationTrack {
	if (track.property !== "translate" || track.unit !== "viewport") return track;
	const depthScale = Math.min(viewport.width, viewport.height);
	return {
		...track,
		from: track.from * (track.axis === "y" ? viewport.height : viewport.width),
		fromY:
			track.axis === "xy" || track.axis === "xyz"
				? (track.fromY ?? 0) * viewport.height
				: track.fromY,
		fromZ: track.axis === "xyz" ? (track.fromZ ?? 0) * depthScale : track.fromZ,
		to: track.to * (track.axis === "y" ? viewport.height : viewport.width),
		toY:
			track.axis === "xy" || track.axis === "xyz"
				? (track.toY ?? 0) * viewport.height
				: track.toY,
		toZ: track.axis === "xyz" ? (track.toZ ?? 0) * depthScale : track.toZ,
		unit: "px",
	};
}

/**
 * Evaluates scroll-linked fragment tracks and visibility.
 *
 * @param animations - Fragment animation plan.
 * @param progress - Scene reading progress.
 * @param target - Mutable animation values.
 * @returns Nothing.
 */
function evaluateReadingFragment(
	animations: ElementAnimationPlan,
	progress: number,
	committedAnimationIds: ReadonlySet<string>,
	target: AnimationValues,
): void {
	const range = animations.visibleRange;
	const visible = progress >= range.start && progress <= range.end;
	const local = clamp(
		(progress - range.start) / Math.max(0.0001, range.end - range.start),
		0,
		1,
	);
	evaluateTracks(animations.active, local, target, committedAnimationIds);
	if (!visible) target.opacity = 0;
}

/**
 * Evaluates one track selection with later tracks replacing the same property.
 *
 * @param tracks - Compiled animation tracks.
 * @param progress - Normalized selection progress.
 * @param target - Mutable animation values.
 * @returns Nothing.
 */
function evaluateTracks(
	tracks: CompiledAnimationSelection,
	progress: number,
	target: AnimationValues,
	committedAnimationIds?: ReadonlySet<string>,
	composition: "compose" | "replace" = "replace",
	inheritStartValues = false,
	ignoreVisibility = false,
): void {
	for (const track of tracks) {
		if (!ignoreVisibility && !isTrackVisible(track, progress)) continue;
		const evaluatedProgress =
			track.playback === "commitOnComplete" &&
			committedAnimationIds?.has(track.commitId)
				? 1
				: progress;
		evaluateTrack(
			track,
			evaluatedProgress,
			target,
			composition,
			inheritStartValues,
		);
	}
}

/**
 * Evaluates one compiled animation track into mutable output values.
 *
 * @param track - Compiled animation track.
 * @param progress - Normalized track progress.
 * @param target - Mutable output values.
 * @param composition - Whether values replace or compose with current output.
 * @returns Nothing.
 */
function evaluateTrack(
	track: CompiledAnimationTrack,
	progress: number,
	target: AnimationValues,
	composition: "compose" | "replace",
	inheritStartValue = false,
): void {
	const local = track.ease(
		clamp((progress - track.start) * track.inverseDuration, 0, 1),
	);
	switch (track.property) {
		case "opacity": {
			const opacityFrom = inheritStartValue ? target.opacity : track.from;
			target.opacity =
				composition === "compose"
					? target.opacity * lerp(opacityFrom, track.to, local)
					: lerp(opacityFrom, track.to, local);
			break;
		}
		case "translate":
			if (track.axis === "x") {
				const from = inheritStartValue ? target.translateX : track.from;
				target.translateX =
					composition === "compose"
						? target.translateX + lerp(from, track.to, local)
						: lerp(from, track.to, local);
			} else if (track.axis === "y") {
				const from = inheritStartValue ? target.translateY : track.from;
				target.translateY =
					composition === "compose"
						? target.translateY + lerp(from, track.to, local)
						: lerp(from, track.to, local);
			} else {
				const x = lerp(
					inheritStartValue ? target.translateX : track.from,
					track.to,
					local,
				);
				const y = lerp(
					inheritStartValue ? target.translateY : (track.fromY ?? 0),
					track.toY ?? 0,
					local,
				);
				target.translateX =
					composition === "compose" ? target.translateX + x : x;
				target.translateY =
					composition === "compose" ? target.translateY + y : y;
				if (track.axis === "xyz") {
					const z = lerp(
						inheritStartValue ? target.translateZ : (track.fromZ ?? 0),
						track.toZ ?? 0,
						local,
					);
					target.translateZ =
						composition === "compose" ? target.translateZ + z : z;
				}
			}
			break;
		case "scale": {
			const scaleFrom = inheritStartValue ? target.scale : track.from;
			target.scale =
				composition === "compose"
					? target.scale * lerp(scaleFrom, track.to, local)
					: lerp(scaleFrom, track.to, local);
			break;
		}
		case "rotate": {
			const rotateFrom = inheritStartValue ? target.rotate : track.from;
			target.rotate =
				composition === "compose"
					? target.rotate + lerp(rotateFrom, track.to, local)
					: lerp(rotateFrom, track.to, local);
			break;
		}
		case "blur":
			target.blur =
				(composition === "compose" ? target.blur : 0) +
				Math.sin(local * Math.PI) * track.strength;
			break;
		case "motionPath": {
			const point = track.pathSampler?.(lerp(track.from, track.to, local));
			if (!point) break;
			target.translateX =
				composition === "compose" ? target.translateX + point.x : point.x;
			target.translateY =
				composition === "compose" ? target.translateY + point.y : point.y;
			break;
		}
	}
}

/**
 * Evaluates continuously repeating tracks with independent timing.
 *
 * @param tracks - Compiled looping tracks.
 * @param timeMs - Current animation clock time.
 * @param target - Mutable animation values.
 * @returns Nothing.
 */
function evaluateAmbient(
	tracks: CompiledAnimationSelection,
	timeMs: number,
	readingProgress: number,
	target: AnimationValues,
): void {
	for (const track of tracks) {
		if (!isTrackVisible(track, readingProgress)) continue;
		const durationMs = Math.max((track.loopDurationSeconds ?? 2.4) * 1000, 100);
		const cycle = (timeMs % durationMs) / durationMs;
		const progress =
			(track.loopPlayback ?? "alternate") === "alternate"
				? cycle <= 0.5
					? cycle * 2
					: (1 - cycle) * 2
				: cycle;
		evaluateTrack(track, progress, target, "compose", false);
	}
}

/**
 * Restores a reusable values object to transform identity.
 *
 * @param values - Mutable animation values.
 * @returns Nothing.
 */
function resetValues(values: AnimationValues): void {
	values.blur = 0;
	values.opacity = 1;
	values.rotate = 0;
	values.scale = 1;
	values.translateX = 0;
	values.translateY = 0;
	values.translateZ = 0;
}

/**
 * Returns whether a track is active inside its authored visibility window.
 *
 * @param track - Compiled animation track.
 * @param progress - Current normalized block progress.
 * @returns Whether the track should contribute animation values.
 */
function isTrackVisible(
	track: CompiledAnimationTrack,
	progress: number,
): boolean {
	const range = track.visibleRange ?? { end: 1, start: 0 };
	return progress >= range.start && progress <= range.end;
}

/**
 * Compiles an SVG path string into a reusable point sampler.
 *
 * @param pathData - SVG path data.
 * @returns Path sampler, or undefined when the path is invalid.
 */
function compileMotionPathSampler(
	pathData: string,
): ((progress: number) => { x: number; y: number }) | undefined {
	if (typeof document === "undefined" || !pathData.trim()) return undefined;
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", pathData);
	try {
		const length = path.getTotalLength();
		if (!Number.isFinite(length) || length <= 0) return undefined;
		return (progress) => {
			const point = path.getPointAtLength(clamp(progress, 0, 1) * length);
			return { x: point.x, y: point.y };
		};
	} catch {
		return undefined;
	}
}

/**
 * Finds one-way animation tracks completed by the active timeline state.
 *
 * @param plan - Compiled animation plan.
 * @param sceneId - Scene being evaluated.
 * @param segment - Active timeline segment.
 * @param progress - Normalized segment progress.
 * @returns Completed animation track ids.
 */
export function getCompletedAnimationIds(
	plan: ReaderAnimationPlan,
	sceneId: string,
	segment: TimelineSegment,
	progress: number,
): string[] {
	const plans = [...getEntityPlansForBlock(plan, sceneId)];
	const completed: string[] = [];
	for (const animation of plans) {
		const tracks =
			segment.type === "transition"
				? segment.phase === "opening" || segment.fromSceneId === null
					? animation.sceneIntro
					: segment.toSceneId === sceneId
						? animation.previousBridge
						: animation.nextBridge
				: animation.active;
		for (const track of tracks) {
			if (
				track.playback === "commitOnComplete" &&
				progress >= track.end &&
				isTrackVisible(track, progress)
			) {
				completed.push(track.commitId);
			}
		}
	}
	const blockAnimations = plan.blockAnimationsById.get(sceneId);
	const blockTracks =
		segment.type === "transition"
			? segment.phase === "opening" || segment.fromSceneId === null
				? (blockAnimations?.sceneIntro ?? [])
				: segment.toSceneId === sceneId
					? (blockAnimations?.previousBridge ?? [])
					: (blockAnimations?.nextBridge ?? [])
			: (blockAnimations?.active ?? []);
	for (const track of blockTracks) {
		if (
			track.playback === "commitOnComplete" &&
			progress >= track.end &&
			isTrackVisible(track, progress)
		) {
			completed.push(track.commitId);
		}
	}
	if (segment.type !== "transition") {
		const sceneProgress = getSceneActiveProgress(
			plan,
			sceneId,
			segment,
			progress,
		);
		for (const track of blockAnimations?.sceneActive ?? []) {
			if (
				track.playback === "commitOnComplete" &&
				sceneProgress >= track.end &&
				isTrackVisible(track, sceneProgress)
			) {
				completed.push(track.commitId);
			}
		}
	}
	return completed;
}

/**
 * Collects fragment and node animation plans owned by a block.
 *
 * @param plan - Compiled animation plan.
 * @param sceneId - Owner block id.
 * @returns Entity animation plans for that block.
 */
function getEntityPlansForBlock(
	plan: ReaderAnimationPlan,
	sceneId: string,
): ElementAnimationPlan[] {
	return [
		...(plan.animatedElementIdsBySceneId.get(sceneId) ?? []).flatMap((id) => {
			const item = plan.fragmentAnimationsById.get(id);
			return item ? [item] : [];
		}),
		...(plan.animatedFrameIdsBySceneId.get(sceneId) ?? []).flatMap((id) => {
			const item = plan.nodeAnimationsById.get(id);
			return item ? [item] : [];
		}),
	];
}
