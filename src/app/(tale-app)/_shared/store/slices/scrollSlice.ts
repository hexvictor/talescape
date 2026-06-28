import type { StateCreator } from "zustand/vanilla";
import type { Direction, ReaderScrollTargetOptions } from "../../types";
import type { TaleReaderState } from "../createTaleReaderStore";

/**
 * Checks whether two rendered block windows contain the same block ids.
 *
 * @param left - Previous rendered block ids.
 * @param right - Next rendered block ids.
 * @returns Whether both windows are identical.
 *
 * @example
 * const unchanged = blockIdsMatch(previousIds, nextIds);
 */
function blockIdsMatch(left: string[], right: string[]): boolean {
	if (left.length !== right.length) return false;
	return left.every((id, index) => id === right[index]);
}

export type ReaderScrollApi = {
	capturePosition: () => void;
	repaint: () => void;
	scrollToBlock: (blockId: string, opts?: ReaderScrollTargetOptions) => void;
};

export type ScrollSlice = {
	scroll: {
		api: ReaderScrollApi | null;
		cue: Direction | null;
		pendingRestoreBlockId: string | null;
		renderRevision: number;
		renderedBlockIds: string[];
		isApiCurrent: (api: ReaderScrollApi) => boolean;
		setApi: (api: ReaderScrollApi | null) => void;
		setCue: (direction: Direction | null) => void;
		setPendingRestoreBlockId: (blockId: string | null) => void;
		setRenderedBlockIds: (blockIds: string[]) => void;
	};
};

/**
 * Creates imperative scroll ownership and render-window state for one reader.
 *
 * The API contains stable engine commands; frame-by-frame scroll values remain
 * outside Zustand to avoid React subscriptions during camera movement.
 *
 * @returns The initialized reader scroll slice.
 */
export const createScrollSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	ScrollSlice
> = (set) => {
	let currentApi: ReaderScrollApi | null = null;
	const stableApi: ReaderScrollApi = {
		capturePosition: () => currentApi?.capturePosition(),
		repaint: () => currentApi?.repaint(),
		scrollToBlock: (blockId, opts) => currentApi?.scrollToBlock(blockId, opts),
	};
	return {
		scroll: {
			api: stableApi,
			cue: null,
			isApiCurrent: (api) => currentApi === api,
			pendingRestoreBlockId: null,
			renderRevision: 0,
			renderedBlockIds: [],
			setApi: (api) => {
				currentApi = api;
			},
			setCue: (cue) => set((state) => ({ scroll: { ...state.scroll, cue } })),
			setPendingRestoreBlockId: (pendingRestoreBlockId) =>
				set((state) => ({
					scroll: { ...state.scroll, pendingRestoreBlockId },
				})),
			setRenderedBlockIds: (renderedBlockIds) =>
				set((state) => {
					if (blockIdsMatch(state.scroll.renderedBlockIds, renderedBlockIds)) {
						return state;
					}
					return {
						scroll: {
							...state.scroll,
							renderRevision: state.scroll.renderRevision + 1,
							renderedBlockIds,
						},
					};
				}),
		},
	};
};
