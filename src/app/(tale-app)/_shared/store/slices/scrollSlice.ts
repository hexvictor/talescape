import type { StateCreator } from "zustand/vanilla";
import type { Direction, ReaderScrollTargetOptions } from "../../types";
import type { TaleReaderState } from "../createTaleReaderStore";

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
> = (set) => ({
	scroll: {
		api: null,
		cue: null,
		pendingRestoreBlockId: null,
		renderRevision: 0,
		renderedBlockIds: [],
		setApi: (api) => set((state) => ({ scroll: { ...state.scroll, api } })),
		setCue: (cue) => set((state) => ({ scroll: { ...state.scroll, cue } })),
		setPendingRestoreBlockId: (pendingRestoreBlockId) =>
			set((state) => ({
				scroll: { ...state.scroll, pendingRestoreBlockId },
			})),
		setRenderedBlockIds: (renderedBlockIds) =>
			set((state) => ({
				scroll: {
					...state.scroll,
					renderRevision: state.scroll.renderRevision + 1,
					renderedBlockIds,
				},
			})),
	},
});
