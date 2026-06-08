"use client";

import { gsap } from "gsap";
import type { StoreApi } from "zustand";
import {
	getBlockStyle,
	getFragmentStyle,
	writeAnimationStyle,
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
	ReaderLocation,
	SavedReaderProgress,
	TimelineSegment,
	ViewportSize,
} from "../types";
import { getFragmentCommitThreshold } from "./fragmentCommitment";
import { attachReaderInputBindings } from "./inputBindings";
import { createProgressPainter } from "./progressPainter";
import { getSavedInnerProgress } from "./progressPersistence";
import {
	getAdjacentAnchors,
	getRenderWindowBlockIds,
	getUniqueAnchors,
	paintVisibleAnchors,
} from "./readerVisibility";
import type { ReaderScrollDriver } from "./scrollDriver";
import { createReaderSnapModel } from "./scrollSnapModel";

type ReaderScrollEngineOptions = {
	compiled: CompiledReader;
	driver: ReaderScrollDriver;
	onReady: () => void;
	progress: SavedReaderProgress;
	stage: HTMLDivElement;
	store: StoreApi<TaleReaderState>;
	viewport: ViewportSize;
};

const renderOverscanBlocks = 1;

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
	let saveTimer: number | null = null;
	let currentIndex = 0;
	let currentBlockId: string | null = null;
	let previousScroll = 0;
	let renderedBlockIdsKey = "";
	const committedFragmentIds = new Set(progress.committedFragmentIds);
	const snapModel = createReaderSnapModel(compiled.snapPoints);
	const progressRoot = stage.parentElement;
	const paintProgress = createProgressPainter(progressRoot, compiled);

	const blockElement = (blockId: string) =>
		stage.querySelector<HTMLElement>(`[data-reader-block-id="${blockId}"]`);
	const ensureNearbyBlocksRendered = (anchors: Anchor[]) => {
		const blockIds = getRenderWindowBlockIds(
			compiled,
			anchors,
			renderOverscanBlocks,
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

	/**
	 * Applies the current camera transform to the reader stage through GSAP.
	 *
	 * @param x - The horizontal stage translation in pixels.
	 * @param y - The vertical stage translation in pixels.
	 * @returns Nothing.
	 *
	 * @example
	 * applyCameraTransform(120, -40);
	 */
	const applyCameraTransform = (x: number, y: number): void => {
		gsap.set(stage, {
			force3D: true,
			x,
			y,
		});
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

	const paintAnchor = (
		anchor: Anchor,
		segment: TimelineSegment,
		segmentProgress: number,
	) => {
		const element = blockElement(anchor.block.id);
		if (!element) return;
		writeAnimationStyle(
			element,
			getBlockStyle(anchor.block, segment, segmentProgress),
		);
		for (const fragment of anchor.block.fragments) {
			if (
				fragment.resolvedScrollAnimationPlayback === "commitOnComplete" &&
				((segment.type === "reading" &&
					segment.anchor.block.id === anchor.block.id &&
					segmentProgress >= getFragmentCommitThreshold(fragment)) ||
					(segment.type === "pause" &&
						segment.anchor.block.id === anchor.block.id &&
						segment.pauseType === "end") ||
					(segment.type === "transition" &&
						segment.from.block.id === anchor.block.id))
			) {
				commitFragments([fragment.id]);
			}
			const fragmentElement =
				element.querySelector<HTMLElement>(
					`[data-reader-fragment-id="${fragment.id}"]`,
				) ??
				progressRoot?.querySelector<HTMLElement>(
					`[data-reader-fixed-block-id="${anchor.block.id}"] [data-reader-fragment-id="${fragment.id}"]`,
				);
			if (!fragmentElement) continue;
			writeAnimationStyle(
				fragmentElement,
				getFragmentStyle(fragment, segment, anchor.block.id, segmentProgress, {
					committed: committedFragmentIds.has(fragment.id),
				}),
			);
		}
	};

	const paintRestingAnchor = (anchor: Anchor, progress: 0 | 1) => {
		const segmentIndex =
			progress === 1
				? compiled.transitionOutOfByBlockId[anchor.block.id]
				: compiled.transitionIntoByBlockId[anchor.block.id];
		if (segmentIndex === undefined) return;
		const segment = compiled.segments[segmentIndex];
		if (!segment || segment.type !== "transition") return;
		paintAnchor(anchor, segment, progress);
	};

	const saveSettledPosition = (
		activeAnchor: Anchor,
		segment: TimelineSegment,
		segmentProgress: number,
	) => {
		window.clearTimeout(saveTimer ?? undefined);
		saveTimer = window.setTimeout(() => {
			store
				.getState()
				.progress.savePosition(
					activeAnchor.block.id,
					getSavedInnerProgress(activeAnchor, segment, segmentProgress),
				);
		}, 280);
	};

	const publishLocation = (anchor: Anchor, segmentIndex: number) => {
		if (currentBlockId === anchor.block.id) return;
		currentBlockId = anchor.block.id;
		const location: ReaderLocation = {
			blockId: anchor.block.id,
			branchId: anchor.branch.id,
			entryId: anchor.entry.id,
			pageId: anchor.page.id,
			partId: anchor.part.id,
			segmentIndex,
		};
		store.getState().navigation.setCurrent(location, anchor);
		store.getState().progress.markLocationReached(location);
	};

	const renderAt = (scroll: number) => {
		countReaderDiagnostic("renderAt()", {
			currentBlockId,
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
		if (store.getState().debug.activeSegmentIndex !== index) {
			store.getState().debug.setActiveSegmentIndex(index);
		}
		const segmentProgress = getSegmentProgress(segment, scroll);
		const camera = getSegmentCamera(segment, segmentProgress, viewport);
		applyCameraTransform(
			viewport.width / 2 - camera.x,
			viewport.height / 2 - camera.y,
		);
		paintProgress(scroll, segment, segmentProgress);

		const paintedAnchors =
			segment.type === "transition"
				? [segment.from, segment.to]
				: [segment.anchor];
		const visibleAnchors =
			segment.type === "transition"
				? getUniqueAnchors([segment.from, segment.to])
				: getAdjacentAnchors(compiled, segment.anchor);
		const paintedBlockIds = new Set(
			paintedAnchors.map((anchor) => anchor.block.id),
		);
		const activeIndex =
			segment.type === "transition"
				? compiled.anchorIndexByBlockId[segment.from.block.id]
				: compiled.anchorIndexByBlockId[segment.anchor.block.id];
		ensureNearbyBlocksRendered(visibleAnchors);
		const foregroundBlockIds =
			segment.type === "transition"
				? new Set([segment.from.block.id, segment.to.block.id])
				: new Set([segment.anchor.block.id]);
		paintVisibleAnchors(
			stage,
			progressRoot,
			visibleAnchors,
			foregroundBlockIds,
		);
		for (const anchor of visibleAnchors) {
			if (paintedBlockIds.has(anchor.block.id)) {
				paintAnchor(anchor, segment, segmentProgress);
				continue;
			}
			const anchorIndex = compiled.anchorIndexByBlockId[anchor.block.id];
			paintRestingAnchor(
				anchor,
				activeIndex !== undefined &&
					anchorIndex !== undefined &&
					anchorIndex < activeIndex
					? 1
					: 0,
			);
		}

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
			renderAt(driver.getScroll());
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
		renderAt(target);
		driver.setUpdateListener(requestPaint);
		window.addEventListener("scroll", requestPaint, { passive: true });
		logReaderDiagnostic("native scroll listener attached");
		const cleanupInput = attachReaderInputBindings(
			compiled.totalScroll,
			driver,
			snapModel,
		);
		store.getState().scroll.setApi({
			capturePosition,
			repaint: requestPaint,
			scrollToBlock: (blockId, options) => {
				const anchor = compiled.anchorsByBlockId[blockId];
				if (!anchor) return;
				const targetScroll =
					options?.atChoiceEnd && anchor.block.isChoiceBlock
						? getReadingStart(anchor) + getReadingLength(anchor, viewport)
						: anchor.scroll;
				driver.scrollTo(targetScroll, "smooth", {
					duration: options?.duration ?? 0.42,
				});
			},
		});
		onReady();
		return cleanupInput;
	};

	const cleanupInput = start();

	return () => {
		logReaderDiagnostic("scroll engine destroyed");
		cleanupInput();
		driver.setUpdateListener(null);
		window.removeEventListener("scroll", requestPaint);
		window.cancelAnimationFrame(animationFrame ?? 0);
		window.clearTimeout(saveTimer ?? undefined);
		driver.cleanup();
		store.getState().scroll.setApi(null);
	};
}
