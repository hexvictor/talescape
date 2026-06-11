"use client";

import type { StoreApi } from "zustand";
import {
	compileReaderAnimationPlan,
	createAnimationValues,
	evaluateBlockAnimation,
	evaluateFragmentAnimation,
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
import { getFragmentCommitThreshold } from "./fragmentCommitment";
import { attachReaderInputBindings } from "./inputBindings";
import { createReaderNavigationMotion } from "./navigationMotion";
import { createProgressPainter } from "./progressPainter";
import { getSavedInnerProgress } from "./progressPersistence";
import { createReaderDebugPublisher } from "./readerDebugPublisher";
import { createReaderDomRegistry } from "./readerDomRegistry";
import { compileReaderFramePlans } from "./readerFramePlan";
import { createReaderStatePublisher } from "./readerStatePublisher";
import {
	createReaderVisibilityPainter,
	getRenderWindowBlockIds,
} from "./readerVisibility";
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

const renderOverscanBlocks = 2;
const travelRenderOverscanBlocks = 4;

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
	const committedFragmentIds = new Set(progress.committedFragmentIds);
	const snapModel = createReaderSnapModel(compiled.snapPoints);
	const progressRoot =
		stage.closest<HTMLElement>("[data-reader-runtime-root='true']") ??
		stage.parentElement;
	const paintProgress = createProgressPainter(progressRoot, compiled);
	const domRegistry = createReaderDomRegistry(progressRoot ?? stage);
	const paintVisibility = createReaderVisibilityPainter(domRegistry);
	const animationPlan = compileReaderAnimationPlan(compiled);
	const framePlans = compileReaderFramePlans(compiled);
	const debugPublisher = createReaderDebugPublisher(store, 100);
	const statePublisher = createReaderStatePublisher(compiled, store, 80, 180);
	const blockAnimationValues = createAnimationValues();
	const fragmentAnimationValues = createAnimationValues();
	const restingStateByBlockId = new Map<
		string,
		{ progress: 0 | 1; revision: number }
	>();
	const commitmentFragmentsByBlockId = new Map(
		compiled.anchors.map((anchor) => [
			anchor.block.id,
			anchor.block.fragments.filter(
				(fragment) =>
					fragment.resolvedScrollAnimationPlayback === "commitOnComplete",
			),
		]),
	);
	const settledProgressSaver = createSettledProgressSaver(
		({ blockId, innerProgress }) => {
			store.getState().progress.savePosition(blockId, innerProgress);
		},
		280,
	);
	const ensureNearbyBlocksRendered = (anchors: Anchor[]) => {
		const currentBlockIds = new Set(
			renderedBlockIdsKey ? renderedBlockIdsKey.split("|") : [],
		);
		if (
			currentBlockIds.size > 0 &&
			anchors.every((anchor) => currentBlockIds.has(anchor.block.id))
		) {
			return;
		}
		const blockIds = getRenderWindowBlockIds(
			compiled,
			anchors,
			lightweightTravelActive
				? travelRenderOverscanBlocks
				: renderOverscanBlocks,
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
	 * Marks one-way fragments as committed and persists newly committed ids.
	 *
	 * @param fragmentIds - The fragment ids that reached their commit threshold.
	 * @returns Nothing.
	 *
	 * @example
	 * commitFragments(["fragment-1"]);
	 */
	const commitFragments = (fragmentIds: string[]): void => {
		const nextIds = fragmentIds.filter((id) => !committedFragmentIds.has(id));
		if (nextIds.length === 0) return;
		for (const id of nextIds) {
			committedFragmentIds.add(id);
		}
		store.getState().progress.commitFragments(nextIds);
	};

	/**
	 * Restores committed fragments that can be derived from saved block progress.
	 *
	 * @returns Nothing.
	 *
	 * @example
	 * restoreDerivedCommittedFragments();
	 */
	const restoreDerivedCommittedFragments = (): void => {
		if (!progress.blockId) return;
		const anchor = compiled.anchorsByBlockId[progress.blockId];
		if (!anchor) return;
		commitFragments(
			anchor.block.fragments
				.filter(
					(fragment) =>
						fragment.resolvedScrollAnimationPlayback === "commitOnComplete" &&
						progress.innerProgress >= getFragmentCommitThreshold(fragment),
				)
				.map((fragment) => fragment.id),
		);
	};

	const paintAnchorFrame = (
		anchor: Anchor,
		segment: TimelineSegment,
		segmentProgress: number,
		allowFragmentCommit = true,
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
				blockAnimationValues,
			)
		) {
			writeAnimationValues(element, blockAnimationValues);
		}

		if (allowFragmentCommit) {
			const newlyCommittedFragmentIds: string[] = [];
			for (const fragment of commitmentFragmentsByBlockId.get(
				anchor.block.id,
			) ?? []) {
				if (
					!committedFragmentIds.has(fragment.id) &&
					((segment.type === "reading" &&
						segment.anchor.block.id === anchor.block.id &&
						segmentProgress >= getFragmentCommitThreshold(fragment)) ||
						(segment.type === "pause" &&
							segment.anchor.block.id === anchor.block.id &&
							segment.pauseType === "end") ||
						(segment.type === "transition" &&
							segment.from.block.id === anchor.block.id))
				) {
					committedFragmentIds.add(fragment.id);
					newlyCommittedFragmentIds.push(fragment.id);
				}
			}
			if (newlyCommittedFragmentIds.length > 0) {
				store.getState().progress.commitFragments(newlyCommittedFragmentIds);
			}
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
					committedFragmentIds.has(fragmentId),
					fragmentAnimationValues,
				)
			) {
				writeAnimationValues(fragmentElement, fragmentAnimationValues);
			}
		}
	};

	const paintRestingAnchor = (
		anchor: Anchor,
		progress: 0 | 1,
		allowFragmentCommit = true,
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
		if (previous?.progress === progress && previous.revision === revision)
			return;
		paintAnchorFrame(anchor, segment, progress, allowFragmentCommit);
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

	const renderReaderAtScroll = (scroll: number) => {
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
		ensureNearbyBlocksRendered(framePlan.visibleAnchors);
		paintVisibility(framePlan.visibleAnchors, framePlan.foregroundBlockIds);
		for (const anchor of framePlan.visibleAnchors) {
			if (framePlan.paintedBlockIds.has(anchor.block.id)) {
				paintAnchorFrame(
					anchor,
					segment,
					segmentProgress,
					!lightweightTravelActive,
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
				!lightweightTravelActive,
			);
		}
		if (lightweightTravelActive) {
			const activeAnchor = getSegmentAnchor(segment, segmentProgress);
			publishLocation(activeAnchor, index);
			debugPublisher.publish(index);
			previousScroll = scroll;
			return;
		}

		debugPublisher.publish(index);
		const activeAnchor = getSegmentAnchor(segment, segmentProgress);
		publishLocation(activeAnchor, index);
		saveSettledPosition(activeAnchor, segment, segmentProgress);
		previousScroll = scroll;
	};

	const requestPaint = () => {
		countReaderDiagnostic("requestPaint()");
		if (animationFrame !== null) return;
		animationFrame = window.requestAnimationFrame(() => {
			animationFrame = null;
			renderReaderAtScroll(driver.getScroll());
		});
	};

	const getRestoreTarget = () => {
		const anchor = progress.blockId
			? compiled.anchorsByBlockId[progress.blockId]
			: compiled.anchors[0];
		if (!anchor) return 0;
		return (
			getReadingStart(anchor) +
			getReadingLength(anchor, viewport) * progress.innerProgress
		);
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
		restoreDerivedCommittedFragments();
		driver.setScroll(target);
		previousScroll = target;
		currentIndex = compiled.segmentIndexByBlockId[progress.blockId ?? ""] ?? 0;
		renderReaderAtScroll(target);
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
