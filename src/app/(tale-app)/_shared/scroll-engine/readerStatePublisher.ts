import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createTaleReaderStore";
import type { Anchor, CompiledReader, ReaderLocation } from "../types";

type PendingLocation = {
	anchor: Anchor;
	location: ReaderLocation;
};

/**
 * Coalesces high-frequency reader location changes while preserving every
 * reached location for progress tracking.
 *
 * @param compiled - Compiled route used to include blocks skipped between frames.
 * @param store - Reader store receiving navigation and progress updates.
 * @param publishIntervalMs - Minimum interval between live navigation updates.
 * @param settleDelayMs - Idle delay before the final navigation and progress flush.
 * @returns Location publisher and lifecycle controls.
 *
 * @example
 * const publisher = createReaderStatePublisher(compiled, store, 80, 180);
 * publisher.publish(anchor, segmentIndex);
 */
export function createReaderStatePublisher(
	compiled: CompiledReader,
	store: StoreApi<TaleReaderState>,
	publishIntervalMs: number,
	settleDelayMs: number,
): {
	cancel: () => void;
	flush: () => void;
	publish: (anchor: Anchor, segmentIndex: number) => void;
} {
	const reachedLocationsByBlockId = new Map<string, ReaderLocation>();
	let lastObservedAnchorIndex: number | null = null;
	let lastPublishedAt = 0;
	let publishedBlockId: string | null = null;
	let pending: PendingLocation | null = null;
	let publishTimer: number | null = null;
	let settleTimer: number | null = null;

	const locationForAnchor = (
		anchor: Anchor,
		segmentIndex: number,
	): ReaderLocation => ({
		blockId: anchor.block.id,
		branchId: anchor.branch.id,
		entryId: anchor.entry.id,
		pageId: anchor.page.id,
		partId: anchor.part.id,
		segmentIndex,
	});

	const collectReachedLocations = (
		anchor: Anchor,
		segmentIndex: number,
	): void => {
		const anchorIndex = compiled.anchorIndexByBlockId[anchor.block.id];
		if (anchorIndex === undefined) return;

		if (lastObservedAnchorIndex !== null) {
			const direction = anchorIndex >= lastObservedAnchorIndex ? 1 : -1;
			for (
				let index = lastObservedAnchorIndex;
				index !== anchorIndex + direction;
				index += direction
			) {
				const crossedAnchor = compiled.anchors[index];
				if (!crossedAnchor) continue;
				reachedLocationsByBlockId.set(
					crossedAnchor.block.id,
					locationForAnchor(
						crossedAnchor,
						compiled.segmentIndexByBlockId[crossedAnchor.block.id] ??
							segmentIndex,
					),
				);
			}
		} else {
			reachedLocationsByBlockId.set(
				anchor.block.id,
				locationForAnchor(anchor, segmentIndex),
			);
		}
		lastObservedAnchorIndex = anchorIndex;
	};

	const publishPendingLocation = (): void => {
		publishTimer = null;
		if (!pending || pending.location.blockId === publishedBlockId) return;
		publishedBlockId = pending.location.blockId;
		lastPublishedAt = performance.now();
		store.getState().navigation.setCurrent(pending.location, pending.anchor);
	};

	const flushReachedLocations = (): void => {
		if (reachedLocationsByBlockId.size === 0) return;
		store
			.getState()
			.progress.markLocationsReached([...reachedLocationsByBlockId.values()]);
		reachedLocationsByBlockId.clear();
	};

	const flush = (): void => {
		window.clearTimeout(publishTimer ?? undefined);
		window.clearTimeout(settleTimer ?? undefined);
		publishTimer = null;
		settleTimer = null;
		publishPendingLocation();
		flushReachedLocations();
	};

	return {
		cancel: () => {
			window.clearTimeout(publishTimer ?? undefined);
			window.clearTimeout(settleTimer ?? undefined);
			publishTimer = null;
			settleTimer = null;
		},
		flush,
		publish: (anchor, segmentIndex) => {
			const location = locationForAnchor(anchor, segmentIndex);
			if (pending?.location.blockId === location.blockId) return;
			pending = { anchor, location };
			collectReachedLocations(anchor, segmentIndex);

			const elapsed = performance.now() - lastPublishedAt;
			if (elapsed >= publishIntervalMs) {
				publishPendingLocation();
			} else if (publishTimer === null) {
				publishTimer = window.setTimeout(
					publishPendingLocation,
					publishIntervalMs - elapsed,
				);
			}

			window.clearTimeout(settleTimer ?? undefined);
			settleTimer = window.setTimeout(flush, settleDelayMs);
		},
	};
}
