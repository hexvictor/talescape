"use client";

import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createReaderStore";

type ReaderStore = StoreApi<TaleReaderState>;

type Args = {
	store: ReaderStore;
	delayMs: number;
};

export type ActiveBlockProgressSyncApi = {
	queueBlockSeenFromScroll: (blockId: number) => void;
	clearQueuedBlock: () => void;
	cleanup: () => void;
};

/**
 * ScrollTrigger can fire many times while smooth scrolling settles.
 * This helper debounces those events before updating navigation/progress.
 */
export function createActiveBlockProgressSync({
	store,
	delayMs,
}: Args): ActiveBlockProgressSyncApi {
	let queuedTimerId: number | null = null;
	let queuedBlockId: number | null = null;

	const clearQueuedBlock = () => {
		if (queuedTimerId != null) {
			window.clearTimeout(queuedTimerId);
			queuedTimerId = null;
		}

		queuedBlockId = null;
	};

	const flushQueuedBlock = () => {
		queuedTimerId = null;

		const blockId = queuedBlockId;
		queuedBlockId = null;

		if (blockId == null) return;

		const state = store.getState();

		if (
			state.progress.isTrackingPaused ||
			!state.reader.isInitialLoadComplete
		) {
			return;
		}

		const block = state.tale.data.content.indexMap.blocksById[blockId];
		if (!block) return;

		if (state.navigation.current?.block.id === blockId) {
			return;
		}

		state.navigation.set(block.id);

		if (!state.progress.isTrackingPaused) {
			state.progress.updateProgressByBlockId(blockId);
		}
	};

	const queueBlockSeenFromScroll = (blockId: number) => {
		const state = store.getState();

		if (
			state.progress.isTrackingPaused ||
			!state.reader.isInitialLoadComplete
		) {
			return;
		}

		queuedBlockId = blockId;

		if (queuedTimerId != null) return;

		queuedTimerId = window.setTimeout(flushQueuedBlock, delayMs);
	};

	return {
		queueBlockSeenFromScroll,
		clearQueuedBlock,
		cleanup: clearQueuedBlock,
	};
}
