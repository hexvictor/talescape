import { serializeResponsiveSceneFrames } from "~/app/(tale-app)/_shared/services/responsiveFrames";
import {
	getTaleBranches,
	getTaleElements,
	getTaleFrames,
	getTaleKeyframes,
	getTalePaths,
	getTaleScenes,
} from "~/app/(tale-app)/_shared/services/taleLookups";
import type {
	AmbientAnimationSelection,
	AnimationSelection,
	HoverAnimationSelection,
	SceneSize,
	Tale,
	TaleElement,
	TaleFrame,
	TaleScene,
} from "~/app/(tale-app)/_shared/types";

/**
 * Creates the normalized save payload for existing editable tale rows.
 *
 * @param tale - Current in-memory tale state.
 * @returns Payload accepted by the Tale Studio save mutation.
 *
 * @example
 * const payload = createTaleStudioDraftPayload(tale);
 */
export function createTaleStudioDraftPayload(tale: Tale) {
	const sceneIdByFrameId = new Map<string, string>();
	for (const scene of getTaleScenes(tale)) {
		for (const frameId of scene.frameIds)
			sceneIdByFrameId.set(frameId, scene.id);
	}
	return {
		backgroundConfig: tale.backgroundConfig,
		breakpointConfig: tale.breakpoints,
		branches: getTaleBranches(tale)
			.filter((branch) => Number.isFinite(Number(branch.id)))
			.map((branch) => ({
				description: branch.description ?? null,
				id: Number(branch.id),
				order: branch.order,
				parentBranchId:
					branch.parentBranchId === null ? null : Number(branch.parentBranchId),
				title: branch.title,
			})),
		scenes: getTaleScenes(tale)
			.filter((block) => Number.isFinite(Number(block.id)))
			.map((block) => ({
				containerConfig: serializeSceneContainerConfig(block),
				branchId: Number(block.branchId),
				description: block.description ?? null,
				id: Number(block.id),
				isChoiceScene: block.isChoiceScene,
				order: block.order,
				readingConfig: serializeReadingConfig(block),
				sizeConfig: serializeSizeConfig(block.size),
				sizeMode: (block.size.mode === "manual"
					? "fixed"
					: "contentResponsive") as "fixed" | "contentResponsive",
				snap: block.snap,
				responsiveConfig: serializeResponsiveSceneFrames(
					block,
					tale.indexMap.framesById,
				),
				styleConfig: block.style ?? null,
				title: block.title,
				transitionConfig: serializeTransitionConfig(block),
			})),
		description: tale.description ?? "",
		firstSceneTransitionMode: tale.firstSceneTransitionMode ?? "fromPlacement",
		elements: getTaleElements(tale)
			.filter((fragment) => Number.isFinite(Number(fragment.id)))
			.map((fragment) => ({
				animationConfig: serializeElementAnimationConfig(fragment),
				content: serializeElementContent(fragment),
				data: serializeElementContent(fragment),
				id: Number(fragment.id),
				frameId: fragment.frameId === null ? null : Number(fragment.frameId),
				order: fragment.order,
				placementConfig: fragment.placement,
				responsiveConfig: fragment.responsiveOverrides ?? {},
				sceneId: getElementSceneId(fragment, sceneIdByFrameId),
				styleConfig: fragment.style ?? null,
				type: fragment.type,
				visibleRange: fragment.visibleRange ?? null,
			})),
		frames: getTaleFrames(tale)
			.filter((node) => Number.isFinite(Number(node.id)))
			.map((node) => ({
				animationConfig: serializeElementAnimationConfig(node),
				config: serializeFrameConfig(node),
				id: Number(node.id),
				name: node.name ?? null,
				order: node.style?.order ?? 0,
				parentFrameId:
					node.parentFrameId === null ? null : Number(node.parentFrameId),
				sceneId: Number(sceneIdByFrameId.get(node.id)),
				styleConfig: node.style ?? null,
			})),
		paths: getTalePaths(tale)
			.filter((path) => Number.isFinite(Number(path.id)))
			.map((path) => ({
				description: path.description ?? null,
				fromSceneId: Number(path.fromSceneId),
				fromKeyframeId:
					path.fromKeyframeId === null ? null : Number(path.fromKeyframeId),
				fromBranchId: Number(path.fromBranchId),
				id: Number(path.id),
				label: path.label,
				order: path.order,
				toSceneId: Number(path.toSceneId),
				toKeyframeId:
					path.toKeyframeId === null ? null : Number(path.toKeyframeId),
				toBranchId: Number(path.toBranchId),
				type: path.type,
			})),
		pages: tale.order.pageIds.flatMap((pageId) => {
			const page = tale.indexMap.pagesById[pageId];
			return page
				? [
						{
							description: page.description ?? null,
							entryId: Number(page.entryId),
							id: Number(page.id),
							isPaginated: page.isPaginated,
							order: page.order,
							partId: Number(page.partId),
							title: page.title ?? null,
							type: page.type,
						},
					]
				: [];
		}),
		entries: tale.order.entryIds.flatMap((entryId) => {
			const entry = tale.indexMap.entriesById[entryId];
			return entry
				? [
						{
							description: entry.description ?? null,
							id: Number(entry.id),
							isNumbered: entry.isNumbered,
							order: entry.order,
							partId: Number(entry.partId),
							title: entry.title,
							type: entry.type,
						},
					]
				: [];
		}),
		parts: tale.order.partIds.flatMap((partId) => {
			const part = tale.indexMap.partsById[partId];
			return part
				? [
						{
							description: part.description ?? null,
							id: Number(part.id),
							order: part.order,
							title: part.title,
						},
					]
				: [];
		}),
		keyframes: getTaleKeyframes(tale)
			.filter((step) => Number.isFinite(Number(step.id)))
			.map((step) => ({
				responsiveConfig: step.responsiveOverrides ?? {},
				actions: step.actions,
				branchId: Number(step.branchId),
				description: step.description ?? null,
				frameId: step.frameId == null ? null : Number(step.frameId),
				id: Number(step.id),
				order: step.order,
				pageId: step.pageId === null ? null : Number(step.pageId),
				readingConfig: serializeKeyframeReadingConfig(step),
				sceneId: Number(step.sceneId),
				snapConfig: step.snap,
				title: step.title,
			})),
		playbackConfig: tale.playbackConfig,
		taleId: tale.id,
		snapConfig: tale.snapConfig,
		title: tale.title ?? "Untitled Tale",
	};
}

/**
 * Converts a frontend block size into persisted size config.
 *
 * @param size - Frontend block size.
 * @returns Persisted reader size config.
 *
 * @example
 * const config = serializeSizeConfig(block.size);
 */
function serializeSizeConfig(size: SceneSize) {
	const limits = {
		horizontalAlignment: size.horizontalAlignment,
		maxHeight:
			size.maxHeight === undefined
				? undefined
				: { unit: size.maxHeightUnit ?? "px", value: size.maxHeight },
		maxWidth:
			size.maxWidth === undefined
				? undefined
				: { unit: size.maxWidthUnit ?? "px", value: size.maxWidth },
		minHeight:
			size.minHeight === undefined
				? undefined
				: { unit: size.minHeightUnit ?? "px", value: size.minHeight },
		minWidth:
			size.minWidth === undefined
				? undefined
				: { unit: size.minWidthUnit ?? "px", value: size.minWidth },
		verticalAlignment: size.verticalAlignment,
	};
	return size.mode === "manual"
		? {
				...limits,
				height: { unit: size.heightUnit, value: size.height },
				width: { unit: size.widthUnit, value: size.width },
			}
		: limits;
}

/**
 * Converts frontend block reading settings into persisted reading config.
 *
 * @param block - Frontend tale block.
 * @returns Persisted reading config.
 *
 * @example
 * const config = serializeReadingConfig(block);
 */
function serializeReadingConfig(block: TaleScene) {
	return {
		autoplay: block.autoplay,
		animationConfig: {
			ambient: serializeAmbientSelection(block.reading.animations.ambient),
			hover: serializeHoverSelection(
				block.reading.animations.hover ?? { animations: [] },
			),
			sceneActive: serializeSelection(
				block.reading.animations.sceneActive ?? { animations: [] },
			),
			sceneActiveLoop: serializeAmbientSelection(
				block.reading.animations.sceneActiveLoop ?? { animations: [] },
			),
			active: serializeSelection(block.reading.animations.active),
			activeLoop: serializeAmbientSelection(
				block.reading.animations.activeLoop ?? { animations: [] },
			),
		},
		cameraPath: block.reading.cameraPath,
		pauses: block.reading.pauses,
		activeLength: block.reading.activeLength,
		activeLengthMode: block.reading.activeLengthMode,
	};
}

function serializeKeyframeReadingConfig(
	step: ReturnType<typeof getTaleKeyframes>[number],
) {
	return {
		autoplay: step.autoplay,
		animationConfig: {
			ambient: serializeAmbientSelection(step.reading.animations.ambient),
			active: serializeSelection(step.reading.animations.active),
		},
		cameraPath: step.reading.cameraPath,
		pauses: step.reading.pauses,
		activeLength: step.reading.activeLength,
		activeLengthMode: step.reading.activeLengthMode,
		transition: step.transition,
	};
}

/**
 * Converts frontend block transition settings into persisted transition config.
 *
 * @param block - Frontend tale block.
 * @returns Persisted transition config.
 *
 * @example
 * const config = serializeTransitionConfig(block);
 */
function serializeTransitionConfig(block: TaleScene) {
	return {
		animationConfig: {
			intro: serializeSelection(block.transition.animations.intro),
			introLoop: serializeAmbientSelection(
				block.transition.animations.introLoop ?? { animations: [] },
			),
			outro: serializeSelection(block.transition.animations.outro),
			outroLoop: serializeAmbientSelection(
				block.transition.animations.outroLoop ?? { animations: [] },
			),
			previousBridge: serializeSelection(
				block.transition.animations.previousBridge ?? { animations: [] },
			),
			previousBridgeLoop: serializeAmbientSelection(
				block.transition.animations.previousBridgeLoop ?? { animations: [] },
			),
			nextBridge: serializeSelection(
				block.transition.animations.nextBridge ?? { animations: [] },
			),
			nextBridgeLoop: serializeAmbientSelection(
				block.transition.animations.nextBridgeLoop ?? { animations: [] },
			),
			previousVisible: serializeSelection(
				block.transition.animations.previousVisible,
			),
		},
		introLength: block.transition.introLength,
		introEnabled: block.transition.introEnabled,
		flow: block.transition.flow,
		outroLength: block.transition.outroLength,
		outroEnabled: block.transition.outroEnabled,
		previousBridgeEnabled: true,
		previousBridgeLength: null,
		nextBridgeEnabled: true,
		nextBridgeLength: null,
		pauseAfterIntroEnabled: block.transition.pauseAfterIntroEnabled,
		pauseBeforeOutroEnabled: block.transition.pauseBeforeOutroEnabled,
		previousScenesDuringEnter: block.transition.previousScenesDuringEnter,
		snap: block.snap,
	};
}

/**
 * Converts fragment animation selections into persisted animation config.
 *
 * @param fragment - Frontend tale fragment.
 * @returns Persisted fragment animation config.
 *
 * @example
 * const config = serializeElementAnimationConfig(fragment);
 */
function serializeElementAnimationConfig(
	fragment: Pick<TaleElement | TaleFrame, "animations">,
) {
	return {
		ambient: serializeAmbientSelection(fragment.animations.ambient),
		previousFrameBridge: serializeSelection(
			fragment.animations.previousFrameBridge ?? { animations: [] },
		),
		previousFrameBridgeLoop: serializeAmbientSelection(
			fragment.animations.previousFrameBridgeLoop ?? { animations: [] },
		),
		frameIntro: serializeSelection(
			fragment.animations.frameIntro ?? { animations: [] },
		),
		frameOutro: serializeSelection(
			fragment.animations.frameOutro ?? { animations: [] },
		),
		nextFrameBridge: serializeSelection(
			fragment.animations.nextFrameBridge ?? { animations: [] },
		),
		nextFrameBridgeLoop: serializeAmbientSelection(
			fragment.animations.nextFrameBridgeLoop ?? { animations: [] },
		),
		previousBridge: serializeSelection(
			fragment.animations.previousBridge ?? { animations: [] },
		),
		previousBridgeLoop: serializeAmbientSelection(
			fragment.animations.previousBridgeLoop ?? { animations: [] },
		),
		sceneIntro: serializeSelection(
			fragment.animations.sceneIntro ?? { animations: [] },
		),
		sceneOutro: serializeSelection(
			fragment.animations.sceneOutro ?? { animations: [] },
		),
		nextBridge: serializeSelection(
			fragment.animations.nextBridge ?? { animations: [] },
		),
		nextBridgeLoop: serializeAmbientSelection(
			fragment.animations.nextBridgeLoop ?? { animations: [] },
		),
		intro: serializeSelection(fragment.animations.intro),
		introLoop: serializeAmbientSelection(
			fragment.animations.introLoop ?? { animations: [] },
		),
		hover: serializeHoverSelection(
			fragment.animations.hover ?? { animations: [] },
		),
		outro: serializeSelection(fragment.animations.outro),
		outroLoop: serializeAmbientSelection(
			fragment.animations.outroLoop ?? { animations: [] },
		),
		active: serializeSelection(fragment.animations.active),
		activeLoop: serializeAmbientSelection(
			fragment.animations.activeLoop ?? { animations: [] },
		),
	};
}

/**
 * Converts a frontend animation selection into persisted selection shape.
 *
 * @param selection - Frontend animation selection.
 * @returns Persisted selection.
 *
 * @example
 * const selection = serializeSelection(fragment.animations.intro);
 */
function serializeSelection(selection: AnimationSelection) {
	return {
		applyInitialStateBeforeStart:
			selection.applyInitialStateBeforeStart ?? true,
		carryEndStateForward: selection.carryEndStateForward ?? false,
		durationSeconds: selection.durationSeconds,
		tracks: selection.animations,
	};
}

function serializeHoverSelection(selection: HoverAnimationSelection) {
	return {
		durationSeconds: selection.durationSeconds ?? 0.2,
		tracks: selection.animations.map((track) => ({
			...track,
			end: 1,
			playback: undefined,
			start: 0,
			visibleRange: undefined,
		})),
	};
}

/**
 * Converts a frontend ambient animation selection into persisted selection shape.
 *
 * @param selection - Frontend ambient animation selection.
 * @returns Persisted ambient selection.
 *
 * @example
 * const selection = serializeAmbientSelection(fragment.animations.ambient);
 */
function serializeAmbientSelection(selection: AmbientAnimationSelection) {
	return {
		applyInitialStateBeforeStart:
			selection.applyInitialStateBeforeStart ?? true,
		carryEndStateForward: selection.carryEndStateForward ?? false,
		cycleDurationMs: selection.cycleDurationMs,
		endFrameId: selection.endFrameId,
		playback: selection.playback,
		startFrameId: selection.startFrameId,
		tracks: selection.animations,
	};
}

function serializeSceneContainerConfig(
	scene: TaleScene,
): NonNullable<TaleScene["container"]> {
	return {
		...(scene.container ?? { mode: "stack" as const }),
		articleStyle: scene.articleStyle,
	};
}

/**
 * Converts a fragment into its persisted content payload.
 *
 * @param fragment - Frontend tale fragment.
 * @returns Persisted content payload.
 *
 * @example
 * const content = serializeElementContent(fragment);
 */
function serializeElementContent(
	fragment: TaleElement,
): Record<string, unknown> {
	return {
		alt: fragment.alt,
		attribution: fragment.attribution,
		caption: fragment.caption,
		content: fragment.text,
		fallbackSrc: fragment.fallbackSrc,
		fallbackUrl: fragment.fallbackSrc,
		imageStyle: fragment.imageStyle,
		label: fragment.label,
		mood: fragment.mood,
		loop: fragment.mediaPlayback?.loop,
		maxVolume: fragment.mediaPlayback?.maxVolume,
		playbackMode: fragment.mediaPlayback?.mode,
		playbackScope: fragment.mediaPlayback?.scope,
		pathId: fragment.pathId,
		pathIds: fragment.pathIds,
		prompt: fragment.prompt,
		progression: fragment.progression,
		src: fragment.src,
		text: fragment.text,
		url: fragment.src,
		visibleDuringSceneIntro: fragment.visibleDuringSceneIntro ?? false,
		visibleDuringSceneOutro: fragment.visibleDuringSceneOutro ?? false,
		visibleDuringPreviousBridge: fragment.visibleDuringPreviousBridge ?? false,
		visibleDuringNextBridge: fragment.visibleDuringNextBridge ?? false,
		visibleDuringFrameIntro: fragment.visibleDuringFrameIntro ?? false,
		visibleDuringFrameOutro: fragment.visibleDuringFrameOutro ?? false,
		visibleDuringPreviousFrameBridge:
			fragment.visibleDuringPreviousFrameBridge ?? false,
		visibleDuringNextFrameBridge:
			fragment.visibleDuringNextFrameBridge ?? false,
	};
}

function getElementSceneId(
	fragment: TaleElement & { sceneId?: string },
	sceneIdByFrameId: Map<string, string>,
): number {
	const sceneId = Number(fragment.sceneId);
	if (Number.isFinite(sceneId) && sceneId !== 0) return sceneId;
	const frameSceneId =
		fragment.frameId === null
			? undefined
			: sceneIdByFrameId.get(fragment.frameId);
	const fallbackSceneId = Number(frameSceneId);
	return Number.isFinite(fallbackSceneId) ? fallbackSceneId : sceneId;
}

/**
 * Converts a frontend node into its persisted node config.
 *
 * @param node - Frontend tale node.
 * @returns Persisted node config.
 *
 * @example
 * const config = serializeFrameConfig(node);
 */
function serializeFrameConfig(node: TaleFrame): Record<string, unknown> {
	return {
		visibleBeforeIntro: node.visibleBeforeIntro ?? false,
		visibleBeforeFrameIntro: node.visibleBeforeFrameIntro ?? false,
		visibleDuringSceneIntro: node.visibleDuringSceneIntro ?? false,
		visibleDuringSceneOutro: node.visibleDuringSceneOutro ?? false,
		visibleDuringPreviousBridge: node.visibleDuringPreviousBridge ?? false,
		visibleDuringNextBridge: node.visibleDuringNextBridge ?? false,
		kind: node.kind ?? "frame",
		transition: node.transition,
		visibleDuringFrameIntro: node.visibleDuringFrameIntro ?? false,
		visibleDuringFrameOutro: node.visibleDuringFrameOutro ?? false,
		visibleDuringPreviousFrameBridge:
			node.visibleDuringPreviousFrameBridge ?? false,
		visibleDuringNextFrameBridge: node.visibleDuringNextFrameBridge ?? false,
		defaultElementStates: node.defaultElementStates ?? {},
		progression: node.progression,
		align: "align" in node ? node.align : undefined,
		children: node.children,
		columns: "columns" in node ? node.columns : undefined,
		direction: "direction" in node ? node.direction : undefined,
		gap: "gap" in node ? node.gap : undefined,
		justify: "justify" in node ? node.justify : undefined,
		mode: node.mode,
		overflow: node.overflow,
		rows: "rows" in node ? node.rows : undefined,
		wrap: "wrap" in node ? node.wrap : undefined,
	};
}
