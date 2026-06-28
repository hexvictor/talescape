import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

export type ContentsSlice = {
	contents: {
		open: boolean;
		panelWidthPx: number;
		setPanelWidthPx: (width: number) => void;
		toggleOpen: () => void;
	};
};

/**
 * Creates the reader contents sidebar slice.
 *
 * @param set - Zustand state setter.
 * @returns Contents sidebar state and actions.
 *
 * @example
 * const slice = createContentsSlice(set, get, api);
 */
export const createContentsSlice: StateCreator<
	TaleReaderState,
	[],
	[],
	ContentsSlice
> = (set) => ({
	contents: {
		open: false,
		panelWidthPx: 360,
		setPanelWidthPx: (panelWidthPx) =>
			set((state) => ({ contents: { ...state.contents, panelWidthPx } })),
		toggleOpen: () =>
			set((state) => ({
				contents: { ...state.contents, open: !state.contents.open },
			})),
	},
});
