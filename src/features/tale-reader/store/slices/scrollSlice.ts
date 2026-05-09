import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createReaderStore";

export type ReaderScrollApi = {
	scrollToBlockId: (
		blockId: number,
		opts?: { duration?: number; navigate?: boolean },
	) => void;
	setPaused: (paused: boolean) => void;
	rebuild: () => void;
	clearPendingActiveBlockUpdate: () => void;
};

export type ScrollSlice = {
	scroll: {
		api: ReaderScrollApi | null;
		setApi: (api: ReaderScrollApi | null) => void;
		clearApi: () => void;
	};
};

export const createScrollSlice =
	(): StateCreator<TaleReaderState, [], [], ScrollSlice> => (set) => ({
		scroll: {
			api: null,
			setApi: (api) =>
				set((state) => ({
					scroll: {
						...state.scroll,
						api,
					},
				})),
			clearApi: () =>
				set((state) => ({
					scroll: {
						...state.scroll,
						api: null,
					},
				})),
		},
	});
