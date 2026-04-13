import type { StateCreator } from "zustand/vanilla";
import type { TaleReaderState } from "../createTaleReaderStore";

export type UiSlice = {
	debugMode: boolean;
	uiVisible: boolean;
	hideUI: () => void;
	showUI: () => void;
	toggleUI: () => void;
	toggleDebugMode: () => void;
};

export const createUiSlice =
	(): StateCreator<TaleReaderState, [], [], UiSlice> => (set) => ({
		debugMode: true,
		uiVisible: true,
		hideUI: () => set({ uiVisible: false }),
		showUI: () => set({ uiVisible: true }),
		toggleUI: () => set((state) => ({ uiVisible: !state.uiVisible })),
		toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
	});
