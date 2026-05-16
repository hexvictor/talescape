"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createReaderStore";
import type { initActiveBlockTracker } from "./activeBlockTracker";
import { afterFrame, afterTwoFrames } from "./frameTiming";
import type { InputBindingsApi } from "./inputBindings";
import type { PinnedScrollLayoutApi } from "./pinnedScrollLayout";
import type { ScrollDriverApi } from "./scrollDriver";
import type {
	ScrollPositionRestorerApi,
	ViewPositionSnapshot,
} from "./scrollPositionRestorer";
import type { ScrollSnapModelApi } from "./scrollSnapModel";
import type { createReaderStructureObserver } from "./structureObserver";

type ActiveBlockTrackerApi = ReturnType<typeof initActiveBlockTracker>;
type StructureObserverApi = ReturnType<typeof createReaderStructureObserver>;
type RebuildMode = "initial" | "normal";

type Args = {
	store: StoreApi<TaleReaderState>;
	driver: ScrollDriverApi;
	restorer: ScrollPositionRestorerApi;
	structureObserver: StructureObserverApi;
	getReaderHubOpen: () => boolean;
	getInputBindings: () => InputBindingsApi | null;
	getPinnedLayout: () => PinnedScrollLayoutApi | null;
	getSnapModel: () => ScrollSnapModelApi | null;
	getActiveTracker: () => ActiveBlockTrackerApi | null;
	setIsLayoutReady: (value: boolean) => void;
	setIsInitialLoadComplete: (value: boolean) => void;
	setProgressTrackingPaused: (value: boolean) => void;
	clearPendingActiveBlockUpdate: () => void;
	isDisposed: () => boolean;
};

export type LayoutRebuildCoordinatorApi = {
	cleanup: () => void;
	isInitialLoadComplete: () => boolean;
	isQuietRefreshRunning: () => boolean;
	isStructuralRebuildRunning: () => boolean;
	markInitialAssetsReady: () => void;
	rebuildNow: () => void;
	refreshVisibleStructure: (reason?: string) => void;
	scheduleStructuralRebuild: (delay?: number, reason?: string) => void;
};

/**
 * Coordinates the reader's layout rebuild phases.
 *
 * ScrollTrigger, pinned sections, snap ranges, and active block tracking all
 * depend on the same DOM measurements. This coordinator keeps their refresh
 * order in one place so resize, initial load, and branch visibility changes do
 * not each invent their own timing.
 */
export function createLayoutRebuildCoordinator({
	store,
	driver,
	restorer,
	structureObserver,
	getReaderHubOpen,
	getInputBindings,
	getPinnedLayout,
	getSnapModel,
	getActiveTracker,
	setIsLayoutReady,
	setIsInitialLoadComplete,
	setProgressTrackingPaused,
	clearPendingActiveBlockUpdate,
	isDisposed,
}: Args): LayoutRebuildCoordinatorApi {
	let rebuildTimer: number | null = null;
	let isInitialLoadComplete = false;
	let isStructuralRebuildRunning = false;
	let hasPendingStructuralRebuild = false;
	let initialAssetsReady = false;
	let isQuietRefreshRunning = false;
	let rebuildSnapshot: ViewPositionSnapshot | null = null;

	/**
	 * Clears a scheduled rebuild timer so a newer rebuild request can replace it.
	 */
	const clearRebuildTimer = () => {
		if (rebuildTimer != null) {
			window.clearTimeout(rebuildTimer);
			rebuildTimer = null;
		}
	};

	/**
	 * Synchronizes the visible DOM after React has committed layout changes.
	 *
	 * The extra frames give ScrollSmoother and ScrollTrigger a stable DOM before
	 * active block tracking reads the updated snap map.
	 */
	const syncVisibleLayout = () => {
		afterTwoFrames(() => {
			if (isDisposed()) return;

			driver.syncLayout();
			getActiveTracker()?.updateNow();
		});
	};

	/**
	 * Finishes a quiet refresh that preserves scroll without running the full
	 * structural rebuild path.
	 */
	const finishQuietRefresh = (scrollBefore: number) => {
		getSnapModel()?.rebuild();
		getActiveTracker()?.rebuild();
		ScrollTrigger.refresh();
		driver.setScroll(scrollBefore);
		ScrollTrigger.update();

		isStructuralRebuildRunning = false;
		setProgressTrackingPaused(false);

		if (!getReaderHubOpen()) {
			getInputBindings()?.enable();
		}

		getActiveTracker()?.updateNow();

		afterTwoFrames(() => {
			isQuietRefreshRunning = false;

			if (hasPendingStructuralRebuild) {
				hasPendingStructuralRebuild = false;
				runStructuralRebuild("pending", "normal");
			}
		});
	};

	/**
	 * Refreshes visible structure changes that should not disturb the reader.
	 *
	 * Branch choices can mount new sections after the initial load. This path
	 * keeps the current scroll value stable while rebuilding measurements.
	 */
	const refreshVisibleStructure = (_reason = "visible-structure-mounted") => {
		if (!isInitialLoadComplete) return;
		if (isStructuralRebuildRunning) {
			hasPendingStructuralRebuild = true;
			return;
		}

		const scrollBefore = driver.getScroll();

		isQuietRefreshRunning = true;
		isStructuralRebuildRunning = true;
		setProgressTrackingPaused(true);
		getInputBindings()?.disable();
		getInputBindings()?.killTweens(true);
		clearPendingActiveBlockUpdate();

		structureObserver.observeStructureElements();
		getPinnedLayout()?.rebuild({ preserveExisting: true });

		afterFrame(() => {
			driver.setScroll(scrollBefore);
			ScrollTrigger.refresh();
			driver.setScroll(scrollBefore);
			ScrollTrigger.update();

			afterFrame(() => {
				finishQuietRefresh(scrollBefore);
			});
		});
	};

	/**
	 * Completes the first layout build once the saved block has been restored.
	 */
	const finalizeInitialLoad = (restoredBlockId: number | null) => {
		afterTwoFrames(() => {
			if (isDisposed()) return;

			isStructuralRebuildRunning = false;
			isInitialLoadComplete = true;

			if (restoredBlockId != null) {
				getActiveTracker()?.rememberCurrentBlock(restoredBlockId);
			}

			driver.setPaused(false);
			driver.syncLayout();

			setIsLayoutReady(true);
			setIsInitialLoadComplete(true);
			setProgressTrackingPaused(false);

			if (!getReaderHubOpen()) {
				getInputBindings()?.enable();
			}
		});
	};

	/**
	 * Completes a normal rebuild by restoring the captured view snapshot.
	 */
	const finalizeNormalRebuild = (reason: string) => {
		const snapshot = rebuildSnapshot;
		rebuildSnapshot = null;

		const restoreDone = ({ blockId }: { blockId: number | null }) => {
			isStructuralRebuildRunning = false;
			setProgressTrackingPaused(false);
			driver.setPaused(false);

			if (blockId != null) {
				getActiveTracker()?.rememberCurrentBlock(blockId);
			}

			if (!getReaderHubOpen()) {
				getInputBindings()?.enable();
			}

			syncVisibleLayout();
		};

		if (!snapshot) {
			restoreDone({ blockId: null });
			return;
		}

		restorer.restoreSnapshot(snapshot, reason, restoreDone);
	};

	/**
	 * Selects the correct finalization path for initial and normal rebuilds.
	 */
	const finishStructuralRebuild = (reason: string, mode: RebuildMode) => {
		if (mode === "initial") {
			hasPendingStructuralRebuild = false;

			restorer.restoreSavedOrFirstBlock("initial-restore", ({ blockId }) => {
				finalizeInitialLoad(blockId);
			});

			return;
		}

		if (hasPendingStructuralRebuild) {
			hasPendingStructuralRebuild = false;
			runStructuralRebuild("pending", "normal");
			return;
		}

		finalizeNormalRebuild(reason);
	};

	/**
	 * Runs the full structural rebuild used by initial load and resize changes.
	 */
	function runStructuralRebuild(reason: string, mode: RebuildMode) {
		clearRebuildTimer();

		rebuildSnapshot =
			mode === "normal" ? restorer.captureCurrentBlockPosition() : null;

		isStructuralRebuildRunning = true;
		setProgressTrackingPaused(true);
		driver.setPaused(true);
		getInputBindings()?.disable();
		getInputBindings()?.killTweens(true);
		clearPendingActiveBlockUpdate();

		structureObserver.observeStructureElements();
		getPinnedLayout()?.rebuild({ preserveExisting: true });

		afterFrame(() => {
			ScrollTrigger.refresh();
			if (rebuildSnapshot) {
				restorer.restoreSnapshot(rebuildSnapshot, `${reason}-mid-refresh`);
			}

			afterFrame(() => {
				getSnapModel()?.rebuild();
				getActiveTracker()?.rebuild();
				ScrollTrigger.refresh();
				if (rebuildSnapshot) {
					restorer.restoreSnapshot(rebuildSnapshot, `${reason}-post-refresh`);
				}

				afterFrame(() => {
					finishStructuralRebuild(reason, mode);
				});
			});
		});
	}

	/**
	 * Debounces and gates structural rebuild requests from resize and mount events.
	 */
	const scheduleStructuralRebuild = (delay = 180, reason = "scheduled") => {
		const isResizeObserverReason = reason === "resize-observer";

		if (isResizeObserverReason && !isInitialLoadComplete) {
			return;
		}

		if (isStructuralRebuildRunning) {
			if (isResizeObserverReason) return;

			hasPendingStructuralRebuild = true;
			return;
		}

		if (
			!isInitialLoadComplete &&
			(!initialAssetsReady || !store.getState().reader.isStructureMounted)
		) {
			return;
		}

		const mode: RebuildMode = isInitialLoadComplete ? "normal" : "initial";

		clearRebuildTimer();

		rebuildTimer = window.setTimeout(() => {
			runStructuralRebuild(reason, mode);
		}, delay);
	};

	/**
	 * Resets coordinator state during reader unmount.
	 */
	const cleanup = () => {
		clearRebuildTimer();
		isInitialLoadComplete = false;
		hasPendingStructuralRebuild = false;
		initialAssetsReady = false;
		isStructuralRebuildRunning = false;
		isQuietRefreshRunning = false;
		rebuildSnapshot = null;
	};

	return {
		cleanup,
		isInitialLoadComplete: () => isInitialLoadComplete,
		isQuietRefreshRunning: () => isQuietRefreshRunning,
		isStructuralRebuildRunning: () => isStructuralRebuildRunning,
		markInitialAssetsReady: () => {
			initialAssetsReady = true;
		},
		rebuildNow: () => {
			scheduleStructuralRebuild(0, "external");
		},
		refreshVisibleStructure,
		scheduleStructuralRebuild,
	};
}
