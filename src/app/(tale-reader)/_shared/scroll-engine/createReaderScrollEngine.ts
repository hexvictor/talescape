"use client";

import type { StoreApi } from "zustand";
import {
	compileReaderAnimationPlan,
	createAnimationValues,
	evaluateBlockAnimation,
	evaluateFragmentAnimation,
	evaluateNodeAnimation,
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
import type { TaleReaderState } from "../store/createReaderStore";
import type {
	Anchor,
	CompiledReader,
	SavedReaderProgress,
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
import { createReaderViewportVisibilityResolver } from "./readerViewportVisibility";
import { createReaderVisibilityPainter } from "./readerVisibility";
import type { ReaderScrollDriver } from "./scrollDriver";
import { createReaderSnapModel } from "./scrollSnapModel";
import { createSettledProgressSaver } from "./settledProgressSaver";

type ReaderScrollEngineOptions = {
	compiled: CompiledReader;
	driver: ReaderScrollDriver;
	onReady: () => void;
	progress: SavedReaderProgress;
	stage: HTMLDivElement;
	store: StoreApi<TaleReaderState>;
	viewport: ViewportSize;
};

export function createReaderScrollEngine({
	compiled,
	driver,
	onReady,
	progress,
	stage,
	store,
	viewport,
}: ReaderScrollEngineOptions) {
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
	const snapModel = createReaderSnapModel(compiled.snapPoints);
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
	const animationPlan = compileReaderAnimationPlan(compiled, viewport);
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
	const fragmentAnimationValues = createAnimationValues();
	const nodeAnimationValues = createAnimationValues();
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
	const ensureNearbyBlocksRendered = (anchors: Anchor[]) => {
		const blockIds = anchors
			.map((anchor) => anchor.block.id)
			.sort(
				(first, second) =>
					(compiled.anchorIndexByBlockId[first] ?? 0) -
					(compiled.anchorIndexByBlockId[second] ?? 0),
			);
		const key = blockIds.join("|");
		if (key === renderedBlockIdsKey) return;
		renderedBlockIdsKey = key;
		logReaderDiagnostic("render window changed", {
			active: anchors.map((anchor) => anchor.block.id),
			mounted: blockIds,
		});
		store.getState().scroll.setRenderedBlockIds(blockIds);
		window.requestAnimationFrame(requestPaint);
	};
	const navigationMotion = createReaderNavigationMotion(
		compiled,
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
		const segmentIndex = compiled.segmentIndexByBlockId[anchor.block.id];
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
		const anchor = compiled.anchorsByBlockId[progress.blockId];
		if (!anchor) return;
		const segmentIndex = compiled.segmentIndexByBlockId[anchor.block.id];
		const segment = compiled.segments[segmentIndex ?? -1];
		if (!segment) return;
		commitAnimations(
			getCompletedAnimationIds(
				animationPlan,
				anchor.block.id,
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
	) => {
		restingStateByBlockId.delete(anchor.block.id);
		const element = domRegistry.blockElementById.get(anchor.block.id);
		if (!element) return;
		if (
			evaluateBlockAnimation(
				animationPlan,
				anchor.block.id,
				segment,
				segmentProgress,
				committedAnimationIds,
				frameTimeMs,
				blockAnimationValues,
			)
		) {
			writeAnimationValues(element, blockAnimationValues);
		}

		if (animationDetail === "blocks-only") return;
		if (animationDetail === "full") {
			commitAnimations(
				getCompletedAnimationIds(
					animationPlan,
					anchor.block.id,
					segment,
					segmentProgress,
				),
			);
		}

		for (const fragmentId of animationPlan.animatedFragmentIdsByBlockId.get(
			anchor.block.id,
		) ?? []) {
			const fragmentElement = domRegistry.fragmentElementById.get(fragmentId);
			if (!fragmentElement) continue;
			if (
				evaluateFragmentAnimation(
					animationPlan,
					fragmentId,
					segment,
					anchor.block.id,
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
			anchor.block.id,
		) ?? []) {
			const nodeElement = domRegistry.nodeElementById.get(nodeId);
			if (
				nodeElement &&
				evaluateNodeAnimation(
					animationPlan,
					nodeId,
					segment,
					anchor.block.id,
					segmentProgress,
					committedAnimationIds,
					frameTimeMs,
					nodeAnimationValues,
				)
			) {
				writeAnimationValues(nodeElement, nodeAnimationValues);
			}
		}
	};

	const paintRestingAnchor = (
		anchor: Anchor,
		progress: 0 | 1,
		frameTimeMs: number,
		animationDetail: "blocks-only" | "full",
	) => {
		const segmentIndex =
			progress === 1
				? compiled.transitionOutOfByBlockId[anchor.block.id]
				: compiled.transitionIntoByBlockId[anchor.block.id];
		if (segmentIndex === undefined) return;
		const segment = compiled.segments[segmentIndex];
		if (!segment || segment.type !== "transition") return;
		const revision = domRegistry.getRevision();
		const previous = restingStateByBlockId.get(anchor.block.id);
		if (
			!animationPlan.ambientBlockIds.has(anchor.block.id) &&
			previous?.progress === progress &&
			previous.revision === revision
		)
			return;
		paintAnchorFrame(anchor, segment, progress, frameTimeMs, animationDetail);
		restingStateByBlockId.set(anchor.block.id, { progress, revision });
	};

	const saveSettledPosition = (
		activeAnchor: Anchor,
		segment: TimelineSegment,
		segmentProgress: number,
	) => {
		settledProgressSaver.schedule(
			activeAnchor.block.id,
			getSavedInnerProgress(activeAnchor, segment, segmentProgress),
		);
	};

	const publishLocation = (anchor: Anchor, segmentIndex: number) => {
		statePublisher.publish(anchor, segmentIndex);
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
		const camera = getSegmentCamera(segment, segmentProgress, viewport);
		applyCameraTransform(
			viewport.width / 2 - camera.x,
			viewport.height / 2 - camera.y,
		);
		paintProgress(scroll, segment, segmentProgress);

		const framePlan = framePlans[index];
		if (!framePlan) return;
		const initialTransitionActive =
			compiled.startsWithTransition &&
			segment.type === "transition" &&
			segment.index === 0;
		const visibleAnchors = initialTransitionActive
			? framePlan.visibleAnchors
			: viewportVisibility.getVisibleAnchors(camera, framePlan.visibleAnchors);
		const nearbyAnchors = initialTransitionActive
			? visibleAnchors
			: viewportVisibility.getNearbyAnchors(
					camera,
					framePlan.visibleAnchors,
					lightweightTravelActive ? 1.25 : 0.5,
				);
		ensureNearbyBlocksRendered(nearbyAnchors);
		paintVisibility(
			visibleAnchors,
			framePlan.foregroundBlockIds,
			framePlan.activeAnchorIndex,
		);
		const reducedAnimations =
			lightweightTravelActive ||
			animationFramePolicy.isReduced(scroll, frameTimeMs);
		const animationDetail = reducedAnimations ? "blocks-only" : "full";
		animationMonitor.update(
			visibleAnchors,
			reducedAnimations,
			reducedAnimations ? "fast-scroll" : "full",
		);
		const activeAnchor = getSegmentAnchor(segment, segmentProgress);
		for (const anchor of visibleAnchors) {
			paintFixedFragments(anchor, activeAnchor, segment, segmentProgress);
			if (framePlan.paintedBlockIds.has(anchor.block.id)) {
				paintAnchorFrame(
					anchor,
					segment,
					segmentProgress,
					frameTimeMs,
					animationDetail,
				);
				continue;
			}
			const anchorIndex = compiled.anchorIndexByBlockId[anchor.block.id];
			paintRestingAnchor(
				anchor,
				framePlan.activeAnchorIndex !== undefined &&
					anchorIndex !== undefined &&
					anchorIndex < framePlan.activeAnchorIndex
					? 1
					: 0,
				frameTimeMs,
				animationDetail,
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
				visibleAnchors.map((anchor) => anchor.block.id),
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

	const getRestoreTarget = () => {
		const pendingRestoreBlockId = store.getState().scroll.pendingRestoreBlockId;
		if (
			!pendingRestoreBlockId &&
			!progress.blockId &&
			compiled.startsWithTransition
		) {
			return 0;
		}
		const anchor = pendingRestoreBlockId
			? compiled.anchorsByBlockId[pendingRestoreBlockId]
			: progress.blockId
				? compiled.anchorsByBlockId[progress.blockId]
				: compiled.anchors[0];
		if (pendingRestoreBlockId && anchor) {
			store.getState().scroll.setPendingRestoreBlockId(null);
		}
		if (!anchor) return 0;
		return pendingRestoreBlockId
			? getReadingStart(anchor)
			: getReadingStart(anchor) +
					getReadingLength(anchor, viewport) * progress.innerProgress;
	};

	const capturePosition = () => {
		const scroll = driver.getScroll();
		const segment =
			compiled.segments[
				resolveSegmentIndex(compiled, scroll, previousScroll, currentIndex)
			];
		if (!segment) return;
		const segmentProgress = getSegmentProgress(segment, scroll);
		const activeAnchor = getSegmentAnchor(segment, segmentProgress);
		statePublisher.flush();
		store
			.getState()
			.progress.savePosition(
				activeAnchor.block.id,
				getSavedInnerProgress(activeAnchor, segment, segmentProgress),
			);
	};

	const start = () => {
		const target = getRestoreTarget();
		restoreDerivedCommittedAnimations();
		driver.setScroll(target);
		previousScroll = target;
		currentIndex = compiled.segmentIndexByBlockId[progress.blockId ?? ""] ?? 0;
		renderReaderAtScroll(target, performance.now());
		driver.setUpdateListener(requestPaint);
		window.addEventListener("scroll", requestPaint, { passive: true });
		logReaderDiagnostic("native scroll listener attached");
		const inputBindings = attachReaderInputBindings(
			compiled.totalScroll,
			driver,
			snapModel,
			navigationMotion.scrollToTimelineEdge,
		);
		cancelPendingSnap = inputBindings.cancelPendingSnap;
		store.getState().scroll.setApi({
			capturePosition,
			repaint: requestPaint,
			scrollToBlock: navigationMotion.scrollToBlock,
		});
		onReady();
		return inputBindings.cleanup;
	};

	const cleanupInput = start();

	return () => {
		logReaderDiagnostic("scroll engine destroyed");
		cleanupInput();
		driver.setUpdateListener(null);
		window.removeEventListener("scroll", requestPaint);
		window.cancelAnimationFrame(animationFrame ?? 0);
		statePublisher.flush();
		statePublisher.cancel();
		debugPublisher.cancel();
		settledProgressSaver.cancel();
		domRegistry.disconnect();
		driver.cleanup();
		navigationMotion.cleanup();
		store.getState().scroll.setApi(null);
	};
}
