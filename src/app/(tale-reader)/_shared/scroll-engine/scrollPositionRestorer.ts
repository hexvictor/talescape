"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
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
	setProgrammaticScroll: (value: boolean) => void;
	rememberCurrentBlock: (blockId: number | null) => void;
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
	setProgrammaticScroll,
	rememberCurrentBlock,
}: Args): ScrollPositionRestorerApi {
	const getFallbackBlockId = () =>
		store.getState().tale.data.content.bounds.firstBlockId ?? null;

	const findBlockElement = (blockId: number) =>
		document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);

	const getRangeForBlockId = (blockId: number) => {
		const model = getSnapModel();
		const item = model?.getItemByBlockId(blockId);
		if (item) return item;

		const element = findBlockElement(blockId);
		return element ? (model?.getRangeForElement(element) ?? null) : null;
	};

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

		if (!findBlockElement(block.id)) {
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

		const range = getRangeForBlockId(block.id);
		if (!range) {
			if (attempt < 24) {
				ScrollTrigger.refresh();
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

		setProgrammaticScroll(true);
		store.getState().navigation.set(block.id);

		driver.scrollTo(range.start, {
			duration: 0,
			ease: "none",
			onDone: () => {
				setProgrammaticScroll(false);
				rememberCurrentBlock(targetBlockId);
				onDone?.({ blockId: targetBlockId });
			},
		});
	};

	const captureCurrentBlockPosition = (): ViewPositionSnapshot | null => {
		const activeBlock = store.getState().navigation.current?.block;
		if (activeBlock === undefined) return null;

		const range = getRangeForBlockId(activeBlock.id);
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

		if (!findBlockElement(block.id)) {
			onDone?.({ blockId: null });
			return;
		}

		const range = getRangeForBlockId(block.id);
		if (!range) {
			onDone?.({ blockId: null });
			return;
		}

		const targetScroll =
			range.start + (range.end - range.start) * snapshot.scrollProgress;

		setProgrammaticScroll(true);
		store.getState().navigation.set(block.id);
		driver.setScroll(targetScroll);
		ScrollTrigger.update();
		setProgrammaticScroll(false);
		rememberCurrentBlock(block.id);
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
