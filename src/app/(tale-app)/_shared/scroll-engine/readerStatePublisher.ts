import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../../(reader)/_shared/stores/createTaleReaderStore";
import type { Anchor, CompiledReader, ReaderLocation, Tale } from "../types";

type PendingLocation = {
	anchor: Anchor;
	location: ReaderLocation;
};

/**
 * Coalesces high-frequency reader location changes while preserving every
 * reached location for progress tracking.
 *
 * @param compiled - Compiled route used to include scenes skipped between frames.
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
	tale: Tale,
	publishIntervalMs: number,
	settleDelayMs: number,
): {
	cancel: () => void;
	flush: () => void;
	publish: (anchor: Anchor, segmentIndex: number) => void;
} {
	const reachedLocationsByKeyframeId = new Map<string, ReaderLocation>();
	let lastObservedAnchorIndex: number | null = null;
	let lastPublishedAt = 0;
	let publishedLocationKey: string | null = null;
	let pending: PendingLocation | null = null;
	let publishTimer: number | null = null;
	let settleTimer: number | null = null;

	const locationForAnchor = (
		anchor: Anchor,
		segmentIndex: number,
	): ReaderLocation => {
		const directSegment = compiled.segments[segmentIndex];
		let keyframeId =
			directSegment && directSegment.type !== "transition"
				? directSegment.keyframeId
				: null;
		if (!keyframeId) {
			for (let distance = 1; distance < compiled.segments.length; distance++) {
				for (const candidateIndex of [
					segmentIndex - distance,
					segmentIndex + distance,
				]) {
					const candidate = compiled.segments[candidateIndex];
					if (
						candidate &&
						candidate.type !== "transition" &&
						candidate.sceneId === anchor.sceneId
					) {
						keyframeId = candidate.keyframeId;
						break;
					}
				}
				if (keyframeId) break;
			}
		}
		const step = keyframeId ? tale.indexMap.keyframesById[keyframeId] : undefined;
		const pageId = step?.pageId ?? compiled.pages.find((page) => keyframeId && page.keyframeIds.includes(keyframeId))?.id;
		const page = pageId
			? tale.indexMap.pagesById[pageId]
			: undefined;
		return {
			sceneId: anchor.sceneId,
			keyframeId: keyframeId ?? `${anchor.sceneId}:default-keyframe`,
			branchId: anchor.branchId,
			entryId: page?.entryId ?? anchor.entryId,
			pageId: page?.id ?? anchor.pageId,
			partId: page?.partId ?? anchor.partId,
			segmentIndex,
		};
	};

	const collectReachedLocations = (
		anchor: Anchor,
		segmentIndex: number,
	): void => {
		const anchorIndex = compiled.anchorIndexBySceneId[anchor.sceneId];
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
				const location = locationForAnchor(
					crossedAnchor,
					compiled.segmentIndexBySceneId[crossedAnchor.sceneId] ?? segmentIndex,
				);
				reachedLocationsByKeyframeId.set(location.keyframeId, location);
			}
		} else {
			const location = locationForAnchor(anchor, segmentIndex);
			reachedLocationsByKeyframeId.set(location.keyframeId, location);
		}
		lastObservedAnchorIndex = anchorIndex;
	};

	const publishPendingLocation = (): void => {
		publishTimer = null;
		if (!pending) return;
		const locationKey = `${pending.location.sceneId}:${pending.location.keyframeId}`;
		if (locationKey === publishedLocationKey) return;
		publishedLocationKey = locationKey;
		lastPublishedAt = performance.now();
		store.getState().navigation.setCurrent(pending.location, pending.anchor);
	};

	const flushReachedLocations = (): void => {
		if (reachedLocationsByKeyframeId.size === 0) return;
		store
			.getState()
			.progress.markLocationsReached([...reachedLocationsByKeyframeId.values()]);
		reachedLocationsByKeyframeId.clear();
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
			if (
				pending?.location.sceneId === location.sceneId &&
				pending.location.keyframeId === location.keyframeId
			)
				return;
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
