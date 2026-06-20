import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createTaleStore";

/**
 * Publishes the active timeline segment at a limited frequency while the debug
 * panel is open.
 *
 * @param store - Reader store containing debug state.
 * @param intervalMs - Minimum interval between segment publications.
 * @returns Segment publisher and cleanup function.
 *
 * @example
 * const debugPublisher = createReaderDebugPublisher(store, 100);
 * debugPublisher.publish(segment.index);
 */
export function createReaderDebugPublisher(
	store: StoreApi<TaleReaderState>,
	intervalMs: number,
): {
	cancel: () => void;
	publish: (segmentIndex: number) => void;
} {
	let lastPublishedAt = 0;
	let pendingIndex = -1;
	let timer: number | null = null;

	const flush = (): void => {
		timer = null;
		const debug = store.getState().debug;
		if (!debug.open || debug.activeSegmentIndex === pendingIndex) return;
		lastPublishedAt = performance.now();
		debug.setActiveSegmentIndex(pendingIndex);
	};

	return {
		cancel: () => {
			window.clearTimeout(timer ?? undefined);
			timer = null;
		},
		publish: (segmentIndex) => {
			if (!store.getState().debug.open) return;
			pendingIndex = segmentIndex;
			const elapsed = performance.now() - lastPublishedAt;
			if (elapsed >= intervalMs) {
				flush();
			} else if (timer === null) {
				timer = window.setTimeout(flush, intervalMs - elapsed);
			}
		},
	};
}
