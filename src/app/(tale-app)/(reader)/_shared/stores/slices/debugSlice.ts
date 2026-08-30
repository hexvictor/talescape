import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

export type DebugSlice = {
	debug: {
		activeSegmentIndex: number;
		open: boolean;
		setActiveSegmentIndex: (index: number) => void;
		toggleOpen: () => void;
	};
};

/**
 * Creates the reader debug and inspector slice.
 *
 * @param set - Zustand state setter.
 * @returns Debug state and actions.
 *
 * @example
 * const slice = createDebugSlice(set, get, api);
 */
export const createDebugSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	DebugSlice
> = (set) => ({
	debug: {
		activeSegmentIndex: -1,
		open: false,
		setActiveSegmentIndex: (activeSegmentIndex) =>
			set((state) => ({
				debug: { ...state.debug, activeSegmentIndex },
			})),
		toggleOpen: () =>
			set((state) => ({
				debug: { ...state.debug, open: !state.debug.open },
			})),
	},
});
