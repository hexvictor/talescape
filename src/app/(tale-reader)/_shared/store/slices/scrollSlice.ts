import type { StateCreator } from "zustand/vanilla";
import type { Direction, ReaderScrollTargetOptions } from "../../types";
import type { TaleReaderState } from "../createReaderStore";

export type ReaderScrollApi = {
	capturePosition: () => void;
	repaint: () => void;
	scrollToBlock: (blockId: string, opts?: ReaderScrollTargetOptions) => void;
};

export type ScrollSlice = {
	scroll: {
		api: ReaderScrollApi | null;
		cue: Direction | null;
		renderRevision: number;
		renderedBlockIds: string[];
		setApi: (api: ReaderScrollApi | null) => void;
		setCue: (direction: Direction | null) => void;
		setRenderedBlockIds: (blockIds: string[]) => void;
	};
};

export const createScrollSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	ScrollSlice
> = (set) => ({
	scroll: {
		api: null,
		cue: null,
		renderRevision: 0,
		renderedBlockIds: [],
		setApi: (api) => set((state) => ({ scroll: { ...state.scroll, api } })),
		setCue: (cue) => set((state) => ({ scroll: { ...state.scroll, cue } })),
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
