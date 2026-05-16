"use client";

import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createReaderStore";
import type { ReaderScrollApi } from "../store/slices/scrollSlice";
import type { ActiveBlockProgressSyncApi } from "./activeBlockProgressSync";
import type { ScrollDriverApi } from "./scrollDriver";
import type { ScrollSnapModelApi } from "./scrollSnapModel";

type ActiveTrackerApi = {
	updateNow: () => void;
};

type Args = {
	store: StoreApi<TaleReaderState>;
	driver: ScrollDriverApi;
	getSnapModel: () => ScrollSnapModelApi | null;
	getProgressSync: () => ActiveBlockProgressSyncApi | null;
	getActiveTracker: () => ActiveTrackerApi | null;
	setProgrammaticScroll: (value: boolean) => void;
	requestStructuralRebuild: () => void;
};

/**
 * Creates the imperative scroll API stored in the reader Zustand slice.
 *
 * @param store - Reader store used to resolve block ids into tale content.
 * @param driver - Scroll driver that performs smooth programmatic movement.
 * @param getSnapModel - Returns the current snap map used to locate block
 * ranges after layout rebuilds.
 * @param getProgressSync - Returns the debounced progress sync queue.
 * @param getActiveTracker - Returns the visible block tracker for immediate
 * updates after non-navigation scrolls.
 *
 * Navigation buttons and other UI do not talk directly to ScrollSmoother. They
 * use this API so progress updates, active block tracking, and rebuild requests
 * all pass through the same engine boundary.
 */
export function createReaderScrollApi({
	store,
	driver,
	getSnapModel,
	getProgressSync,
	getActiveTracker,
	setProgrammaticScroll,
	requestStructuralRebuild,
}: Args): ReaderScrollApi {
	let pendingTargetBlockId: number | null = null;

	const scrollToBlockId: ReaderScrollApi["scrollToBlockId"] = (
		blockId,
		opts,
	) => {
		const { duration = 0.35, navigate = true } = opts ?? {};
		const block =
			store.getState().tale.data.content.indexMap.blocksById[blockId];
		if (!block) return;

		const model = getSnapModel();
		const range =
			model?.getItemByBlockId(block.id) ??
			(() => {
				const element = document.querySelector<HTMLElement>(
					`[data-block-id="${block.id}"]`,
				);
				return element && model ? model.getRangeForElement(element) : null;
			})();
		if (!range) return;

		getProgressSync()?.clearQueuedBlock();

		setProgrammaticScroll(true);
		pendingTargetBlockId = navigate ? blockId : null;

		driver.scrollTo(range.start, {
			duration,
			ease: "power1.inOut",
			onDone: () => {
				const targetBlockId = pendingTargetBlockId;

				setProgrammaticScroll(false);
				pendingTargetBlockId = null;

				if (navigate && targetBlockId != null) {
					getProgressSync()?.queueBlockSeenFromScroll(targetBlockId);
					return;
				}

				getActiveTracker()?.updateNow();
			},
		});
	};

	return {
		scrollToBlockId,
		setPaused: (paused) => {
			driver.setPaused(paused);
		},
		rebuild: requestStructuralRebuild,
		clearPendingActiveBlockUpdate: () => {
			getProgressSync()?.clearQueuedBlock();
		},
	};
}
