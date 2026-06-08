import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createReaderStore";

export type ReaderUiVisibilityMode =
	| "all"
	| "hidden"
	| "minimal"
	| "navigation";

export type UiSlice = {
	ui: {
		contentsOpen: boolean;
		hiddenVisibilityMode: Exclude<ReaderUiVisibilityMode, "all">;
		setVisibilityMode: (mode: ReaderUiVisibilityMode) => void;
		toggleContents: () => void;
		toggleReaderUi: () => void;
		visibilityMode: ReaderUiVisibilityMode;
	};
};

/**
 * Creates reader overlay visibility state and actions.
 *
 * @param set - Zustand state updater.
 * @returns The reader UI slice.
 *
 * @example
 * const uiSlice = createUiSlice(set, get, api);
 */
export const createUiSlice: StateCreator<TaleReaderState, [], [], UiSlice> = (
	set,
) => ({
	ui: {
		contentsOpen: false,
		hiddenVisibilityMode: "hidden",
		setVisibilityMode: (visibilityMode) =>
			set((state) => ({
				ui: {
					...state.ui,
					hiddenVisibilityMode:
						visibilityMode === "all"
							? state.ui.hiddenVisibilityMode
							: visibilityMode,
					visibilityMode,
				},
			})),
		toggleContents: () =>
			set((state) => ({
				ui: { ...state.ui, contentsOpen: !state.ui.contentsOpen },
			})),
		toggleReaderUi: () =>
			set((state) => ({
				ui: {
					...state.ui,
					visibilityMode:
						state.ui.visibilityMode === "all"
							? state.ui.hiddenVisibilityMode
							: "all",
				},
			})),
		visibilityMode: "all",
	},
});
