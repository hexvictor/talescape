import type { StateCreator } from "zustand/vanilla";
import {
	READER_INPUT_BINDING_SETTINGS,
	type ReaderInputBindingSettings,
} from "../../scroll-engine/readerInputSettings";
import type { TaleReaderState } from "../createReaderStore";

export type ReaderScrollDebugState = {
	maxPx: number;
	progress: number;
	scrollPx: number;
	viewportHeight: number;
};

export type DebugSlice = {
	debug: {
		inputSettings: ReaderInputBindingSettings;
		scroll: ReaderScrollDebugState;
		setInputSettings: (settings: Partial<ReaderInputBindingSettings>) => void;
		setScrollState: (state: ReaderScrollDebugState) => void;
	};
};

const initialScrollState: ReaderScrollDebugState = {
	maxPx: 0,
	progress: 0,
	scrollPx: 0,
	viewportHeight: 0,
};

export const createDebugSlice =
	(): StateCreator<TaleReaderState, [], [], DebugSlice> => (set, get) => ({
		debug: {
			inputSettings: READER_INPUT_BINDING_SETTINGS,
			scroll: initialScrollState,
			setInputSettings: (settings) => {
				set((state) => ({
					debug: {
						...state.debug,
						inputSettings: {
							...state.debug.inputSettings,
							...settings,
						},
					},
				}));
			},
			setScrollState: (next) => {
				const current = get().debug.scroll;
				if (
					Math.abs(current.scrollPx - next.scrollPx) < 0.5 &&
					Math.abs(current.maxPx - next.maxPx) < 0.5 &&
					Math.abs(current.viewportHeight - next.viewportHeight) < 0.5 &&
					Math.abs(current.progress - next.progress) < 0.001
				) {
					return;
				}

				set((state) => ({
					debug: {
						...state.debug,
						scroll: next,
					},
				}));
			},
		},
	});
