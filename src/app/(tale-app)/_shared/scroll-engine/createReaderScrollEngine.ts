"use client";

import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../../(reader)/_shared/stores/createTaleReaderStore";
import {
	compileReaderAnimationPlan,
	createAnimationValues,
	evaluateBlockAnimation,
	evaluateFragmentAnimation,
	evaluateNodeAnimation,
	evaluatePreviousVisibleBlockAnimation,
	getCompletedAnimationIds,
	hasAmbientAnimations,
	writeAnimationValues,
} from "../services/readerAnimations";
import {
	getReadingLength,
	getSegmentAnchor,
	getSegmentCamera,
	getSegmentProgress,
	resolveSegmentIndex,
} from "../services/readerCompiler";
import {
	countReaderDiagnostic,
	logReaderDiagnostic,
} from "../services/readerDiagnostics";
import { getAnchorByBlockId } from "../services/readerLookups";
import { normalizeTalePlaybackConfig } from "../services/readerPlaybackSettings";
import {
	resolveAutoplayBoundaryPauseSeconds,
	resolveAutoplaySegmentSpeed,
} from "../services/readerPlaybackSettings";
import type {
	Anchor,
	CompiledReader,
	SavedReaderProgress,
	Tale,
	TimelineSegment,
	ViewportSize,
} from "../types";
import { attachReaderInputBindings } from "./inputBindings";
import { createReaderNavigationMotion } from "./navigationMotion";
import { createProgressPainter } from "./progressPainter";
import { getSavedInnerProgress } from "./progressPersistence";
import { createReaderAnimationFramePolicy } from "./readerAnimationFramePolicy";
import { createReaderAnimationMonitor } from "./readerAnimationMonitor";
import { createReaderDebugPublisher } from "./readerDebugPublisher";
import { createReaderDomRegistry } from "./readerDomRegistry";
import { createReaderFixedFragmentPainter } from "./readerFixedFragments";
import { compileReaderFramePlans } from "./readerFramePlan";
import { createReaderStatePublisher } from "./readerStatePublisher";
import { filterTimelineVisibleAnchors } from "./readerTimelineVisibility";
import { createReaderViewportVisibilityResolver } from "./readerViewportVisibility";
import {
	createReaderVisibilityPainter,
	getReaderStyleAnchors,
	getUniqueAnchors,
} from "./readerVisibility";
import type { ReaderScrollDriver } from "./scrollDriver";
import { createReaderSnapModel } from "./scrollSnapModel";
import { createSettledProgressSaver } from "./settledProgressSaver";

type ReaderScrollEngineOptions = {
	compiled: CompiledReader;
	driver: ReaderScrollDriver;
	onReady: () => void;
	progress: SavedReaderProgress;
	scrollRoot?: HTMLElement | null;
	stage: HTMLDivElement;
	store: StoreApi<TaleReaderState>;
	tale: Tale;
	viewport: ViewportSize;
};

type PreviousBlockTakeoverFrame = {
	anchors: Anchor[];
	blockIds: Set<string>;
	owner: Anchor;
	progress: number;
};

/**
 * Restores one reusable animation values object to identity values.
 *
 * @param target - Mutable animation values object.
 * @returns Nothing.
 */
function resetReusableAnimationValues(
	target: ReturnType<typeof createAnimationValues>,
): void {
	target.blur = 0;
	target.opacity = 1;
	target.rotate = 0;
	target.scale = 1;
	target.translateX = 0;
	target.translateY = 0;
	target.translateZ = 0;
}

/**
 * Composes a takeover animation on top of a block's own animation result.
 *
 * @param target - Existing block animation values.
 * @param takeover - Previous-visible takeover animation values.
 * @returns Nothing.
 *
 * @example
 * composeTakeoverAnimationValues(blockValues, takeoverValues);
 */
function composeTakeoverAnimationValues(
	target: ReturnType<typeof createAnimationValues>,
	takeover: ReturnType<typeof createAnimationValues>,
): void {
	target.blur += takeover.blur;
	target.opacity *= takeover.opacity;
	target.rotate += takeover.rotate;
	target.scale *= takeover.scale;
	target.translateX += takeover.translateX;
	target.translateY += takeover.translateY;
	target.translateZ += takeover.translateZ;
}

/**
 * Resolves the compiled previous anchors that should be painted during a
 * destination block's custom previous-block entrance takeover.
 *
 * @param compiled - Compiled route metadata.
 * @param owner - Block whose transition owns the takeover.
 * @returns Previous anchors declared by the owner block's compiled takeover.
 *
 * @example
 * const anchors = getPreviousTakeoverAnchorsByOwner(compiled, owner);
 */
function getPreviousTakeoverAnchorsByOwner(
	compiled: CompiledReader,
	tale: Tale,
	owner: Anchor,
): Anchor[] {
	const ownerBlock = tale.indexMap.blocksById[owner.blockId];
	if (!ownerBlock) return [];
	if (
		ownerBlock.transition.previousBlocksDuringEnter === "fadeActivePrevious"
	) {
		const ownerIndex = compiled.anchorIndexByBlockId[owner.blockId];
		const previousAnchor =
			ownerIndex === undefined ? undefined : compiled.anchors[ownerIndex - 1];
		return previousAnchor ? [previousAnchor] : [];
	}
	return (
		compiled.previousVisibleBlockIdsByEnteringBlockId[owner.blockId] ?? []
	)
		.map((blockId) => getAnchorByBlockId(compiled, blockId))
		.filter((anchor): anchor is Anchor => Boolean(anchor));
}

/**
 * Resolves the active previous-block takeover for the current segment.
 *
 * During an entering transition, progress follows the entering phase. After the
 * destination block has entered, the compiled held takeover remains at progress
 * 1 until the reader scrolls back before that transition.
 *
 * @param compiled - Compiled route metadata.
 * @param segment - Current timeline segment.
 * @param segmentProgress - Current segment progress.
 * @returns Takeover frame, or null when no previous blocks should be controlled.
 *
 * @example
 * const takeover = getPreviousBlockTakeoverFrame(compiled, segment, progress);
 */
function getPreviousBlockTakeoverFrame(
	compiled: CompiledReader,
	tale: Tale,
	segment: TimelineSegment,
	segmentProgress: number,
): PreviousBlockTakeoverFrame | null {
	const destinationBlock =
		segment.type === "transition"
			? tale.indexMap.blocksById[segment.toBlockId]
			: undefined;
	if (
		segment.type === "transition" &&
		destinationBlock &&
		destinationBlock?.transition.previousBlocksDuringEnter !== "keep"
	) {
		const owner = getAnchorByBlockId(compiled, segment.toBlockId);
		if (!owner) return null;
		const anchors = getPreviousTakeoverAnchorsByOwner(compiled, tale, owner);
		return createPreviousBlockTakeoverFrame(
			anchors,
			owner,
			getTransitionEnteringProgress(segment, segmentProgress, destinationBlock),
		);
	}

	const activeAnchorIndex =
		segment.type === "transition"
			? segment.fromBlockId === null
				? -1
				: compiled.anchorIndexByBlockId[segment.fromBlockId]
			: compiled.anchorIndexByBlockId[segment.blockId];
	const heldBlockId =
		activeAnchorIndex === undefined
			? null
			: (compiled.heldPreviousTakeoverBlockIdByAnchorIndex[activeAnchorIndex] ??
				null);
	const owner = heldBlockId
		? (getAnchorByBlockId(compiled, heldBlockId) ?? null)
		: null;
	if (!owner) {
		return getPendingPreviousBlockTakeoverFrame(
			compiled,
			tale,
			activeAnchorIndex,
		);
	}
	return (
		createPreviousBlockTakeoverFrame(
			getPreviousTakeoverAnchorsByOwner(compiled, tale, owner),
			owner,
			1,
		) ?? getPendingPreviousBlockTakeoverFrame(compiled, tale, activeAnchorIndex)
	);
}

/**
 * Resolves the next future takeover as an explicit reverted state before the
 * owning block enters.
 *
 * @param compiled - Compiled route metadata.
 * @param activeAnchorIndex - Route index currently driving the frame.
 * @returns A progress-zero takeover frame, or null when no blocks need it.
 *
 * @example
 * const pending = getPendingPreviousBlockTakeoverFrame(compiled, 2);
 */
function getPendingPreviousBlockTakeoverFrame(
	compiled: CompiledReader,
	tale: Tale,
	activeAnchorIndex: number | undefined,
): PreviousBlockTakeoverFrame | null {
	if (activeAnchorIndex === undefined) return null;
	const owner = compiled.anchors.find((anchor, index) => {
		if (index <= activeAnchorIndex) return false;
		return (
			tale.indexMap.blocksById[anchor.blockId]?.transition
				.previousBlocksDuringEnter !== "keep" &&
			(compiled.previousVisibleBlockIdsByEnteringBlockId[anchor.blockId]
				?.length ?? 0) > 0
		);
	});
	if (!owner) return null;
	const anchors = getPreviousTakeoverAnchorsByOwner(compiled, tale, owner);
	return createPreviousBlockTakeoverFrame(anchors, owner, 0);
}

/**
 * Creates a takeover frame from an owner block and its controlled anchors.
 *
 * @param anchors - Previous anchors controlled by the owner block.
 * @param owner - Block whose transition owns the takeover.
 * @param progress - Takeover progress to apply.
 * @returns A takeover frame, or null when there are no controlled anchors.
 *
 * @example
 * const frame = createPreviousBlockTakeoverFrame(anchors, owner, 1);
 */
function createPreviousBlockTakeoverFrame(
	anchors: Anchor[],
	owner: Anchor,
	progress: number,
): PreviousBlockTakeoverFrame | null {
	if (anchors.length === 0) return null;
	return {
		anchors,
		blockIds: new Set(anchors.map((anchor) => anchor.blockId)),
		owner,
		progress,
	};
}

/**
 * Resolves the destination entering phase progress inside a transition segment.
 *
 * @param segment - Current transition segment.
 * @param segmentProgress - Current transition progress.
 * @returns Normalized entering progress.
 *
 * @example
 * const progress = getTransitionEnteringProgress(segment, 0.6);
 */
function getTransitionEnteringProgress(
	segment: Extract<TimelineSegment, { type: "transition" }>,
	segmentProgress: number,
	destinationBlock: Tale["indexMap"]["blocksById"][string],
): number {
	const phaseLength = Math.max(
		destinationBlock.transition.enteringLength ?? segment.length,
		1,
	);
	const traveled = segmentProgress * segment.length;
	return Math.min(
		Math.max((traveled - (segment.length - phaseLength)) / phaseLength, 0),
		1,
	);
}

/**
 * Applies the incoming block's previous-block takeover rule to controlled
 * blocks during and after the owner block's entering transition.
 *
 * This is intentionally separate from the current block's own transition
 * animations. The destination block owns how previously visible blocks should
 * behave while it enters, while each previous block still owns its own leaving
 * tracks if any are configured.
 *
 * @param animationPlan - Compiled animation plan with destination takeover tracks.
 * @param blockId - Block currently being painted.
 * @param committedAnimationIds - Completed one-way animation track ids.
 * @param takeover - Active takeover frame.
 * @param target - Mutable animation values for the painted block.
 * @returns Whether a previous-block takeover animation was applied.
 *
 * @example
 * applyPreviousBlockTakeover(animationPlan, anchor.blockId, committedIds, takeover, values);
 */
function applyPreviousBlockTakeover(
	animationPlan: ReturnType<typeof compileReaderAnimationPlan>,
	tale: Tale,
	blockId: string,
	committedAnimationIds: ReadonlySet<string>,
	takeover: PreviousBlockTakeoverFrame | null,
	target: ReturnType<typeof createAnimationValues>,
	takeoverTarget: ReturnType<typeof createAnimationValues>,
): boolean {
	if (!takeover) return false;
	if (blockId === takeover.owner.blockId) return false;

	const mode =
		tale.indexMap.blocksById[takeover.owner.blockId]?.transition
			.previousBlocksDuringEnter;
	if (!mode) return false;
	if (mode === "keep") return false;
	if (!takeover.blockIds.has(blockId)) return false;

	if (mode === "fadeActivePrevious" && !takeover.blockIds.has(blockId)) {
		return false;
	}

	if (mode === "customAllVisiblePrevious") {
		const tracks =
			animationPlan.blockAnimationsById.get(takeover.owner.blockId)
				?.previousVisibleDuringEnter ?? [];
		if (tracks.length === 0) {
			target.opacity *= 1 - takeover.progress;
			return true;
		}
		resetReusableAnimationValues(takeoverTarget);
		const applied = evaluatePreviousVisibleBlockAnimation(
			animationPlan,
			takeover.owner.blockId,
			takeover.progress,
			committedAnimationIds,
			takeoverTarget,
		);
		if (applied) composeTakeoverAnimationValues(target, takeoverTarget);
		return applied;
	}

	target.opacity *= 1 - takeover.progress;
	return true;
}

export function createReaderScrollEngine({
	compiled,
	driver,
	onReady,
	progress,
	scrollRoot = null,
	stage,
	store,
	tale,
	viewport,
}: ReaderScrollEngineOptions) {
	const playbackConfig = normalizeTalePlaybackConfig(tale.playbackConfig);
	store.getState().playback.configure(playbackConfig.autoplay.enabled);
	logReaderDiagnostic("scroll engine created", {
		anchors: compiled.anchors.length,
		segments: compiled.segments.length,
		totalScroll: compiled.totalScroll,
	});
	let animationFrame: number | null = null;
	let currentIndex = 0;
	let previousScroll = 0;
	let renderedBlockIdsKey = "";
	let previousCameraTransform = "";
	let lightweightTravelActive = false;
	let cancelPendingSnap = (): void => undefined;
	const committedAnimationIds = new Set(progress.committedAnimationIds);
	const snapModel = createReaderSnapModel(
		compiled.snapPoints,
		compiled.segments,
	);
	const progressRoot =
		stage.closest<HTMLElement>("[data-reader-runtime-root='true']") ??
		stage.parentElement;
	const paintProgress = createProgressPainter(progressRoot, compiled);
	const domRegistry = createReaderDomRegistry(progressRoot ?? stage);
	const paintFixedFragments = createReaderFixedFragmentPainter(
		domRegistry,
		viewport,
	);
	const paintVisibility = createReaderVisibilityPainter(
		domRegistry,
		compiled.anchorIndexByBlockId,
	);
	const animationPlan = compileReaderAnimationPlan(compiled, tale, viewport);
	const animationFramePolicy = createReaderAnimationFramePolicy(viewport);
	const animationMonitor = createReaderAnimationMonitor(
		domRegistry,
		animationPlan,
	);
	const framePlans = compileReaderFramePlans(compiled);
	const viewportVisibility = createReaderViewportVisibilityResolver(
		compiled,
		viewport,
	);
	const debugPublisher = createReaderDebugPublisher(store, 100);
	const statePublisher = createReaderStatePublisher(compiled, store, 80, 180);
	const blockAnimationValues = createAnimationValues();
	const takeoverAnimationValues = createAnimationValues();
	const fragmentAnimationValues = createAnimationValues();
	const nodeAnimationValues = createAnimationValues();
	const takeoverStyledBlockIds = new Set<string>();
	const restingStateByBlockId = new Map<
		string,
		{ progress: 0 | 1; revision: number }
	>();
	const settledProgressSaver = createSettledProgressSaver(
		({ blockId, innerProgress }) => {
			store.getState().progress.savePosition(blockId, innerProgress);
		},
		280,
	);
	/**
	 * Writes the deterministic takeover state to every mounted controlled block.
	 *
	 * @param takeover - Current takeover frame, or null when no takeover applies.
	 * @returns Nothing.
	 *
	 * @example
	 * synchronizePreviousBlockTakeoverStyles(previousTakeover);
	 */
	const synchronizePreviousBlockTakeoverStyles = (
		takeover: PreviousBlockTakeoverFrame | null,
	): void => {
		const activeBlockIds = takeover?.blockIds ?? new Set<string>();
		for (const blockId of [...takeoverStyledBlockIds]) {
			if (activeBlockIds.has(blockId)) continue;
			const element = domRegistry.blockElementById.get(blockId);
			if (!element) continue;
			resetReusableAnimationValues(blockAnimationValues);
			writeAnimationValues(element, blockAnimationValues);
			takeoverStyledBlockIds.delete(blockId);
		}
		if (!takeover) return;
		for (const blockId of takeover.blockIds) {
			const element = domRegistry.blockElementById.get(blockId);
			if (!element) continue;
			resetReusableAnimationValues(blockAnimationValues);
			if (
				applyPreviousBlockTakeover(
					animationPlan,
					tale,
					blockId,
					committedAnimationIds,
					takeover,
					blockAnimationValues,
					takeoverAnimationValues,
				)
			) {
				takeoverStyledBlockIds.add(blockId);
				writeAnimationValues(element, blockAnimationValues);
			}
		}
	};
	const ensureNearbyBlocksRendered = (anchors: Anchor[]) => {
		const blockIds = anchors
			.map((anchor) => anchor.blockId)
			.sort(
				(first, second) =>
					(compiled.anchorIndexByBlockId[first] ?? 0) -
					(compiled.anchorIndexByBlockId[second] ?? 0),
			);
		const key = blockIds.join("|");
		if (key === renderedBlockIdsKey) return;
		renderedBlockIdsKey = key;
		logReaderDiagnostic("render window changed", {
			active: anchors.map((anchor) => anchor.blockId),
			mounted: blockIds,
		});
		store.getState().scroll.setRenderedBlockIds(blockIds);
		window.requestAnimationFrame(requestPaint);
	};
	const navigationMotion = createReaderNavigationMotion(
		compiled,
		tale,
		driver,
		viewport,
		{
			onNavigationStart: () => cancelPendingSnap(),
			onTravelEnd: () => {
				if (!lightweightTravelActive) return;
				lightweightTravelActive = false;
				restingStateByBlockId.clear();
				requestPaint();
			},
			onTravelStart: () => {
				lightweightTravelActive = true;
			},
		},
	);

	/**
	 * Applies the current camera transform directly to the reader stage.
	 *
	 * @param x - The horizontal stage translation in pixels.
	 * @param y - The vertical stage translation in pixels.
	 * @returns Nothing.
	 *
	 * @example
	 * applyCameraTransform(120, -40);
	 */
	const applyCameraTransform = (x: number, y: number): void => {
		const transform = `translate3d(${x}px, ${y}px, 0)`;
		if (transform === previousCameraTransform) return;
		stage.style.transform = transform;
		previousCameraTransform = transform;
	};

	/**
	 * Gets the compiled reading segment start for a block.
	 *
	 * @param anchor - The timeline anchor whose reading segment should be found.
	 * @returns The scroll position where the block's inner reading progress begins.
	 *
	 * @example
	 * const start = getReadingStart(anchor);
	 */
	const getReadingStart = (anchor: Anchor): number => {
		const segmentIndex = compiled.segmentIndexByBlockId[anchor.blockId];
		const segment = compiled.segments[segmentIndex ?? -1];
		return segment?.type === "reading" ? segment.start : anchor.scroll;
	};

	/**
	 * Marks one-way animation tracks as committed and persists new ids.
	 *
	 * @param animationIds - Animation track ids that reached their commit threshold.
	 * @returns Nothing.
	 *
	 * @example
	 * commitAnimations(["fragment:1:scrolling:opacity-0"]);
	 */
	const commitAnimations = (animationIds: string[]): void => {
		const nextIds = animationIds.filter((id) => !committedAnimationIds.has(id));
		if (nextIds.length === 0) return;
		for (const id of nextIds) {
			committedAnimationIds.add(id);
		}
		store.getState().progress.commitAnimations(nextIds);
	};

	/**
	 * Restores committed tracks that can be derived from saved block progress.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * restoreDerivedCommittedAnimations();
	 */
	const restoreDerivedCommittedAnimations = (): void => {
		if (!progress.blockId) return;
		const anchor = getAnchorByBlockId(compiled, progress.blockId);
		if (!anchor) return;
		const segmentIndex = compiled.segmentIndexByBlockId[anchor.blockId];
		const segment = compiled.segments[segmentIndex ?? -1];
		if (!segment) return;
		commitAnimations(
			getCompletedAnimationIds(
				animationPlan,
				anchor.blockId,
				segment,
				progress.innerProgress,
			),
		);
	};

	const paintAnchorFrame = (
		anchor: Anchor,
		segment: TimelineSegment,
		segmentProgress: number,
		frameTimeMs: number,
		animationDetail: "blocks-only" | "full",
		takeover: PreviousBlockTakeoverFrame | null,
	): boolean => {
		restingStateByBlockId.delete(anchor.blockId);
		const element = domRegistry.blockElementById.get(anchor.blockId);
		if (!element) return false;
		const blockAnimationApplied = evaluateBlockAnimation(
			animationPlan,
			tale,
			anchor.blockId,
			segment,
			segmentProgress,
			committedAnimationIds,
			frameTimeMs,
			blockAnimationValues,
		);
		if (!blockAnimationApplied) {
			resetReusableAnimationValues(blockAnimationValues);
		}
		const previousTakeoverApplied = applyPreviousBlockTakeover(
			animationPlan,
			tale,
			anchor.blockId,
			committedAnimationIds,
			takeover,
			blockAnimationValues,
			takeoverAnimationValues,
		);
		if (previousTakeoverApplied) {
			takeoverStyledBlockIds.add(anchor.blockId);
			writeAnimationValues(element, blockAnimationValues);
		} else if (blockAnimationApplied) {
			takeoverStyledBlockIds.delete(anchor.blockId);
			writeAnimationValues(element, blockAnimationValues);
		} else if (takeoverStyledBlockIds.delete(anchor.blockId)) {
			resetReusableAnimationValues(blockAnimationValues);
			writeAnimationValues(element, blockAnimationValues);
		}

		if (animationDetail === "blocks-only") return true;
		if (animationDetail === "full") {
			commitAnimations(
				getCompletedAnimationIds(
					animationPlan,
					anchor.blockId,
					segment,
					segmentProgress,
				),
			);
		}

		for (const fragmentId of animationPlan.animatedFragmentIdsByBlockId.get(
			anchor.blockId,
		) ?? []) {
			const fragmentElement = domRegistry.fragmentElementById.get(fragmentId);
			if (!fragmentElement) continue;
			if (
				evaluateFragmentAnimation(
					animationPlan,
					fragmentId,
					segment,
					anchor.blockId,
					segmentProgress,
					committedAnimationIds,
					frameTimeMs,
					fragmentAnimationValues,
				)
			) {
				writeAnimationValues(fragmentElement, fragmentAnimationValues);
			}
		}
		for (const nodeId of animationPlan.animatedNodeIdsByBlockId.get(
			anchor.blockId,
		) ?? []) {
			const nodeElement = domRegistry.nodeElementById.get(nodeId);
			if (
				nodeElement &&
				evaluateNodeAnimation(
					animationPlan,
					nodeId,
					segment,
					anchor.blockId,
					segmentProgress,
					committedAnimationIds,
					frameTimeMs,
					nodeAnimationValues,
				)
			) {
				writeAnimationValues(nodeElement, nodeAnimationValues);
			}
		}
		return true;
	};

	const paintRestingAnchor = (
		anchor: Anchor,
		progress: 0 | 1,
		frameTimeMs: number,
		animationDetail: "blocks-only" | "full",
		takeover: PreviousBlockTakeoverFrame | null,
		forcePaint = false,
	) => {
		const segmentIndex =
			progress === 1
				? compiled.transitionOutOfByBlockId[anchor.blockId]
				: compiled.transitionIntoByBlockId[anchor.blockId];
		if (segmentIndex === undefined) return;
		const segment = compiled.segments[segmentIndex];
		if (!segment || segment.type !== "transition") return;
		const revision = domRegistry.getRevision();
		const previous = restingStateByBlockId.get(anchor.blockId);
		if (
			!forcePaint &&
			!animationPlan.ambientBlockIds.has(anchor.blockId) &&
			previous?.progress === progress &&
			previous.revision === revision
		)
			return;
		const painted = paintAnchorFrame(
			anchor,
			segment,
			progress,
			frameTimeMs,
			animationDetail,
			takeover,
		);
		if (painted) {
			restingStateByBlockId.set(anchor.blockId, { progress, revision });
		} else {
			restingStateByBlockId.delete(anchor.blockId);
		}
	};

	const saveSettledPosition = (
		activeAnchor: Anchor,
		segment: TimelineSegment,
		segmentProgress: number,
	) => {
		if (store.getState().playback.status === "playing") return;
		settledProgressSaver.schedule(
			activeAnchor.blockId,
			getSavedInnerProgress(activeAnchor, segment, segmentProgress),
		);
	};

	const publishLocation = (anchor: Anchor, segmentIndex: number) => {
		statePublisher.publish(anchor, segmentIndex);
		if (store.getState().playback.status === "playing") {
			statePublisher.flush();
		}
	};

	const renderReaderAtScroll = (scroll: number, frameTimeMs: number) => {
		countReaderDiagnostic("renderReaderAtScroll()", {
			currentBlockId: store.getState().navigation.current?.blockId ?? null,
			scroll: Math.round(scroll),
		});
		const index = resolveSegmentIndex(
			compiled,
			scroll,
			previousScroll,
			currentIndex,
		);
		const segment = compiled.segments[index];
		if (!segment) return;
		currentIndex = index;
		const segmentProgress = getSegmentProgress(segment, scroll);
		const camera = getSegmentCamera(
			compiled,
			segment,
			segmentProgress,
			viewport,
		);
		applyCameraTransform(
			viewport.width / 2 - camera.x,
			viewport.height / 2 - camera.y,
		);
		paintProgress(scroll, segment, segmentProgress);

		const framePlan = framePlans[index];
		if (!framePlan) return;
		const spatiallyVisibleAnchors = viewportVisibility.getVisibleAnchors(
			camera,
			framePlan.visibleAnchors,
		);
		const visibleAnchors = filterTimelineVisibleAnchors(
			spatiallyVisibleAnchors,
			framePlan.activeAnchorIndex,
			compiled.anchorIndexByBlockId,
			framePlan.foregroundBlockIds,
			tale,
		);
		const nearbyAnchors = viewportVisibility.getNearbyAnchors(
			camera,
			framePlan.visibleAnchors,
			lightweightTravelActive ? 1.25 : 0.5,
		);
		const previousTakeover = getPreviousBlockTakeoverFrame(
			compiled,
			tale,
			segment,
			segmentProgress,
		);
		synchronizePreviousBlockTakeoverStyles(previousTakeover);
		const previousTakeoverAnchors = previousTakeover?.anchors ?? [];
		const paintedAnchors = getUniqueAnchors([
			...visibleAnchors,
			...previousTakeoverAnchors,
		]);
		const styledAnchors = getReaderStyleAnchors(paintedAnchors, nearbyAnchors);
		ensureNearbyBlocksRendered(
			getUniqueAnchors([...nearbyAnchors, ...previousTakeoverAnchors]),
		);
		paintVisibility(
			paintedAnchors,
			framePlan.foregroundBlockIds,
			framePlan.activeAnchorIndex,
		);
		const reducedAnimations =
			lightweightTravelActive ||
			animationFramePolicy.isReduced(scroll, frameTimeMs);
		const animationDetail = reducedAnimations ? "blocks-only" : "full";
		animationMonitor.update(
			paintedAnchors,
			reducedAnimations,
			reducedAnimations ? "fast-scroll" : "full",
		);
		const activeAnchor = getSegmentAnchor(compiled, segment, segmentProgress);
		if (!activeAnchor) return;
		for (const anchor of paintedAnchors) {
			paintFixedFragments(anchor, activeAnchor, segment, segmentProgress);
		}
		for (const anchor of styledAnchors) {
			if (framePlan.paintedBlockIds.has(anchor.blockId)) {
				paintAnchorFrame(
					anchor,
					segment,
					segmentProgress,
					frameTimeMs,
					animationDetail,
					previousTakeover,
				);
				continue;
			}
			const anchorIndex = compiled.anchorIndexByBlockId[anchor.blockId];
			paintRestingAnchor(
				anchor,
				framePlan.activeAnchorIndex !== undefined &&
					anchorIndex !== undefined &&
					anchorIndex < framePlan.activeAnchorIndex
					? 1
					: 0,
				frameTimeMs,
				animationDetail,
				previousTakeover,
				previousTakeover?.blockIds.has(anchor.blockId) ?? false,
			);
		}
		if (lightweightTravelActive) {
			publishLocation(activeAnchor, index);
			debugPublisher.publish(index);
			previousScroll = scroll;
			return;
		}

		debugPublisher.publish(index);
		publishLocation(activeAnchor, index);
		saveSettledPosition(activeAnchor, segment, segmentProgress);
		previousScroll = scroll;
		if (reducedAnimations) requestPaint();
		else scheduleAmbientFrame(visibleAnchors);
	};

	const scheduleAmbientFrame = (visibleAnchors: readonly Anchor[]): void => {
		if (
			hasAmbientAnimations(
				animationPlan,
				visibleAnchors.map((anchor) => anchor.blockId),
			)
		) {
			requestPaint();
		}
	};

	const requestPaint = () => {
		countReaderDiagnostic("requestPaint()");
		if (animationFrame !== null) return;
		animationFrame = window.requestAnimationFrame((frameTimeMs) => {
			animationFrame = null;
			renderReaderAtScroll(driver.getScroll(), frameTimeMs);
		});
	};

	/**
	 * Renders a scroll-driver frame immediately from GSAP's virtual scroll tick.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * driver.setUpdateListener(renderDriverFrame);
	 */
	const renderDriverFrame = () => {
		if (animationFrame !== null) {
			window.cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
		renderReaderAtScroll(driver.getScroll(), performance.now());
	};

	const getRestoreTarget = () => {
		const pendingRestoreBlockId = store.getState().scroll.pendingRestoreBlockId;
		if (!pendingRestoreBlockId && !progress.blockId) return 0;
		const anchor = pendingRestoreBlockId
			? getAnchorByBlockId(compiled, pendingRestoreBlockId)
			: progress.blockId
				? getAnchorByBlockId(compiled, progress.blockId)
				: compiled.anchors[0];
		if (pendingRestoreBlockId && anchor) {
			store.getState().scroll.setPendingRestoreBlockId(null);
		}
		if (!anchor) return 0;
		const block = tale.indexMap.blocksById[anchor.blockId];
		if (!block) return 0;
		return pendingRestoreBlockId
			? getReadingStart(anchor)
			: getReadingStart(anchor) +
					getReadingLength(anchor, block, viewport) * progress.innerProgress;
	};

	const capturePosition = () => {
		if (store.getState().playback.status === "playing") {
			statePublisher.flush();
			return;
		}
		const scroll = driver.getScroll();
		const segment =
			compiled.segments[
				resolveSegmentIndex(compiled, scroll, previousScroll, currentIndex)
			];
		if (!segment) return;
		const segmentProgress = getSegmentProgress(segment, scroll);
		const activeAnchor = getSegmentAnchor(compiled, segment, segmentProgress);
		if (!activeAnchor) return;
		statePublisher.flush();
		store
			.getState()
			.progress.savePosition(
				activeAnchor.blockId,
				getSavedInnerProgress(activeAnchor, segment, segmentProgress),
			);
	};
	const scrollApi = {
		capturePosition,
		repaint: requestPaint,
		scrollToBlock: (
			...args: Parameters<typeof navigationMotion.scrollToBlock>
		) => {
			store.getState().playback.pause();
			return navigationMotion.scrollToBlock(...args);
		},
	};
	let autoplayFrame: number | null = null;
	let previousAutoplayTime: number | null = null;
	let autoplayBlockedUntil = 0;
	const consumedAutoplayBoundaries = new Set<string>();
	const stopAutoplayFrame = (): void => {
		window.cancelAnimationFrame(autoplayFrame ?? 0);
		autoplayFrame = null;
		previousAutoplayTime = null;
	};
	const runAutoplayFrame = (time: number): void => {
		autoplayFrame = null;
		if (store.getState().playback.status !== "playing") {
			previousAutoplayTime = null;
			return;
		}
		const elapsedSeconds =
			previousAutoplayTime === null
				? 0
				: Math.min(time - previousAutoplayTime, 100) / 1000;
		previousAutoplayTime = time;
		if (time < autoplayBlockedUntil) {
			autoplayFrame = window.requestAnimationFrame(runAutoplayFrame);
			return;
		}
		const scroll = driver.getScroll();
		const segmentIndex = resolveSegmentIndex(
			compiled,
			scroll,
			previousScroll,
			currentIndex,
		);
		const segment = compiled.segments[segmentIndex];
		if (!segment) return;
		const speed = resolveAutoplaySegmentSpeed(
			tale,
			segment,
			playbackConfig.autoplay.speed,
		);
		let intendedNext = scroll + speed * elapsedSeconds;
		const nextSegment = compiled.segments[segmentIndex + 1];
		const boundaryKey = `${segment.index}:${segment.end}`;
		if (
			nextSegment &&
			intendedNext >= segment.end &&
			!consumedAutoplayBoundaries.has(boundaryKey)
		) {
			const pauseSeconds = resolveAutoplayBoundaryPauseSeconds(
				tale,
				segment,
				nextSegment,
			);
			consumedAutoplayBoundaries.add(boundaryKey);
			if (pauseSeconds > 0) {
				autoplayBlockedUntil = time + pauseSeconds * 1000;
				intendedNext = segment.end;
			}
		}
		const next = Math.min(compiled.totalScroll, intendedNext);
		driver.setScroll(next);
		if (next >= compiled.totalScroll) {
			store.getState().playback.pause();
			return;
		}
		autoplayFrame = window.requestAnimationFrame(runAutoplayFrame);
	};
	const startAutoplayFrame = (): void => {
		if (
			autoplayFrame !== null ||
			store.getState().playback.status !== "playing"
		)
			return;
		autoplayFrame = window.requestAnimationFrame(runAutoplayFrame);
	};

	const start = () => {
		const target = getRestoreTarget();
		restoreDerivedCommittedAnimations();
		driver.setScroll(target);
		previousScroll = target;
		currentIndex = compiled.segmentIndexByBlockId[progress.blockId ?? ""] ?? 0;
		renderReaderAtScroll(target, performance.now());
		driver.setUpdateListener(renderDriverFrame);
		const inputTarget = scrollRoot ?? window;
		logReaderDiagnostic("virtual scroll input target attached");
		const inputBindings = attachReaderInputBindings(
			compiled.totalScroll,
			driver,
			snapModel,
			navigationMotion.scrollToTimelineEdge,
			() => store.getState().inputSettings.values,
			() => compiled.snapConfig,
			() => playbackConfig.interactions,
			(kind) => {
				if (playbackConfig.autoplay.stopOn[kind]) {
					store.getState().playback.pause();
				}
			},
			inputTarget,
		);
		cancelPendingSnap = inputBindings.cancelPendingSnap;
		store.getState().scroll.setApi(scrollApi);
		onReady();
		startAutoplayFrame();
		return inputBindings.cleanup;
	};

	const cleanupInput = start();
	const unsubscribePlayback = store.subscribe((state, previousState) => {
		if (state.playback.status === previousState.playback.status) return;
		if (state.playback.status === "playing") startAutoplayFrame();
		else stopAutoplayFrame();
	});

	return () => {
		logReaderDiagnostic("scroll engine destroyed");
		cleanupInput();
		unsubscribePlayback();
		stopAutoplayFrame();
		driver.setUpdateListener(null);
		window.cancelAnimationFrame(animationFrame ?? 0);
		statePublisher.flush();
		statePublisher.cancel();
		debugPublisher.cancel();
		settledProgressSaver.cancel();
		domRegistry.disconnect();
		driver.cleanup();
		navigationMotion.cleanup();
		if (store.getState().scroll.isApiCurrent(scrollApi)) {
			store.getState().scroll.setApi(null);
		}
	};
}
