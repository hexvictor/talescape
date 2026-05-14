"use client";

import type { StoreApi } from "zustand";
import type { TaleReaderState } from "../store/createReaderStore";
import { afterFrame } from "./frameTiming";
import type { ScrollDriverApi } from "./scrollDriver";
import type { ScrollSnapModelApi } from "./scrollSnapModel";

type ReaderStore = StoreApi<TaleReaderState>;

export type ViewPositionSnapshot = {
	blockId: number;
	scrollProgress: number;
};

type RestoreResult = {
	blockId: number | null;
};

type Args = {
	store: ReaderStore;
	driver: ScrollDriverApi;
	getSnapModel: () => ScrollSnapModelApi | null;
};

export type ScrollPositionRestorerApi = {
	captureCurrentBlockPosition: () => ViewPositionSnapshot | null;
	restoreSavedOrFirstBlock: (
		reason: string,
		onDone?: (result: RestoreResult) => void,
	) => void;
	restoreSnapshot: (
		snapshot: ViewPositionSnapshot,
		reason: string,
		onDone?: (result: RestoreResult) => void,
	) => void;
};

/**
 * Converts tale block ids into concrete scroll positions.
 * It retries briefly because branch choices can mount their DOM one frame later.
 */
export function createScrollPositionRestorer({
	store,
	driver,
	getSnapModel,
}: Args): ScrollPositionRestorerApi {
	const getFallbackBlockId = () =>
		store.getState().tale.data.content.bounds.firstBlockId ?? null;

	const findBlockElement = (blockId: number) =>
		document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);

	const restoreBlockStart = (
		blockId: number | null,
		reason: string,
		onDone?: (result: RestoreResult) => void,
		attempt = 0,
	) => {
		const fallbackBlockId = getFallbackBlockId();
		const targetBlockId = blockId ?? fallbackBlockId;

		if (targetBlockId == null) {
			onDone?.({ blockId: null });
			return;
		}

		const block =
			store.getState().tale.data.content.indexMap.blocksById[targetBlockId];
		if (!block) {
			onDone?.({ blockId: null });
			return;
		}

		const element = findBlockElement(block.id);
		if (!element) {
			if (attempt < 24) {
				afterFrame(() => {
					restoreBlockStart(targetBlockId, reason, onDone, attempt + 1);
				});
				return;
			}

			if (targetBlockId !== fallbackBlockId) {
				restoreBlockStart(fallbackBlockId, `${reason}-fallback`, onDone);
				return;
			}

			console.warn("[ReaderScrollEngine] restore target never mounted", {
				reason,
				blockId: targetBlockId,
			});
			onDone?.({ blockId: null });
			return;
		}

		const range = getSnapModel()?.getRangeForElement(element);
		if (!range) {
			if (attempt < 24) {
				getSnapModel()?.rebuild();
				afterFrame(() => {
					restoreBlockStart(targetBlockId, reason, onDone, attempt + 1);
				});
				return;
			}

			if (targetBlockId !== fallbackBlockId) {
				restoreBlockStart(fallbackBlockId, `${reason}-fallback`, onDone);
				return;
			}

			console.warn("[ReaderScrollEngine] restore target never mapped", {
				reason,
				blockId: targetBlockId,
			});
			onDone?.({ blockId: null });
			return;
		}

		store.getState().navigation.set(block.id);

		driver.scrollTo(range.start, {
			duration: 0,
			ease: "none",
			onDone: () => {
				onDone?.({ blockId: targetBlockId });
			},
		});
	};

	const captureCurrentBlockPosition = (): ViewPositionSnapshot | null => {
		const activeBlock = store.getState().navigation.current?.block;
		if (activeBlock === undefined) return null;

		const element = findBlockElement(activeBlock.id);
		const range = element ? getSnapModel()?.getRangeForElement(element) : null;
		const scroll = driver.getScroll();
		const scrollProgress =
			range && range.end > range.start
				? Math.max(
						0,
						Math.min(1, (scroll - range.start) / (range.end - range.start)),
					)
				: 0;

		return {
			blockId: activeBlock.id,
			scrollProgress,
		};
	};

	const restoreSnapshot = (
		snapshot: ViewPositionSnapshot,
		reason: string,
		onDone?: (result: RestoreResult) => void,
	) => {
		const block =
			store.getState().tale.data.content.indexMap.blocksById[snapshot.blockId];
		if (!block) {
			onDone?.({ blockId: null });
			return;
		}

		const element = findBlockElement(block.id);
		if (!element) {
			onDone?.({ blockId: null });
			return;
		}

		const range = getSnapModel()?.getRangeForElement(element);
		if (!range) {
			onDone?.({ blockId: null });
			return;
		}

		const targetScroll =
			range.start + (range.end - range.start) * snapshot.scrollProgress;

		store.getState().navigation.set(block.id);
		driver.setScroll(targetScroll);
		onDone?.({ blockId: block.id });
	};

	const restoreSavedOrFirstBlock = (
		reason: string,
		onDone?: (result: RestoreResult) => void,
	) => {
		const savedBlockId = store.getState().progress.data.lastBlockId ?? null;
		restoreBlockStart(savedBlockId, reason, onDone);
	};

	return {
		captureCurrentBlockPosition,
		restoreSavedOrFirstBlock,
		restoreSnapshot,
	};
}
