import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createReaderStore";

export type UiSlice = {
	ui: {
		isDebugEnabled: boolean;
		isVisible: boolean;

		hide: () => void;
		show: () => void;
		toggleVisibility: () => void;
		toggleDebug: () => void;
	};
};

export const createUiSlice =
	(): StateCreator<TaleReaderState, [], [], UiSlice> => (set) => ({
		ui: {
			isDebugEnabled: true,
			isVisible: true,

			hide: () =>
				set((state) => ({
					ui: { ...state.ui, isVisible: false },
				})),

			show: () =>
				set((state) => ({
					ui: { ...state.ui, isVisible: true },
				})),

			toggleVisibility: () =>
				set((state) => ({
					ui: { ...state.ui, isVisible: !state.ui.isVisible },
				})),

			toggleDebug: () =>
				set((state) => ({
					ui: { ...state.ui, isDebugEnabled: !state.ui.isDebugEnabled },
				})),
		},
	});
