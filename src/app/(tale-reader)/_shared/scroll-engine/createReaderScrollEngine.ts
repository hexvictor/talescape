"use client";

import type { RefObject } from "react";
import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createReaderStore";
import type { ReaderScrollApi } from "../store/slices/scrollSlice";
import {
	type ActiveBlockProgressSyncApi,
	createActiveBlockProgressSync,
} from "./activeBlockProgressSync";
import { initActiveBlockTracker } from "./activeBlockTracker";
import { waitForImagesIn } from "./domReadiness";
import {
	type ReaderHubScrollLockApi,
	createReaderHubScrollLock,
} from "./hubScrollLock";
import { type InputBindingsApi, attachInputBindings } from "./inputBindings";
import {
	type LayoutRebuildCoordinatorApi,
	createLayoutRebuildCoordinator,
} from "./layoutRebuildCoordinator";
import {
	type PinnedScrollLayoutApi,
	initPinnedScrollLayout,
} from "./pinnedScrollLayout";
import { createReaderScrollApi } from "./readerScrollApi";
import type { ScrollDriverApi } from "./scrollDriver";
import {
	type ScrollPositionRestorerApi,
	createScrollPositionRestorer,
} from "./scrollPositionRestorer";
import {
	type ScrollSnapModelApi,
	createScrollSnapModel,
} from "./scrollSnapModel";
import { createReaderStructureObserver } from "./structureObserver";
import { attachWindowResizeRebuild } from "./windowResizeBinding";

type LayoutRefreshMode = "initial" | "quiet" | "structural";

export type LayoutRefreshRequest = {
	reason: string;
	mode: LayoutRefreshMode;
	delay?: number;
};

type Args = {
	store: StoreApi<TaleReaderState>;
	wrapperRef: RefObject<HTMLElement | null>;
	driver: ScrollDriverApi;
	getReaderHubOpen: () => boolean;
	setScrollApi: (api: ReaderScrollApi | null) => void;
	clearApi: () => void;
	setIsLayoutReady: (value: boolean) => void;
	setIsInitialLoadComplete: (value: boolean) => void;
	setProgressTrackingPaused: (value: boolean) => void;
};

export type ReaderScrollEngineApi = {
	destroy: () => void;
	isInitialLoadComplete: () => boolean;
	requestLayoutRefresh: (request: LayoutRefreshRequest) => void;
	setHubOpen: (open: boolean) => void;
	start: () => void;
};

/**
 * Creates the reader scroll engine controller.
 *
 * @param store - Zustand reader store used for navigation, progress, and tale
 * structure reads.
 * @param wrapperRef - Ref to the ScrollSmoother wrapper that contains the
 * reader DOM.
 * @param driver - Small adapter over ScrollSmoother and native window scroll.
 *
 * The factory owns DOM-facing state so the React hook can stay focused on
 * lifecycle. It wires layout rebuilds, snap ranges, input bindings, restoration,
 * and active-block tracking into one controller with explicit commands.
 */
export function createReaderScrollEngine({
	store,
	wrapperRef,
	driver,
	getReaderHubOpen,
	setScrollApi,
	clearApi,
	setIsLayoutReady,
	setIsInitialLoadComplete,
	setProgressTrackingPaused,
}: Args): ReaderScrollEngineApi {
	let activeTracker: ReturnType<typeof initActiveBlockTracker> | null = null;
	let detachWindowResize: (() => void) | null = null;
	let hubScrollLock: ReaderHubScrollLockApi | null = null;
	let inputsApi: InputBindingsApi | null = null;
	let isDisposed = false;
	let isProgrammaticScroll = false;
	let layoutCoordinator: LayoutRebuildCoordinatorApi | null = null;
	let pinnedScrollLayout: PinnedScrollLayoutApi | null = null;
	let progressSync: ActiveBlockProgressSyncApi | null = null;
	let restorer: ScrollPositionRestorerApi | null = null;
	let scrollSnapModel: ScrollSnapModelApi | null = null;
	let structureObserver: ReturnType<
		typeof createReaderStructureObserver
	> | null = null;

	/**
	 * Pauses or resumes user input when the reader hub opens.
	 *
	 * The hub is not a layout phase, but it needs the same scroll pause behavior
	 * so keyboard/touch/wheel navigation does not fight the overlay UI.
	 */
	const setHubOpen = (open: boolean) => {
		hubScrollLock?.applyHubOpenState(open);
	};

	/**
	 * Public entry point for layout-measurement work.
	 *
	 * @param request - Describes why the layout is being rebuilt and whether the
	 * refresh should preserve the visible scroll position or run the full
	 * structural rebuild sequence.
	 */
	const requestLayoutRefresh = (request: LayoutRefreshRequest) => {
		if (request.mode === "quiet") {
			layoutCoordinator?.refreshVisibleStructure(request.reason);
			return;
		}

		layoutCoordinator?.scheduleStructuralRebuild(
			request.delay ?? 0,
			request.reason,
		);
	};

	/**
	 * Starts GSAP, observers, tracking, and the initial layout build.
	 *
	 * Initial images are awaited because image dimensions affect pinned section
	 * distances and snap ranges.
	 */
	const start = () => {
		isDisposed = false;

		setIsLayoutReady(false);
		setIsInitialLoadComplete(false);
		setProgressTrackingPaused(true);

		driver.init({
			wrapper: "#smooth-wrapper",
			content: "#smooth-content",
		});

		pinnedScrollLayout = initPinnedScrollLayout();

		scrollSnapModel = createScrollSnapModel({
			pinnedMeta: pinnedScrollLayout.pinnedMeta,
			pinnedSTBySection: pinnedScrollLayout.pinnedSTBySection,
		});

		progressSync = createActiveBlockProgressSync({
			store,
			delayMs: 120,
		});

		inputsApi = attachInputBindings({
			driver,
			getSettings: () => store.getState().debug.inputSettings,
			model: scrollSnapModel,
		});

		hubScrollLock = createReaderHubScrollLock({
			driver,
			getInputBindings: () => inputsApi,
			isLayoutRebuildRunning: () =>
				layoutCoordinator?.isStructuralRebuildRunning() ?? false,
		});

		structureObserver = createReaderStructureObserver({
			wrapperRef,
			onResize: () => {
				if (layoutCoordinator?.isQuietRefreshRunning()) return;
				requestLayoutRefresh({
					reason: "resize-observer",
					mode: "structural",
					delay: 180,
				});
			},
		});

		restorer = createScrollPositionRestorer({
			store,
			driver,
			getSnapModel: () => scrollSnapModel,
			setProgrammaticScroll: (value) => {
				isProgrammaticScroll = value;
			},
			rememberCurrentBlock: (blockId) => {
				activeTracker?.rememberCurrentBlock(blockId);
			},
		});

		layoutCoordinator = createLayoutRebuildCoordinator({
			store,
			driver,
			restorer,
			structureObserver,
			getReaderHubOpen,
			getInputBindings: () => inputsApi,
			getPinnedLayout: () => pinnedScrollLayout,
			getSnapModel: () => scrollSnapModel,
			getActiveTracker: () => activeTracker,
			setIsLayoutReady,
			setIsInitialLoadComplete,
			setProgressTrackingPaused,
			clearPendingActiveBlockUpdate: () => {
				progressSync?.clearQueuedBlock();
			},
			isDisposed: () => isDisposed,
		});

		activeTracker = initActiveBlockTracker({
			model: scrollSnapModel,
			getScroll: driver.getScroll,
			onScrollStateChange: store.getState().debug.setScrollState,
			onVisibleBlockChange: (blockId) => {
				progressSync?.queueBlockSeenFromScroll(blockId);
			},
			shouldTrack: () =>
				!isProgrammaticScroll &&
				!layoutCoordinator?.isStructuralRebuildRunning(),
		});

		structureObserver.observeStructureElements();

		setScrollApi(
			createReaderScrollApi({
				store,
				driver,
				getSnapModel: () => scrollSnapModel,
				getProgressSync: () => progressSync,
				getActiveTracker: () => activeTracker,
				setProgrammaticScroll: (value) => {
					isProgrammaticScroll = value;
				},
				requestStructuralRebuild: () => {
					requestLayoutRefresh({
						reason: "external",
						mode: "structural",
						delay: 0,
					});
				},
			}),
		);

		setHubOpen(getReaderHubOpen());

		void waitForImagesIn(wrapperRef.current).then(() => {
			if (isDisposed) return;

			layoutCoordinator?.markInitialAssetsReady();
			requestLayoutRefresh({
				reason: "initial-load",
				mode: "initial",
				delay: 0,
			});
		});

		detachWindowResize = attachWindowResizeRebuild(() => {
			requestLayoutRefresh({
				reason: "window-resize",
				mode: "structural",
				delay: 180,
			});
		});
	};

	/**
	 * Tears down GSAP and engine-owned observers so old reader pages cannot keep
	 * responding to scroll, resize, or progress events.
	 */
	const destroy = () => {
		isDisposed = true;

		detachWindowResize?.();
		detachWindowResize = null;

		clearApi();
		setIsLayoutReady(false);
		setIsInitialLoadComplete(false);
		setProgressTrackingPaused(false);

		layoutCoordinator?.cleanup();
		layoutCoordinator = null;

		progressSync?.cleanup();
		progressSync = null;

		structureObserver?.cleanup();
		structureObserver = null;

		activeTracker?.cleanup();
		activeTracker = null;

		inputsApi?.cleanup();
		inputsApi = null;

		hubScrollLock?.cleanup();
		hubScrollLock = null;

		scrollSnapModel?.cleanup();
		scrollSnapModel = null;

		restorer = null;

		pinnedScrollLayout?.cleanup();
		pinnedScrollLayout = null;

		driver.cleanup();
	};

	return {
		destroy,
		isInitialLoadComplete: () =>
			layoutCoordinator?.isInitialLoadComplete() ?? false,
		requestLayoutRefresh,
		setHubOpen,
		start,
	};
}
